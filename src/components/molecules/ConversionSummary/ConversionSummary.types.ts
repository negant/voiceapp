import type { ConversionProcessingMode } from '@/utils/conversionSummary';

export type ConversionSummaryProps = {
  effectName: string;
  mode: ConversionProcessingMode;
  creditCost?: number;
  className?: string;
};
