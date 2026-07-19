import type { ReactNode } from 'react';

export type ScreenProps = {
  children: ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  className?: string;
};
