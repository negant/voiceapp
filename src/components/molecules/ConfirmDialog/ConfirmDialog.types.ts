export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};
