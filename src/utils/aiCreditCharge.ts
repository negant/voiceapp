/**
 * Charge AI credits before cloud processing starts.
 * WaveSpeed bills on job submit — charging only after success loses credits
 * when the user kills the app mid-job.
 */
export async function chargeAiCreditsBeforeProcessing(params: {
  usesAi: boolean;
  creditCost: number;
  spendCredits: (amount: number, reason?: string) => Promise<number>;
}): Promise<boolean> {
  if (!params.usesAi || params.creditCost <= 0) {
    return false;
  }

  await params.spendCredits(params.creditCost, 'spend_ai');
  return true;
}
