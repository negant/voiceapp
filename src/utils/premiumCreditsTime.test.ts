import {
  calculateAi10SecPreviewsFromCredits,
  calculateAiSecondsAffordableFromCredits,
} from '@/utils/premiumCreditsTime';

describe('premiumCreditsTime', () => {
  const creditsPerStartedMinute = 1;

  it('converts credits to affordable AI seconds (1 credit = 1 started minute)', () => {
    expect(
      calculateAiSecondsAffordableFromCredits(1, creditsPerStartedMinute),
    ).toBe(60);
    expect(
      calculateAiSecondsAffordableFromCredits(10, creditsPerStartedMinute),
    ).toBe(600);
    expect(
      calculateAiSecondsAffordableFromCredits(-10, creditsPerStartedMinute),
    ).toBe(0);
  });

  it('counts affordable started minutes via deprecated 10s helper name', () => {
    expect(
      calculateAi10SecPreviewsFromCredits(500, creditsPerStartedMinute),
    ).toBe(500);
  });
});
