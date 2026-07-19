export type SettingsRowProps = {
  title: string;
  subtitle?: string;
  selected?: boolean;
  showChevron?: boolean;
  onPress: () => void;
  className?: string;
};
