export type Mode = 'light' | 'dark';

export interface Palette {
  mode: Mode;
  /** silk ground, centre and aged edge */
  silk: string;
  silkEdge: string;
  /** brocade mounting band and its gold thread */
  mount: string;
  thread: string;
  /** mineral pigments, top of the mountain to its foot */
  azurite: string;
  malachite: string;
  ochre: string;
  ochreFoot: string;
  far: string;
  mist: string;
  water: string;
  ripple: string;
  ink: string;
  ridge: string;
  moss: string;
  cinnabar: string;
  inscription: string;
}

export const palettes: Record<Mode, Palette> = {
  light: {
    mode: 'light',
    silk: '#DCCDA8',
    silkEdge: '#BFA977',
    mount: '#22465A',
    thread: '#B8975A',
    azurite: '#1D4E6B',
    malachite: '#3F8A74',
    ochre: '#9A6A3E',
    ochreFoot: '#B98A52',
    far: '#7FA3A6',
    mist: '#EFE6CF',
    water: '#CFC6A4',
    ripple: '#3B6F7F',
    ink: '#22201C',
    ridge: '#22201C',
    moss: '#1F3B30',
    cinnabar: '#C2362B',
    inscription: '#22201C',
  },
  dark: {
    mode: 'dark',
    silk: '#16202B',
    silkEdge: '#0B1118',
    mount: '#0A0F15',
    thread: '#B08D4E',
    azurite: '#2D5C74',
    malachite: '#2F6A5C',
    ochre: '#5A4430',
    ochreFoot: '#3E3022',
    far: '#2B4250',
    mist: '#2A3846',
    water: '#121B24',
    ripple: '#C9A45C',
    ink: '#0B0F14',
    ridge: '#D4AF66',
    moss: '#C9A45C',
    cinnabar: '#B8322A',
    inscription: '#E6D6AE',
  },
};
