import type { ConversionProcessingMode } from '@/utils/conversionSummary';

export type ConversionSummaryProps = {
  effectName: string;
  mode: ConversionProcessingMode;
  aiMaxDurationSec?: number;
  affordableAiSeconds?: number;
  billableSeconds?: number;
  creditCost?: number;
  isPremium?: boolean;
  className?: string;
};
