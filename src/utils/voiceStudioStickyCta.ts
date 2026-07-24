export type StickyCtaMode = 'hidden' | 'needSource' | 'needEffect' | 'convert';

/**
 * Resolves which sticky footer CTA to show: convert when ready,
 * otherwise guide the user to add a source or pick an effect.
 */
export function resolveStickyCtaMode(options: {
  hasSource: boolean;
  hasEffect: boolean;
  canConvert: boolean;
}): StickyCtaMode {
  if (options.canConvert) {
    return 'convert';
  }

  if (options.hasEffect && !options.hasSource) {
    return 'needSource';
  }

  if (options.hasSource && !options.hasEffect) {
    return 'needEffect';
  }

  return 'hidden';
}
