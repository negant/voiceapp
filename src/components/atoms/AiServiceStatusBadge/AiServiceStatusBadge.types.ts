import type { AiServiceStatusColor } from '@/services/aiServiceStatus';

export type AiServiceStatusBadgeProps = {
  color: AiServiceStatusColor;
  label: string;
  className?: string;
};
