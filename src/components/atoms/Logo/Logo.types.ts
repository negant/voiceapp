export type LogoVariant = 'mark' | 'plain';

export type LogoProps = {
  size?: number;
  variant?: LogoVariant;
  className?: string;
};

export type WaveBar = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
