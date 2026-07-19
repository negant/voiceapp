import type {
  AppAlertIconHint,
  AppAlertVariant,
} from '@/components/molecules/AppAlert';

export type ShowAppAlertOptions = {
  title: string;
  message?: string;
  variant?: AppAlertVariant;
  iconHint?: AppAlertIconHint;
  confirmLabel?: string;
  /** Called after the alert is dismissed (OK or backdrop). */
  onDismiss?: () => void;
};

export type AppAlertContextValue = {
  /** Show a styled in-app alert (queued if one is already visible). */
  showAlert: (options: ShowAppAlertOptions) => void;
  dismissAlert: () => void;
  /** Convenience: error variant (failures, blocked actions). */
  showErrorAlert: (title: string, message?: string) => void;
  /** Convenience: warning variant (limits, validation). */
  showWarningAlert: (title: string, message?: string) => void;
  /** No internet — warning + wifi-off icon. */
  showOfflineAlert: () => void;
  /** Connection restored — success + wifi icon. */
  showOnlineAlert: () => void;
};
