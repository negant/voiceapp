export type DotBadgeTone = 'brand' | 'green' | 'yellow' | 'red' | 'gray';

export type DotBadgeProps = {
  /** Badge renders only when true; caller decides (e.g. recordings count > 0). */
  visible: boolean;
  /**
   * Fill color. `brand` matches the Your files header dot.
   * Status tones: green / yellow / red (+ gray for unknown).
   */
  tone?: DotBadgeTone;
  /**
   * `corner` — absolute top-right on a relative parent (header icons).
   * `inline` — flows next to text (Settings status row).
   */
  placement?: 'corner' | 'inline';
  className?: string;
};
