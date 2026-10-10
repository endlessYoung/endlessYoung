import { agentLines, type AgentRole } from '../content';
import type { Theme } from '../theme';
import { MONO, esc, frame } from './primitives';

const W = 1200;
const H = 320;

const LABEL: Record<AgentRole, string> = {
  thought: 'Thought:',
  action: 'Action:',
  observation: 'Observation:',
  answer: 'Final Answer:',
  cont: '',
};

const TOKENS = [0, 184, 402, 731, 958, 1206, 1384];

export function render(t: Theme): string {
  const color: Record<AgentRole, string> = {
    thought: t.accent,
    action: t.accent2,
    observation: t.ok,
    answer: t.text,
    cont: t.text,
  };
  const step = 0.55;

  const lines = agentLines
    .map((l, i) => {
      const y = 82 + i * 25;
      const isAnswer = l.role === 'answer' || l.role === 'cont';
      return `<g class="rise" style="animation-delay:${(0.4 + i * step).toFixed(2)}s">
  <text x="44" y="${y}" fill="${color[l.role]}" font-weight="${isAnswer ? 700 : 400}">${esc(LABEL[l.role])}</text>
  <text x="180" y="${y}" fill="${isAnswer ? t.text : t.muted}" font-weight="${isAnswer ? 600 : 400}">${esc(l.text)}</text>
</g>`;
    })
    .join('');

  const finishAt = 0.4 + agentLines.length * step;
  const tick = finishAt / (TOKENS.length - 1);
  const counter = TOKENS.map((n, i) => {
    const last = i === TOKENS.length - 1;
    const at = (i * tick).toFixed(2);
    const cls = last ? 'in' : 'win hide-reduced';
    const style = last ? `animation-delay:${at}s` : `animation-delay:${at}s;animation-duration:${tick.toFixed(2)}s`;
    return `<text class="${cls}" style="${style}" x="1140" y="98" text-anchor="end" fill="${t.text}" font-size="28" font-weight="700">${n.toLocaleString('en-US')}</text>`;
  }).join('');

  const cx = 1032;
  const cy = 196;
  const r = 50;
  const nodes = [
    { a: -90, label: 'THINK', c: t.accent },
    { a: 30, label: 'ACT', c: t.accent2 },
    { a: 150, label: 'OBSERVE', c: t.ok },
  ].map((n) => ({ ...n, x: cx + r * Math.cos((n.a * Math.PI) / 180), y: cy + r * Math.sin((n.a * Math.PI) / 180) }));

  const loop = nodes
    .map(
      (n) => `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="5" fill="${n.c}" filter="url(#glow)"/>
<text x="${n.x.toFixed(1)}" y="${(n.y + (n.a === -90 ? -12 : 20)).toFixed(1)}" text-anchor="middle" fill="${t.muted}" font-size="9" letter-spacing="1.5">${n.label}</text>`,
    )
    .join('');

  const body = `
<g font-family="${MONO}" font-size="13">
  <text x="44" y="44" fill="${t.muted}" font-size="11" letter-spacing="2">STAGE 07 · AGENT</text>
  <text x="44" y="60" fill="${t.text}" font-size="12">&gt; who is endlessYoung?</text>
  <line x1="44" y1="66" x2="860" y2="66" stroke="${t.line}"/>
  ${lines}
  <rect class="hide-reduced blink" x="${(184 + (agentLines.at(-1)?.text.length ?? 0) * 7.8).toFixed(1)}" y="${82 + (agentLines.length - 1) * 25 - 12}" width="8" height="15" fill="${t.accent}" style="animation-delay:${finishAt.toFixed(2)}s"/>
  <rect x="900" y="40" width="268" height="232" rx="3" fill="${t.panel}" stroke="${t.line}"/>
  <text x="920" y="64" fill="${t.muted}" font-size="10" letter-spacing="2">TOKENS</text>
  ${counter}
  <text x="920" y="122" fill="${t.muted}" font-size="10">steps 3 · tools 2 · ReAct</text>
  <line x1="920" y1="134" x2="1148" y2="134" stroke="${t.line}"/>
  <circle id="ring" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#beam)" stroke-width="1.2" stroke-dasharray="3 6" class="dash"/>
  <path id="orbit" d="M${cx} ${cy - r} a${r} ${r} 0 1 1 -0.01 0" fill="none"/>
  <g class="hide-reduced" filter="url(#glow)"><circle r="3.4" fill="${t.text}"><animateMotion dur="3s" repeatCount="indefinite"><mpath xlink:href="#orbit"/></animateMotion></circle></g>
  ${loop}
</g>`;

  const css = `
  .win { animation: win .3s linear both; }
  @keyframes win { 0% { opacity: 0; } 1%, 99% { opacity: 1; } 100% { opacity: 0; } }
`;

  return frame({ theme: t, width: W, height: H, sheet: 7, title: 'AGENT TRACE', label: 'An agent reasons about who endlessYoung is', body, css });
}
