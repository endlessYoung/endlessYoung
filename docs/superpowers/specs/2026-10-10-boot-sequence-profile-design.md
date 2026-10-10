# endlessYoung OS：开机序列主页设计

日期：2026-10-10
状态：待审阅

## 1. 目标

把 GitHub 个人主页 `README.md` 重做成一个连贯的叙事：一台 Android 设备从通电、启动系统服务到进入桌面。所有视觉元素都是自己生成的 SVG，提供深色（终端）和浅色（蓝色工程图纸）两套主题，其中贡献、博客、问候三类数据由 GitHub Actions 定时更新。

成功标准：

- 在 github.com 上用深色和浅色主题打开主页，看到的都是完整、协调的一套设计，浏览器控制台无图片加载失败。
- 所有可点击入口（Connect 按钮、项目卡片）都能跳转到正确地址。
- 数据源失败时页面保持上一次的内容，不出现空图或报错图。
- 页面上不再有任何第三方统计服务的图片。

## 2. 非目标

- 不做 GIF 或视频，只用 SVG 动画。
- 不追求在 GitHub 之外的 Markdown 渲染器中呈现一致。
- 不做访问量统计（按决定移除 komarev 徽章）。

## 3. 平台约束

GitHub 渲染 README 时：

- 不执行 JavaScript，会剥离 `<style>` 和大部分内联样式。
- 通过 `<img>` 引用的 SVG 会经过 camo 代理，SVG 内部的 CSS 动画和 SMIL 动画可以运行，但 SVG 内的链接不能点击，外部字体与外部图片不会加载。
- `<picture>` + `<source media="(prefers-color-scheme: dark|light)">` 可用于切换主题。
- `<details>` / `<summary>` 可用。

推论：

- 每个可点击区域必须是独立的 `<a><img></a>`。
- 字体只用系统字体栈：等宽 `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`；无衬线 `ui-sans-serif, system-ui, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`。
- 每张 SVG 都必须包含 `@media (prefers-reduced-motion: reduce)` 规则，关闭所有动画并显示动画结束时的状态。

## 4. 页面结构

自上而下共 10 个板块。表中“图”指生成的 SVG，每张都有 `dark/` 和 `light/` 两个版本。

| # | 板块 | 叙事阶段 | 图 | 动态数据 | 可点击 |
|---|------|----------|----|----------|--------|
| 1 | 顶栏 | Bootloader → Kernel | `header.svg` (1200×360) | 北京时间问候、当日提交数 | 否 |
| 2 | 亮点 | Zygote 孵化 | `zygote.svg` (1200×300) | 否 | 否 |
| 3 | 技术栈 | SystemServer 启动服务 | `services.svg` (1200×420) | 否 | 否 |
| 4 | Connect | Binder 跨进程调用 | `binder-github.svg`、`binder-blog.svg`、`binder-repos.svg` (各 380×120) | 否 | 是，各自链接 |
| 5 | 项目 | Launcher 最近任务 | `task-<slug>.svg` ×6 (各 580×200) + `task-more.svg` | 否 | 是，各自链接 |
| 6 | 年度贡献 | Perfetto 帧时间线 | `perfetto.svg` (1200×300) | 近 365 天贡献日历 | 否 |
| 7 | AI | Agent 推理链 | `agent.svg` (1200×320) | 否 | 否 |
| 8 | 写作 | Logcat | `logcat.svg` (1200×280) | 博客最新 6 篇 | 整图链接到博客 |
| 9 | 页脚 | 待机 / 息屏 | `standby.svg` (1200×160) | 否 | 否 |
| 10 | 彩蛋 | `adb shell dumpsys endlessYoung` | 无图，`<details>` 内代码块 | 否 | 否 |

### 4.1 各板块内容

**1 顶栏 Bootloader → Kernel**
动画分三幕，总长约 6 秒，结束后停在最终状态（`animation-fill-mode: forwards`，不循环）：
1. 0–1.5s：黑屏，左上角出现 `endlessYoung bootloader v26.10` 与 `fastboot: unlocked` 等 3 行。
2. 1.5–4s：内核日志逐行淡入，带时间戳，约 8 行，例如 `[    0.000000] Booting Linux on physical CPU 0x0`、`[    1.284117] init: starting service 'zygote'...`、`[    2.031552] binder: 1024:1024 transaction to endlessYoung`。
3. 4–6s：日志上移变暗，中央点亮 `endlessYoung` 标题（沿用现有白到紫的渐变），副标题 `Android Framework · Compose · Agents`，下方一行动态问候（见 6.3），右上角信息块沿用现有 `OWNER / ORG / SHEET`，新增 `UPTIME`（当日提交数，格式 `commits today: N`）。
保留现有四角括号、网格与扫描线作为全站视觉母题。

**2 Zygote 孵化**
左侧一个 `zygote64` 节点，向右分叉出 6 个子进程框，依次出现。每个框为 `PID  NAME  STATE`：
- `1024  microsoft.engineer  RUNNING`
- `1088  notes.android_kotlin_ai  300+`
- `1101  framework.compose  FOCUSED`
- `1137  oss.ai_skills  ACTIVE`
- `1162  web.react_vue_ts  ACTIVE`
- `1199  explore.agents_rag  ACTIVE`

**3 SystemServer 启动服务**
`SystemServer` 分组输出启动日志，左侧状态列从 `[ .. ]` 变为绿色 `[ OK ]`，按组依次完成：
- Core：`KotlinService` `JavaService` `AndroidFrameworkService` `ComposeService`
- Web：`TypeScriptService` `JavaScriptService` `ReactService` `VueService` `ViteService` `TailwindService`
- Infra：`PythonService` `NodeService` `LinuxService` `GitService` `DockerService` `GradleService` `SQLiteService`
- Tools：`VSCodeService` `IntelliJService` `PostmanService` `FigmaService`
- Concepts（替代现有 `chips.svg`）：`Jetpack` `Coroutines` `MVVM` `Agents` `RAG`
图标不使用 iconify 远程资源（SVG 内外部图片不会加载），每个服务前用一个品牌色小方块标识。

**4 Binder Connect**
三个按钮横向排列。每个按钮内是一条调用链 `Client.Proxy ─▶ /dev/binder ─▶ <Service>`，带一颗沿连线移动的光点，下方文字 `transact(GITHUB)` / `transact(BLOG)` / `transact(REPOS)`。
链接：`https://github.com/endlessYoung`、`https://endlessyoung.github.io/Blog_/`、`https://github.com/endlessYoung?tab=repositories`。

**5 Launcher 最近任务**
每个项目一张卡片，模拟最近任务视图：顶部是应用标题栏（项目名 + 圆形图标位），主体是一句话简介和技术标签，卡片带轻微透视倾斜与阴影，悬浮呼吸光边。两列排布，用 HTML `<table>` 排版。项目与链接沿用现有 README：

| slug | 名称 | 链接 |
|------|------|------|
| visual-architecture | visual-architecture | https://github.com/endlessYoung/visual-architecture |
| blog | Endlessyoung's Blog | https://endlessyoung.github.io/Blog_/ |
| fluxmd | FluxMD | https://github.com/endlessYoung/flux-md-editor |
| img2points | img2points | https://github.com/endlessYoung/img2points |
| omnitype | OmniType | https://github.com/endlessYoung/OmniType |
| mysavings | MySavings | https://github.com/endlessYoung/MySavings |
| more | 更多（InjectAI、visual-roadmap、quilt、Clash Verge 主题） | https://github.com/endlessYoung?tab=repositories |

`task-more.svg` 为通栏宽度（1200×120），样式为最近任务底部的“全部清除”栏，文字改为 `View all repos`。

**6 Perfetto 帧时间线**
- 横轴为近 365 天，每天一帧，柱宽约 3px。
- 柱高 = `log2(count + 1)` 归一化到轨道高度。
- `count = 0` 的天标红，记为掉帧（Jank）；其余按贡献量在紫到粉的渐变中取色。
- 顶部标题栏模拟 Perfetto：`Choreographer#doFrame  ·  endlessYoung  ·  last 365 days`。
- 右上角三项指标：`Frames: <有贡献的天数>`、`Jank: <掉帧率%>`、`Longest streak: <最长连续天数>d`。
- 一条竖直播放头从左扫到右（循环，8 秒）。
- 下方第二条轨道显示按周汇总的总量，作为“CPU 频率”曲线。

**7 Agent 推理链**
固定文本的 ReAct 循环，逐步出现，结束后停在最终状态：
```
Thought:     The user wants to know who endlessYoung is.
Action:      search(blog, "endlessYoung")
Observation: 300+ notes on Android Framework, Compose, Kotlin, Agents.
Thought:     Check what they build.
Action:      list_repos("endlessYoung")
Observation: visual-architecture, FluxMD, img2points, OmniType ...
Final Answer: An Android Framework engineer at Microsoft who turns
              systems knowledge into tools for humans and agents.
```
每行前缀用不同颜色区分，右侧有一个 token 计数器从 0 增长到最终值。

**8 Logcat**
模拟 `adb logcat` 输出，每行格式：
`MM-DD HH:mm:ss.SSS  PID  TID  I  Blog: 《标题》`
数据取 RSS 中按 `pubDate` 倒序的前 6 篇。最新一篇用 `W` 级别高亮，并带 `NEW` 标记。标题超过 36 个字时截断并加省略号。最下方一行闪烁光标 `$ _`。整图链接到博客首页。

**9 待机 / 息屏**
画面从亮到暗，最后只留中央一行“加油每一天”和下方一个缓慢呼吸的指示灯，左下角小字 `screen_off_timeout reached`。

**10 彩蛋**
```html
<details>
<summary><code>$ adb shell dumpsys endlessYoung</code></summary>
...代码块...
</details>
```
代码块内容（纯文本，后续可改）：
```
ACTIVITY MANAGER (dumpsys endlessYoung)
  mFocusedActivity=ActivityRecord{Life u0 com.endlessyoung/.Curiosity}
  mResumed=true  mStopped=false
  mCaffeineLevel=87%  mSleepDebt=PENDING
  mCurrentTask=Learning  mBackStack=[Framework, Compose, Agents]
  mLastAnr=none (please keep it that way)
  mMotto="加油每一天"
```

## 5. 主题

两套主题共用同一份布局，只替换配色变量：

| Token | dark（终端） | light（工程图纸） |
|-------|--------------|-------------------|
| `bg` | `#07090F` | `#0B3D91`（图纸蓝） |
| `panel` | `#0C111C` | `#0E4AA8` |
| `grid` | `#1C2436` | `#3D6FC4` |
| `line` | `#2A3348` | `#9DB8E8` |
| `text` | `#F3EEFF` | `#FFFFFF` |
| `muted` | `#8B93A7` | `#C9D8F5` |
| `accent` | `#C084FC` | `#FFFFFF` |
| `accent2` | `#E23CA9` | `#FFD166` |
| `ok` | `#34D399` | `#A7F3D0` |
| `jank` | `#F87171` | `#FF8A80` |
| `beam` 渐变 | `#7C5CFC → #C084FC → #E23CA9` | `#FFFFFF → #C9D8F5 → #FFD166` |

浅色版额外特征：每张图右下角有工程图纸标题栏（`DRAWN BY endlessYoung · SHEET n / 10 · SCALE 1:1`），线条以白色细线为主，不使用发光滤镜，改用虚线与尺寸标注线。

README 中每张图的写法：

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/endlessYoung/endlessYoung/output/dark/header.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/endlessYoung/endlessYoung/output/light/header.svg">
  <img src="https://raw.githubusercontent.com/endlessYoung/endlessYoung/output/dark/header.svg" width="100%" alt="...">
</picture>
```

## 6. 生成器架构

### 6.1 目录结构（main 分支）

```
package.json
tsconfig.json
scripts/
  build.ts            入口：取数据 → 渲染全部图 → 写入 dist/
  preview.ts          生成 dist/preview.html（左右并排深浅两版的完整页面）
  theme.ts            两套主题的 token
  svg/
    primitives.ts     公共元素：外框、四角括号、网格、扫描线、图纸标题栏、reduced-motion 样式
    header.ts
    zygote.ts
    services.ts
    binder.ts
    tasks.ts
    perfetto.ts
    agent.ts
    logcat.ts
    standby.ts
  data/
    contributions.ts  GraphQL 取贡献日历，转成帧序列与指标
    blog.ts           解析 feed.xml
    clock.ts          北京时间 → 问候语
    cache.ts          读写上一次成功的数据
  content.ts          所有固定文案（项目、服务列表、Agent 文本、彩蛋）
tests/
  *.test.ts
.github/workflows/profile.yml
README.md
```

现有 `assets/` 目录在新 README 不再引用后删除。

每个 `svg/*.ts` 导出纯函数 `render(theme, data) => string`，不读文件、不发网络请求，便于测试。

### 6.2 依赖

- 运行：Node 20。
- 开发依赖：`typescript`、`tsx`（直接执行 TS）、`vitest`、`fast-xml-parser`（解析 RSS，也用于测试 SVG 是否为合法 XML）。
- 不引入任何 SVG 或 UI 框架，SVG 用模板字符串拼接，所有插入的动态文本都经过 XML 转义函数。

### 6.3 数据源

| 数据 | 来源 | 处理 |
|------|------|------|
| 贡献日历 | GitHub GraphQL `user(login:"endlessYoung"){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount}}}}}` | 取最近 365 天；计算有贡献天数、掉帧率、最长连续天数、按周汇总；当日提交数取日历最后一天 |
| 博客 | `https://endlessyoung.github.io/Blog_/feed.xml` | 取 `title`、`link`、`pubDate`，按时间倒序取 6 篇 |
| 问候 | 执行时的 UTC 时间换算为 UTC+8 | 05–11 点 `Good morning — compiling the day.`；11–14 点 `Lunch break — GC in progress.`；14–19 点 `Afternoon — shipping features.`；19–23 点 `Evening — reading AOSP.`；23–05 点 `HH:mm — still debugging WMS.` |

令牌：优先使用仓库 secret `PROFILE_TOKEN`（具有 `read:user` 权限的 PAT，可以计入私有仓库贡献）；没有配置时退回 `GITHUB_TOKEN`，只统计公开贡献。

### 6.4 工作流 `.github/workflows/profile.yml`

- 触发：`schedule: cron "7 * * * *"`（每小时第 7 分钟，避开整点拥堵）、推送到 `main`、手动 `workflow_dispatch`。
- 步骤：
  1. checkout `main`。
  2. 尝试 checkout `output` 分支到 `prev/`，读取 `prev/data/cache.json`；分支不存在时视为没有缓存。
  3. `npm ci` → `npm test` → `npm run build`。
  4. 把 `dist/` 作为一个孤立分支的唯一一次提交，强制推送到 `output`。这样 `output` 分支始终只有一次提交，不会无限增长。
- 权限：`contents: write`。

## 7. 容错

- 每个数据源独立获取，各自设 15 秒超时，失败重试一次。
- 某个数据源失败时使用 `cache.json` 中该项的上次成功数据，并在构建日志中打印警告；其他数据源照常更新。
- 没有缓存且获取失败时（例如首次执行）：贡献图显示空轨道和文字 `NO TRACE DATA`，Logcat 显示一行 `W  Blog: feed unavailable, retrying next hour`。构建不失败，页面不会出现损坏的图。
- 构建最后一步对 `dist/` 下的每个 SVG 做 XML 解析校验，任何一张不合法则构建失败，不推送，`output` 分支保持上一版本。

## 8. 测试

使用 vitest，实现时按 TDD 进行：

- `contributions`：给定构造的日历数据，断言帧数、掉帧率、最长连续天数、按周汇总、当日提交数；覆盖全 0、全非 0、跨年。
- `blog`：解析一份截取的真实 feed 样本，断言排序、截断、特殊字符转义；畸形 XML 返回失败而不是抛出未处理异常。
- `clock`：每个时段边界（04:59、05:00、10:59、11:00、22:59、23:00）对应正确的问候语。
- `cache`：数据源失败时回退到缓存；没有缓存时回退到占位内容。
- 渲染：每个 `render` 在两套主题下输出可被解析的 XML，根节点 `viewBox` 符合第 4 节尺寸，包含 `prefers-reduced-motion` 规则，动态文本中的 `<`、`&` 被转义。

人工验证：

1. 本地执行 `npm run build && npm run preview`，在浏览器里打开 `dist/preview.html`，检查深浅两版和减少动态效果模式。
2. 先推到 `redesign` 分支，在该分支的 GitHub 页面上切换系统深浅色查看 README，并逐个点击可点击元素。
3. 确认后合并到 `main`，手动触发一次工作流，检查 `output` 分支和主页实际渲染。

## 9. 实施顺序

1. 搭建脚手架（package.json、tsconfig、vitest）和 `primitives.ts` / `theme.ts`。
2. 数据层：`contributions`、`blog`、`clock`、`cache`，测试先行。
3. 依次实现 9 个渲染模块，每完成一个都在 preview 中检查深浅两版。
4. 重写 `README.md`，删除 `assets/`。
5. 编写工作流，在 `redesign` 分支上验证。
6. 合并上线。

## 10. 待确认事项

- 是否配置 `PROFILE_TOKEN` 以计入私有仓库贡献（不配置也能工作）。
- 第 4.1 节中 Zygote PID 文案、Agent 推理文本、彩蛋内容是否需要调整措辞。
