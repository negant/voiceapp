import { resolveStickyCtaMode } from './voiceStudioStickyCta';

describe('resolveStickyCtaMode', () => {
  it('shows convert when conversion is allowed', () => {
    expect(
      resolveStickyCtaMode({
        hasSource: true,
        hasEffect: true,
        canConvert: true,
      }),
    ).toBe('convert');
  });

  it('asks for source when an effect is selected without a file', () => {
    expect(
      resolveStickyCtaMode({
        hasSource: false,
        hasEffect: true,
        canConvert: false,
      }),
    ).toBe('needSource');
  });

  it('asks for an effect when a file is loaded without a selection', () => {
    expect(
      resolveStickyCtaMode({
        hasSource: true,
        hasEffect: false,
        canConvert: false,
      }),
    ).toBe('needEffect');
  });

  it('hides the CTA when neither source nor effect is ready', () => {
    expect(
      resolveStickyCtaMode({
        hasSource: false,
        hasEffect: false,
        canConvert: false,
      }),
    ).toBe('hidden');
  });

  it('prefers convert over guidance when canConvert is true', () => {
    expect(
      resolveStickyCtaMode({
        hasSource: true,
        hasEffect: true,
        canConvert: true,
      }),
    ).toBe('convert');
  });
});
