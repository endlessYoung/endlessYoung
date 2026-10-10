export interface Day {
  date: string;
  count: number;
}

export interface Trace {
  days: Day[];
  frames: number;
  jankRate: number;
  longestStreak: number;
  weekly: number[];
  today: number;
}

const WINDOW = 365;

export function summarize(all: Day[]): Trace {
  const days = all.slice(-WINDOW);
  let frames = 0;
  let streak = 0;
  let longestStreak = 0;
  for (const d of days) {
    if (d.count > 0) {
      frames++;
      streak++;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 0;
    }
  }

  const weekly: number[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weekly.push(days.slice(i, i + 7).reduce((sum, d) => sum + d.count, 0));
  }

  return {
    days,
    frames,
    jankRate: days.length ? (days.length - frames) / days.length : 1,
    longestStreak,
    weekly,
    today: days.at(-1)?.count ?? 0,
  };
}

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

interface CalendarResponse {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: {
          weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
        };
      };
    };
  };
  errors?: { message: string }[];
}

export async function fetchCalendar(login: string, token: string): Promise<Day[]> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'endlessYoung-profile',
    },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
  const json = (await res.json()) as CalendarResponse;
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '));
  const weeks = json.data?.user?.contributionsCollection.contributionCalendar.weeks;
  if (!weeks) throw new Error('GraphQL response has no contribution calendar');
  return weeks.flatMap((w) => w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })));
}
