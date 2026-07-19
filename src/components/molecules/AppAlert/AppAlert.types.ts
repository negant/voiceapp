export type AppAlertVariant = 'info' | 'success' | 'warning' | 'error';

export type AppAlertIconHint = 'default' | 'offline' | 'online';

export type AppAlertProps = {
  visible: boolean;
  title: string;
  message?: string;
  variant?: AppAlertVariant;
  /** Prefer wifi icons for connectivity alerts. */
  iconHint?: AppAlertIconHint;
  confirmLabel?: string;
  onClose: () => void;
};
