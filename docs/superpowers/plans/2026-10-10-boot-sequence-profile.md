# endlessYoung OS 开机序列主页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 TypeScript 生成器 + GitHub Actions 产出 10 个板块的深浅双主题 SVG，重写 README 为“开机序列”叙事。

**Architecture:** `scripts/data/*` 负责取数和计算（纯函数 + 少量 IO），`scripts/svg/*` 每个板块导出 `render(theme, data): string` 纯函数，`scripts/build.ts` 组装并写入 `dist/{dark,light}/*.svg` 与 `dist/data/cache.json`。工作流把 `dist/` 强制推送到孤立分支 `output`。

**Tech Stack:** Node 20+、TypeScript、tsx、vitest、fast-xml-parser。

**Spec:** `docs/superpowers/specs/2026-10-10-boot-sequence-profile-design.md`

## Global Constraints

- SVG 内只用系统字体栈：等宽 `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`；无衬线 `ui-sans-serif, system-ui, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`。
- 每张 SVG 必须包含 `@media (prefers-reduced-motion: reduce)`，关闭动画并显示结束状态。
- SVG 内不引用任何外部资源。
- 所有动态文本经过 `esc()` XML 转义。
- 图片 URL 前缀：`https://raw.githubusercontent.com/endlessYoung/endlessYoung/output/`。
- 不使用任何第三方统计服务。

---

### Task 1: 脚手架、主题与公共元素

**Files:**
- Create: `package.json`、`tsconfig.json`、`.gitignore`、`scripts/theme.ts`、`scripts/svg/primitives.ts`
- Test: `tests/primitives.test.ts`

**Interfaces:**
- Produces: `type ThemeName = 'dark' | 'light'`；`interface Theme { name; bg; panel; grid; line; text; muted; accent; accent2; ok; jank; beam: [string,string,string] }`；`themes: Record<ThemeName, Theme>`；`esc(s: string): string`；`frame(opts: { theme: Theme; width: number; height: number; sheet?: number; title?: string; body: string; css?: string }): string`（输出完整 `<svg>`，含背景、网格、四角括号、reduced-motion 规则、浅色版图纸标题栏）；常量 `MONO`、`SANS`。

- [ ] 测试：`esc('<a&"b>')` 结果为 `&lt;a&amp;&quot;b&gt;`；`frame` 输出能被 fast-xml-parser 校验通过、`viewBox` 等于 `0 0 W H`、包含 `prefers-reduced-motion`；light 主题输出包含 `DRAWN BY endlessYoung`。
- [ ] 执行 `npx vitest run`，确认失败。
- [ ] 实现，再执行确认通过。
- [ ] 提交。

### Task 2: 数据层

**Files:**
- Create: `scripts/data/contributions.ts`、`scripts/data/blog.ts`、`scripts/data/clock.ts`、`scripts/data/cache.ts`
- Test: `tests/contributions.test.ts`、`tests/blog.test.ts`、`tests/clock.test.ts`、`tests/cache.test.ts`

**Interfaces:**
- `interface Day { date: string; count: number }`
- `interface Trace { days: Day[]; frames: number; jankRate: number; longestStreak: number; weekly: number[]; today: number }`
- `summarize(days: Day[]): Trace`（取最后 365 天；`frames` = count>0 的天数；`jankRate` = 0 天占比，0–1；`longestStreak`；`weekly` 按 7 天一组从头切分求和；`today` = 最后一天 count）
- `fetchCalendar(login: string, token: string): Promise<Day[]>`
- `interface Post { title: string; link: string; date: Date }`
- `parseFeed(xml: string, limit = 6): Post[]`（按日期倒序，畸形 XML 抛 `Error`）
- `fetchPosts(url: string): Promise<Post[]>`
- `greeting(now: Date): string`（按 UTC+8 时段，文案与 spec 6.3 一致）
- `interface Cache { trace?: Trace; posts?: { title: string; link: string; date: string }[] }`
- `withFallback<T>(name: string, fetcher: () => Promise<T>, cached: T | undefined): Promise<T | undefined>`（重试一次，失败返回缓存并 `console.warn`）

- [ ] 写测试：summarize 覆盖全 0、全非 0、连续段、超 365 天截断；parseFeed 用内联样本 feed 断言排序与 limit、畸形 XML 抛错；greeting 断言 04:59/05:00/10:59/11:00/13:59/14:00/18:59/19:00/22:59/23:00 的结果；withFallback 断言成功返回新值、两次失败返回缓存、无缓存返回 undefined。
- [ ] 执行确认失败，实现，执行确认通过。
- [ ] 提交。

### Task 3: 渲染模块

**Files:**
- Create: `scripts/content.ts`、`scripts/svg/{header,zygote,services,binder,tasks,perfetto,agent,logcat,standby}.ts`
- Test: `tests/render.test.ts`

**Interfaces:**
- `header.render(t, { greeting: string; today: number })`
- `zygote.render(t)`、`services.render(t)`、`agent.render(t)`、`standby.render(t)`
- `binder.render(t, target: BinderTarget)`，`BinderTarget = { id: 'github'|'blog'|'repos'; label: string; service: string }`
- `tasks.renderCard(t, p: Project, index: number)`、`tasks.renderMore(t)`，`Project = { slug; name; link; desc; tags: string[] }`
- `perfetto.render(t, trace: Trace | undefined)`
- `logcat.render(t, posts: Post[] | undefined)`
- `content.ts` 导出 `projects`、`binderTargets`、`serviceGroups`、`zygoteProcs`、`agentLines`、`dumpsys`、`links`。

- [ ] 写测试：对每个 render 在两个主题下：XML 合法、`viewBox` 尺寸与 spec 第 4 节一致、含 reduced-motion；perfetto 在 `undefined` 时含 `NO TRACE DATA`；logcat 在 `undefined` 时含 `feed unavailable`；logcat 对标题 `<x>&` 正确转义、超 36 字截断。
- [ ] 执行确认失败，实现，执行确认通过。
- [ ] 提交。

### Task 4: 构建入口、预览与 README

**Files:**
- Create: `scripts/build.ts`、`scripts/preview.ts`、`scripts/readme.ts`
- Modify: `README.md`（整体替换）
- Delete: `assets/`

**Interfaces:**
- `build.ts`：读 `prev/data/cache.json`（可无），用 `withFallback` 取数，渲染全部图写入 `dist/`，最后校验每个 SVG 为合法 XML，否则 `process.exit(1)`；写 `dist/data/cache.json`。
- `readme.ts` 导出 `renderReadme(base: string): string`；`npm run readme` 用正式 URL 前缀写出 `README.md`；`preview.ts` 用相对路径生成 `dist/preview.html`，深浅两列并排。

- [ ] 执行 `npm run build`（离线也应成功并产生占位图），`npm run preview`，浏览器检查。
- [ ] 执行 `npm run readme` 生成 README，删除 `assets/`，提交。

### Task 5: 工作流

**Files:**
- Create: `.github/workflows/profile.yml`

- [ ] 触发：`schedule '7 * * * *'`、`push` 到 `main`/`redesign`、`workflow_dispatch`；权限 `contents: write`。
- [ ] 步骤：checkout → 尝试拉取 `output` 分支到 `prev/` → setup-node 20 → `npm ci` → `npm test` → `npm run build`（env：`GH_TOKEN: ${{ secrets.PROFILE_TOKEN || secrets.GITHUB_TOKEN }}`）→ 在 `dist/` 初始化孤立仓库并 `git push -f origin HEAD:output`。
- [ ] 推送 `redesign` 分支，确认工作流成功、`output` 分支生成、分支页 README 渲染正常。
