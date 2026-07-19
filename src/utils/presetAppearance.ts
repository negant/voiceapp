const PRESET_ACCENT_COLORS = [
  '#6366F1',
  '#EC4899',
  '#0EA5E9',
  '#F59E0B',
  '#10B981',
  '#8B5CF6',
  '#F97316',
  '#14B8A6',
] as const;

export function normalizePresetName(name: string): string {
  return name.trim();
}

export function isValidPresetName(name: string): boolean {
  const normalized = normalizePresetName(name);
  return normalized.length >= 1 && normalized.length <= 40;
}

export function getPresetAvatarInitial(name: string): string {
  const normalized = normalizePresetName(name);
  const match = normalized.match(/[A-Za-zÀ-ž0-9]/u);
  return (match?.[0] ?? '?').toUpperCase();
}

export function getPresetAccentColor(name: string): string {
  let hash = 0;
  const normalized = normalizePresetName(name).toLowerCase();

  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash + normalized.charCodeAt(index) * (index + 1)) % 2147483647;
  }

  return PRESET_ACCENT_COLORS[hash % PRESET_ACCENT_COLORS.length];
}

export function createPresetId(): string {
  return `preset_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function slugifyPresetName(name: string): string {
  return normalizePresetName(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}
