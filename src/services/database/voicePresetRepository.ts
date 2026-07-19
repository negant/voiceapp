import type {
  AdvancedEffectId,
  AiEffectId,
  AudioEffectKey,
  AudioEffects,
  SavedVoicePreset,
  SavedVoicePresetSource,
  VoicePresetId,
} from '@/types/voiceStudio';
import { getSQLiteManager } from '@/services/database/sqliteManager';
import {
  createPresetId,
  getPresetAccentColor,
  isValidPresetName,
  normalizePresetName,
} from '@/utils/presetAppearance';
import {
  getDerivedPresetAccentColor,
  getDerivedPresetAvatarKey,
} from '@/utils/derivedVoicePreset';

const EFFECT_KEYS: AudioEffectKey[] = [
  'pitch',
  'tempo',
  'echo',
  'reverb',
  'bass',
];

type VoicePresetRow = {
  id: string;
  name: string;
  pitch: number;
  tempo: number;
  echo: number;
  reverb: number;
  bass: number;
  accent_color: string;
  source_tier: string | null;
  source_id: string | null;
  avatar_image_key: string | null;
  chain_step1_tier: string | null;
  chain_step1_id: string | null;
  chain_step2_tier: string | null;
  chain_step2_id: string | null;
  created_at: number;
  updated_at: number;
};

function parsePresetSource(row: VoicePresetRow): SavedVoicePresetSource | undefined {
  if (!row.source_tier || !row.source_id) {
    return undefined;
  }

  if (row.source_tier === 'advanced') {
    return { tier: 'advanced', effectId: row.source_id as AdvancedEffectId };
  }

  if (row.source_tier === 'ai') {
    return { tier: 'ai', effectId: row.source_id as AiEffectId };
  }

  if (row.source_tier === 'basic') {
    return { tier: 'basic', presetId: row.source_id as VoicePresetId };
  }

  return undefined;
}

function parseEffectChainStep(
  tier: string | null,
  id: string | null,
): SavedVoicePresetSource | undefined {
  if (!tier || !id) {
    return undefined;
  }

  if (tier === 'advanced') {
    return { tier: 'advanced', effectId: id as AdvancedEffectId };
  }

  if (tier === 'ai') {
    return { tier: 'ai', effectId: id as AiEffectId };
  }

  if (tier === 'basic') {
    return { tier: 'basic', presetId: id as VoicePresetId };
  }

  return undefined;
}

function parseEffectChain(
  row: VoicePresetRow,
): [SavedVoicePresetSource, SavedVoicePresetSource] | undefined {
  const step1 = parseEffectChainStep(row.chain_step1_tier, row.chain_step1_id);
  const step2 = parseEffectChainStep(row.chain_step2_tier, row.chain_step2_id);

  if (!step1 || !step2) {
    return undefined;
  }

  return [step1, step2];
}

function getEffectRefId(ref: SavedVoicePresetSource): string {
  return ref.tier === 'basic' ? ref.presetId : ref.effectId;
}

export function mapVoicePresetRow(row: VoicePresetRow): SavedVoicePreset {
  return {
    id: row.id,
    name: row.name,
    effects: {
      pitch: row.pitch,
      tempo: row.tempo,
      echo: row.echo,
      reverb: row.reverb,
      bass: row.bass,
    },
    accentColor: row.accent_color,
    source: parsePresetSource(row),
    effectChain: parseEffectChain(row),
    avatarImageKey: row.avatar_image_key ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type VoicePresetCreateOptions = {
  source?: SavedVoicePresetSource;
  effectChain?: [SavedVoicePresetSource, SavedVoicePresetSource];
  accentColor?: string;
  avatarImageKey?: string;
};

function validateEffects(effects: AudioEffects): void {
  for (const key of EFFECT_KEYS) {
    const value = effects[key];
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new Error(`Invalid effect value for ${key}`);
    }
  }
}

export function buildVoicePresetInsert(
  name: string,
  effects: AudioEffects,
  options?: VoicePresetCreateOptions,
  now: number = Date.now(),
): SavedVoicePreset {
  const normalizedName = normalizePresetName(name);
  if (!isValidPresetName(normalizedName)) {
    throw new Error('Invalid preset name');
  }

  validateEffects(effects);

  const source = options?.source;
  const effectChain = options?.effectChain;
  const chainPrimary = effectChain?.[0];
  const accentColor =
    options?.accentColor ??
    (chainPrimary
      ? getDerivedPresetAccentColor(chainPrimary)
      : source
        ? getDerivedPresetAccentColor(source)
        : getPresetAccentColor(normalizedName));
  const avatarImageKey =
    options?.avatarImageKey ??
    (chainPrimary
      ? getDerivedPresetAvatarKey(chainPrimary)
      : source
        ? getDerivedPresetAvatarKey(source)
        : undefined);

  return {
    id: createPresetId(),
    name: normalizedName,
    effects: { ...effects },
    accentColor,
    source,
    effectChain,
    avatarImageKey,
    createdAt: now,
    updatedAt: now,
  };
}

export async function listVoicePresets(): Promise<SavedVoicePreset[]> {
  const result = await getSQLiteManager().executeQuery<VoicePresetRow>(
    `SELECT id, name, pitch, tempo, echo, reverb, bass, accent_color,
            source_tier, source_id, avatar_image_key,
            chain_step1_tier, chain_step1_id, chain_step2_tier, chain_step2_id,
            created_at, updated_at
     FROM voice_presets
     ORDER BY created_at ASC`,
  );

  if (!result.success) {
    throw new Error(result.error ?? 'Failed to list voice presets');
  }

  return result.data.map(mapVoicePresetRow);
}

export async function createVoicePreset(
  name: string,
  effects: AudioEffects,
  options?: VoicePresetCreateOptions,
): Promise<SavedVoicePreset> {
  const preset = buildVoicePresetInsert(name, effects, options);
  const result = await getSQLiteManager().executeQuery(
    `INSERT INTO voice_presets (
      id, name, pitch, tempo, echo, reverb, bass, accent_color,
      source_tier, source_id, avatar_image_key,
      chain_step1_tier, chain_step1_id, chain_step2_tier, chain_step2_id,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      preset.id,
      preset.name,
      preset.effects.pitch,
      preset.effects.tempo,
      preset.effects.echo,
      preset.effects.reverb,
      preset.effects.bass,
      preset.accentColor,
      preset.source?.tier ?? null,
      preset.source ? getEffectRefId(preset.source) : null,
      preset.avatarImageKey ?? null,
      preset.effectChain?.[0].tier ?? null,
      preset.effectChain ? getEffectRefId(preset.effectChain[0]) : null,
      preset.effectChain?.[1].tier ?? null,
      preset.effectChain ? getEffectRefId(preset.effectChain[1]) : null,
      preset.createdAt,
      preset.updatedAt,
    ],
  );

  if (!result.success) {
    throw new Error(result.error ?? 'Failed to save voice preset');
  }

  return preset;
}

export async function getVoicePresetById(
  id: string,
): Promise<SavedVoicePreset | null> {
  const result = await getSQLiteManager().executeQuery<VoicePresetRow>(
    `SELECT id, name, pitch, tempo, echo, reverb, bass, accent_color,
            source_tier, source_id, avatar_image_key,
            chain_step1_tier, chain_step1_id, chain_step2_tier, chain_step2_id,
            created_at, updated_at
     FROM voice_presets
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  if (!result.success) {
    throw new Error(result.error ?? 'Failed to read voice preset');
  }

  const row = result.data[0];
  return row ? mapVoicePresetRow(row) : null;
}

export function hasDuplicatePresetName(
  presets: SavedVoicePreset[],
  name: string,
  excludeId?: string,
): boolean {
  const normalized = normalizePresetName(name).toLowerCase();
  return presets.some(
    preset =>
      preset.id !== excludeId &&
      preset.name.toLowerCase() === normalized,
  );
}

export async function updateVoicePreset(
  id: string,
  effects: AudioEffects,
  name?: string,
): Promise<SavedVoicePreset> {
  const existing = await getVoicePresetById(id);
  if (!existing) {
    throw new Error('Preset not found');
  }

  validateEffects(effects);

  const nextName = name ? normalizePresetName(name) : existing.name;
  if (!isValidPresetName(nextName)) {
    throw new Error('Invalid preset name');
  }

  const updatedAt = Date.now();
  const result = await getSQLiteManager().executeQuery(
    `UPDATE voice_presets
     SET name = ?, pitch = ?, tempo = ?, echo = ?, reverb = ?, bass = ?, updated_at = ?
     WHERE id = ?`,
    [
      nextName,
      effects.pitch,
      effects.tempo,
      effects.echo,
      effects.reverb,
      effects.bass,
      updatedAt,
      id,
    ],
  );

  if (!result.success) {
    throw new Error(result.error ?? 'Failed to update voice preset');
  }

  return {
    ...existing,
    name: nextName,
    effects: { ...effects },
    updatedAt,
  };
}

export async function deleteVoicePreset(id: string): Promise<void> {
  const result = await getSQLiteManager().executeQuery(
    'DELETE FROM voice_presets WHERE id = ?',
    [id],
  );

  if (!result.success) {
    throw new Error(result.error ?? 'Failed to delete voice preset');
  }
}
