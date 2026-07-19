import type { PressableProps } from 'react-native';
import type { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary';

export type ButtonProps = PressableProps & {
  title?: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  /** Rendered inside the button next to the title (e.g. tier badge). */
  trailing?: ReactNode;
  className?: string;
};
