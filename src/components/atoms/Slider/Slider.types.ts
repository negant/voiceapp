export type SliderProps = {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  accessibilityLabel?: string;
  /** `start` keeps the track close to content above (e.g. scale labels). */
  trackLayout?: 'center' | 'start';
  className?: string;
};
