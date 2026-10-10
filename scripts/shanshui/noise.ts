export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth 1D value noise in [-1, 1]. */
export function noise1(seed: number): (x: number) => number {
  const rand = rng(seed);
  const lattice = Array.from({ length: 1024 }, () => rand() * 2 - 1);
  return (x: number) => {
    const i = Math.floor(x);
    const f = x - i;
    const a = lattice[((i % 1024) + 1024) % 1024];
    const b = lattice[(((i + 1) % 1024) + 1024) % 1024];
    const u = f * f * (3 - 2 * f);
    return a + (b - a) * u;
  };
}

export function fbm(seed: number, octaves = 4): (x: number) => number {
  const layers = Array.from({ length: octaves }, (_, i) => noise1(seed + i * 101));
  return (x: number) => {
    let sum = 0;
    let amp = 1;
    let freq = 1;
    let norm = 0;
    for (const n of layers) {
      sum += n(x * freq) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2.03;
    }
    return sum / norm;
  };
}
