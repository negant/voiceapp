import type { WaveBar } from '@/components/atoms/Logo/Logo.types';

export const LOGO_BAR_HEIGHT_RATIOS = [
  0.28, 0.55, 0.85, 1, 0.62, 0.85, 1, 0.55, 0.28,
] as const;

/** Symmetric bar heights read as a voice waveform at small icon sizes. */
export function buildWaveform(size: number): WaveBar[] {
  const count = LOGO_BAR_HEIGHT_RATIOS.length;
  const center = size / 2;
  const maxBarHeight = size * 0.5;
  const barWidth = size * 0.06;
  const gap = size * 0.038;
  const totalWidth = count * barWidth + (count - 1) * gap;
  const startX = center - totalWidth / 2;

  return LOGO_BAR_HEIGHT_RATIOS.map((ratio, index) => {
    const height = Math.max(barWidth, maxBarHeight * ratio);
    const x = startX + index * (barWidth + gap);
    const y = center - height / 2;
    return { key: `bar-${index}`, x, y, width: barWidth, height };
  });
}

export function getLogoMetrics(size: number) {
  const center = size / 2;
  const maxBarHeight = size * 0.5;
  const barWidth = size * 0.06;
  return { center, maxBarHeight, barWidth };
}
