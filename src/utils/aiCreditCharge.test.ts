import { chargeAiCreditsBeforeProcessing } from './aiCreditCharge';

describe('chargeAiCreditsBeforeProcessing', () => {
  it('charges credits before processing when AI cost is positive', async () => {
    const spendCredits = jest.fn().mockResolvedValue(8);

    await expect(
      chargeAiCreditsBeforeProcessing({
        usesAi: true,
        creditCost: 2,
        spendCredits,
      }),
    ).resolves.toBe(true);

    expect(spendCredits).toHaveBeenCalledTimes(1);
    expect(spendCredits).toHaveBeenCalledWith(2, 'spend_ai');
  });

  it('skips charge when selection is not AI', async () => {
    const spendCredits = jest.fn().mockResolvedValue(10);

    await expect(
      chargeAiCreditsBeforeProcessing({
        usesAi: false,
        creditCost: 3,
        spendCredits,
      }),
    ).resolves.toBe(false);

    expect(spendCredits).not.toHaveBeenCalled();
  });

  it('skips charge when credit cost is zero', async () => {
    const spendCredits = jest.fn().mockResolvedValue(10);

    await expect(
      chargeAiCreditsBeforeProcessing({
        usesAi: true,
        creditCost: 0,
        spendCredits,
      }),
    ).resolves.toBe(false);

    expect(spendCredits).not.toHaveBeenCalled();
  });

  it('propagates spend failures so processing must not start', async () => {
    const spendCredits = jest.fn().mockRejectedValue(new Error('network'));

    await expect(
      chargeAiCreditsBeforeProcessing({
        usesAi: true,
        creditCost: 1,
        spendCredits,
      }),
    ).rejects.toThrow('network');
  });
});
