import type { ReactNode } from 'react';

export type CollapsibleSectionProps = {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
};
