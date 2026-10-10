export const LOGIN = 'endlessYoung';

export const links = {
  github: 'https://github.com/endlessYoung',
  blog: 'https://endlessyoung.github.io/Blog_/',
  repos: 'https://github.com/endlessYoung?tab=repositories',
  feed: 'https://endlessyoung.github.io/Blog_/feed.xml',
};

export interface Project {
  slug: string;
  name: string;
  link: string;
  desc: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    slug: 'visual-architecture',
    name: 'visual-architecture',
    link: 'https://github.com/endlessYoung/visual-architecture',
    desc: 'AI skill that turns technical descriptions into verifiable HTML + SVG architecture diagrams.',
    tags: ['JavaScript', 'SVG', 'AI Skill', 'Design Systems'],
  },
  {
    slug: 'blog',
    name: "Endlessyoung's Blog",
    link: 'https://endlessyoung.github.io/Blog_/',
    desc: '300+ notes on Android Framework, Compose, Kotlin, Java and AI Agents. Continuously updated.',
    tags: ['VitePress', 'Android', 'Kotlin', 'Agents'],
  },
  {
    slug: 'fluxmd',
    name: 'FluxMD',
    link: 'https://github.com/endlessYoung/flux-md-editor',
    desc: 'Universal, high-performance Markdown editor core for React and Vue. One engine, two ecosystems.',
    tags: ['TypeScript', 'React', 'Vue', 'Markdown'],
  },
  {
    slug: 'img2points',
    name: 'img2points',
    link: 'https://github.com/endlessYoung/img2points',
    desc: 'Turn a photo into deterministic pointillism and bead art, exported as SVG and PNG.',
    tags: ['TypeScript', 'SVG', 'Image Processing'],
  },
  {
    slug: 'omnitype',
    name: 'OmniType',
    link: 'https://github.com/endlessYoung/OmniType',
    desc: 'Cross-platform Markdown typesetting that gives every draft a consistent, professional look.',
    tags: ['JavaScript', 'Markdown', 'Typography'],
  },
  {
    slug: 'mysavings',
    name: 'MySavings',
    link: 'https://github.com/endlessYoung/MySavings',
    desc: 'Personal savings tracker built natively for Android with Kotlin and Jetpack.',
    tags: ['Kotlin', 'Android', 'Jetpack'],
  },
];

export const moreProjects = ['InjectAI', 'visual-roadmap', 'quilt', 'Clash Verge themes'];

export interface BinderTarget {
  id: 'github' | 'blog' | 'repos';
  service: string;
  link: string;
}

export const binderTargets: BinderTarget[] = [
  { id: 'github', service: 'GitHubService', link: links.github },
  { id: 'blog', service: 'BlogService', link: links.blog },
  { id: 'repos', service: 'RepoService', link: links.repos },
];

export interface ServiceGroup {
  name: string;
  services: { name: string; color: string }[];
}

export const serviceGroups: ServiceGroup[] = [
  {
    name: 'core',
    services: [
      { name: 'KotlinService', color: '#7F52FF' },
      { name: 'JavaService', color: '#ED8B00' },
      { name: 'AndroidFrameworkService', color: '#3DDC84' },
      { name: 'ComposeService', color: '#4285F4' },
    ],
  },
  {
    name: 'web',
    services: [
      { name: 'TypeScriptService', color: '#3178C6' },
      { name: 'JavaScriptService', color: '#F7DF1E' },
      { name: 'ReactService', color: '#61DAFB' },
      { name: 'VueService', color: '#4FC08D' },
      { name: 'ViteService', color: '#646CFF' },
      { name: 'TailwindService', color: '#06B6D4' },
    ],
  },
  {
    name: 'infra',
    services: [
      { name: 'PythonService', color: '#3776AB' },
      { name: 'NodeService', color: '#339933' },
      { name: 'LinuxService', color: '#FCC624' },
      { name: 'GitService', color: '#F05032' },
      { name: 'DockerService', color: '#2496ED' },
      { name: 'GradleService', color: '#6CCB4B' },
      { name: 'SQLiteService', color: '#0B7BC1' },
    ],
  },
  {
    name: 'tools',
    services: [
      { name: 'VSCodeService', color: '#007ACC' },
      { name: 'IntelliJService', color: '#FE315D' },
      { name: 'PostmanService', color: '#FF6C37' },
      { name: 'FigmaService', color: '#F24E1E' },
    ],
  },
  {
    name: 'concepts',
    services: [
      { name: 'Jetpack', color: '#3DDC84' },
      { name: 'Coroutines', color: '#7F52FF' },
      { name: 'MVVM', color: '#C084FC' },
      { name: 'Agents', color: '#E23CA9' },
      { name: 'RAG', color: '#F59E0B' },
    ],
  },
];

export const zygoteProcs = [
  { pid: 1024, name: 'microsoft.engineer', state: 'RUNNING' },
  { pid: 1088, name: 'notes.android_kotlin_ai', state: '300+' },
  { pid: 1101, name: 'framework.compose', state: 'FOCUSED' },
  { pid: 1137, name: 'oss.ai_skills', state: 'ACTIVE' },
  { pid: 1162, name: 'web.react_vue_ts', state: 'ACTIVE' },
  { pid: 1199, name: 'explore.agents_rag', state: 'ACTIVE' },
];

export type AgentRole = 'thought' | 'action' | 'observation' | 'answer' | 'cont';

export const agentLines: { role: AgentRole; text: string }[] = [
  { role: 'thought', text: 'The user wants to know who endlessYoung is.' },
  { role: 'action', text: 'search(blog, "endlessYoung")' },
  { role: 'observation', text: '300+ notes on Android Framework, Compose, Kotlin, Agents.' },
  { role: 'thought', text: 'Check what they build.' },
  { role: 'action', text: 'list_repos("endlessYoung")' },
  { role: 'observation', text: 'visual-architecture, FluxMD, img2points, OmniType ...' },
  { role: 'answer', text: 'An Android Framework engineer at Microsoft who turns' },
  { role: 'cont', text: 'systems knowledge into tools for humans and agents.' },
];

export const dumpsys = `ACTIVITY MANAGER (dumpsys endlessYoung)
  mFocusedActivity=ActivityRecord{Life u0 com.endlessyoung/.Curiosity}
  mResumed=true  mStopped=false
  mCaffeineLevel=87%  mSleepDebt=PENDING
  mCurrentTask=Learning  mBackStack=[Framework, Compose, Agents]
  mLastAnr=none (please keep it that way)
  mMotto="加油每一天"`;
