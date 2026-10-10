export type ThemeName = 'dark' | 'light';

export interface Theme {
  name: ThemeName;
  bg: string;
  panel: string;
  grid: string;
  line: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  ok: string;
  jank: string;
  beam: [string, string, string];
  glow: boolean;
}

export const themes: Record<ThemeName, Theme> = {
  dark: {
    name: 'dark',
    bg: '#07090F',
    panel: '#0C111C',
    grid: '#1C2436',
    line: '#2A3348',
    text: '#F3EEFF',
    muted: '#8B93A7',
    accent: '#C084FC',
    accent2: '#E23CA9',
    ok: '#34D399',
    jank: '#F87171',
    beam: ['#7C5CFC', '#C084FC', '#E23CA9'],
    glow: true,
  },
  light: {
    name: 'light',
    bg: '#0B3D91',
    panel: '#0E4AA8',
    grid: '#3D6FC4',
    line: '#9DB8E8',
    text: '#FFFFFF',
    muted: '#C9D8F5',
    accent: '#FFFFFF',
    accent2: '#FFD166',
    ok: '#A7F3D0',
    jank: '#FF8A80',
    beam: ['#FFFFFF', '#C9D8F5', '#FFD166'],
    glow: false,
  },
};
