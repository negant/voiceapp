import type { AccountPlanId } from '@/types/account';

/** Mirrors backend bootstrapStatus values. */
export type CreditsBootstrapStatus =
  | 'pending'
  | 'granted'
  | 'already_registered'
  | 'pool_exhausted'
  | 'local_fallback';

export type CreditsPoolSnapshot = {
  installCap: number;
  installsGranted: number;
  remainingSlots: number;
};

/** Response body from POST /v1/credits/bootstrap (see credits-backend.md). */
export type CreditsBootstrapApiResponse = {
  bootstrapStatus: Exclude<
    CreditsBootstrapStatus,
    'pending' | 'local_fallback'
  >;
  grantedCredits: number;
  balance: number;
  accountPlan: AccountPlanId;
  creditsPerAi10Sec: number;
  pool?: CreditsPoolSnapshot;
};

export type CreditsBootstrapResult = {
  status: CreditsBootstrapStatus;
  grantedCredits: number;
  balance: number;
  creditsPerAi10Sec: number;
  accountPlan: AccountPlanId;
  pool?: CreditsPoolSnapshot;
};
