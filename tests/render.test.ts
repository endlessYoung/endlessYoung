import { describe, expect, it } from 'vitest';
import { binderTargets, projects } from '../scripts/content';
import { summarize, type Day } from '../scripts/data/contributions';
import type { Post } from '../scripts/data/blog';
import * as agent from '../scripts/svg/agent';
import * as binder from '../scripts/svg/binder';
import * as header from '../scripts/svg/header';
import * as logcat from '../scripts/svg/logcat';
import * as perfetto from '../scripts/svg/perfetto';
import * as services from '../scripts/svg/services';
import * as standby from '../scripts/svg/standby';
import * as tasks from '../scripts/svg/tasks';
import * as zygote from '../scripts/svg/zygote';
import { themes } from '../scripts/theme';
import { expectValidSvg } from './helpers';

const days: Day[] = Array.from({ length: 400 }, (_, i) => ({
  date: new Date(Date.UTC(2025, 8, 1) + i * 86_400_000).toISOString().slice(0, 10),
  count: i % 5 === 0 ? 0 : (i * 7) % 13,
}));
const trace = summarize(days);

const posts: Post[] = [
  { title: 'Binder 驱动 <深入> & 源码分析', link: 'https://example.com/a', date: new Date('2026-10-09T08:00:00Z') },
  { title: '这是一个非常非常长的标题，用来测试截断逻辑是否在三十六个字之后正确地添加省略号以及不会溢出', link: 'https://example.com/b', date: new Date('2026-10-01T08:00:00Z') },
];

for (const theme of Object.values(themes)) {
  describe(`${theme.name} theme`, () => {
    it('header', () => {
      const svg = header.render(theme, { greeting: 'Evening — reading AOSP.', today: 7 });
      expectValidSvg(svg, 1200, 360);
      expect(svg).toContain('commits today: 7');
      expect(svg).toContain('Evening — reading AOSP.');
    });

    it('zygote', () => expectValidSvg(zygote.render(theme), 1200, 300));
    it('services', () => expectValidSvg(services.render(theme), 1200, 420));
    it('agent', () => expectValidSvg(agent.render(theme), 1200, 320));
    it('standby', () => expectValidSvg(standby.render(theme), 1200, 160));

    it('binder buttons', () => {
      for (const target of binderTargets) {
        const svg = binder.render(theme, target);
        expectValidSvg(svg, 380, 120);
        expect(svg).toContain(`transact(${target.id.toUpperCase()})`);
      }
    });

    it('task cards', () => {
      projects.forEach((p, i) => expectValidSvg(tasks.renderCard(theme, p, i), 580, 200));
      expectValidSvg(tasks.renderMore(theme), 1200, 120);
    });

    it('perfetto with data', () => {
      const svg = perfetto.render(theme, trace);
      expectValidSvg(svg, 1200, 300);
      expect(svg).toContain(`Frames: ${trace.frames}`);
      expect(svg).toContain(`Longest streak: ${trace.longestStreak}d`);
    });

    it('perfetto placeholder', () => {
      const svg = perfetto.render(theme, undefined);
      expectValidSvg(svg, 1200, 300);
      expect(svg).toContain('NO TRACE DATA');
    });

    it('logcat with posts', () => {
      const svg = logcat.render(theme, posts);
      expectValidSvg(svg, 1200, 280);
      expect(svg).toContain('&lt;深入&gt; &amp;');
      expect(svg).toContain('…');
      expect(svg).toContain('NEW');
    });

    it('logcat placeholder', () => {
      const svg = logcat.render(theme, undefined);
      expectValidSvg(svg, 1200, 280);
      expect(svg).toContain('feed unavailable');
    });
  });
}
