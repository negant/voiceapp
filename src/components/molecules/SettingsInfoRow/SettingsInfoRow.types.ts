export type SettingsInfoRowProps = {
  label: string;
  value: string;
  className?: string;
  /** Allow selecting / copying long values (e.g. device id). */
  selectable?: boolean;
  /** Use smaller mono-ish text for long identifiers. */
  compactValue?: boolean;
};
