export type SuccessDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onClose: () => void;
};
