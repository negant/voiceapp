import type { AudioEffects, VoicePresetId } from '@/types/voiceStudio';

import {
  AUDIO_EFFECT_DISPLAY_MAX,
  storageToDisplay,
} from './audioEffectScale';

export type AudioEffectDspParams = {
  detuneCents: number;
  playbackRate: number;
  bassGainDb: number;
  echoMix: number;
  reverbMix: number;
};

function effectToUnit(storageValue: number): number {
  return storageToDisplay(storageValue) / AUDIO_EFFECT_DISPLAY_MAX;
}

/** Wet effects use the same -10…+10 UI; 0 and below = off, positive = mix amount. */
function wetMixFromStorage(storageValue: number, maxMix: number): number {
  const display = storageToDisplay(storageValue);
  if (display <= 0) {
    return 0;
  }

  return (display / AUDIO_EFFECT_DISPLAY_MAX) * maxMix;
}

function maxEchoMixForPreset(voicePresetId?: VoicePresetId): number {
  switch (voicePresetId) {
    case 'robot':
      return 0.95;
    case 'helium':
      return 0.48;
    case 'oldRadio':
      return 0.58;
    case 'demon':
      return 0.98;
    case 'telephone':
      return 0.55;
    case 'leader':
      return 0.92;
    case 'alien':
      return 0.78;
    case 'turtle':
    case 'cheetah':
      return 0.5;
    default:
      return 0.5;
  }
}

function maxReverbMixForPreset(voicePresetId?: VoicePresetId): number {
  switch (voicePresetId) {
    case 'robot':
      return 0.72;
    case 'helium':
      return 0.42;
    case 'oldRadio':
      return 0.52;
    case 'demon':
      return 0.82;
    case 'telephone':
      return 0.4;
    case 'leader':
      return 0.68;
    case 'alien':
      return 0.72;
    case 'turtle':
    case 'cheetah':
      return 0.45;
    default:
      return 0.45;
  }
}

export type MapEffectsOptions = {
  voicePresetId?: VoicePresetId;
  /** @deprecated Use voicePresetId instead. */
  robotVoice?: boolean;
  /** @deprecated Use voicePresetId instead. */
  heliumVoice?: boolean;
  /** @deprecated Use voicePresetId instead. */
  oldRadioVoice?: boolean;
};

function resolveVoicePresetId(options?: MapEffectsOptions): VoicePresetId | undefined {
  if (options?.voicePresetId) {
    return options.voicePresetId;
  }
  if (options?.robotVoice) {
    return 'robot';
  }
  if (options?.heliumVoice) {
    return 'helium';
  }
  if (options?.oldRadioVoice) {
    return 'oldRadio';
  }
  return undefined;
}

/** Maps UI/storage effect values to Web Audio graph parameters. */
export function mapEffectsToDspParams(
  effects: AudioEffects,
  options?: MapEffectsOptions,
): AudioEffectDspParams {
  const pitch = effectToUnit(effects.pitch);
  const tempo = effectToUnit(effects.tempo);
  const bass = effectToUnit(effects.bass);
  const voicePresetId = resolveVoicePresetId(options);

  const params: AudioEffectDspParams = {
    detuneCents: pitch * 500,
    playbackRate: Math.max(0.5, Math.min(2, 1 + tempo * 0.3)),
    bassGainDb: bass * 12,
    echoMix: wetMixFromStorage(
      effects.echo,
      maxEchoMixForPreset(voicePresetId),
    ),
    reverbMix: wetMixFromStorage(
      effects.reverb,
      maxReverbMixForPreset(voicePresetId),
    ),
  };

  switch (voicePresetId) {
    case 'robot':
      return {
        ...params,
        detuneCents: Math.min(params.detuneCents, -320),
        playbackRate: Math.min(params.playbackRate, 0.88),
        bassGainDb: Math.min(params.bassGainDb, -5),
      };
    case 'helium':
      return {
        ...params,
        detuneCents: Math.max(params.detuneCents, 540),
        bassGainDb: Math.min(params.bassGainDb, -6),
        playbackRate: Math.max(params.playbackRate, 1.14),
        echoMix: Math.max(params.echoMix, 0.38),
        reverbMix: Math.max(params.reverbMix, 0.32),
      };
    case 'oldRadio':
      return {
        ...params,
        detuneCents: Math.min(params.detuneCents, -120),
        bassGainDb: Math.min(params.bassGainDb, 1),
        playbackRate: Math.min(params.playbackRate, 0.94),
        echoMix: Math.max(params.echoMix, 0.7),
        reverbMix: Math.max(params.reverbMix, 0.58),
      };
    case 'demon':
      return {
        ...params,
        detuneCents: Math.min(params.detuneCents, -440),
        bassGainDb: Math.max(params.bassGainDb, 8),
        playbackRate: Math.min(params.playbackRate, 0.84),
        echoMix: Math.max(params.echoMix, 0.88),
        reverbMix: Math.max(params.reverbMix, 0.78),
      };
    case 'telephone':
      return {
        ...params,
        detuneCents: Math.min(params.detuneCents, -60),
        bassGainDb: Math.min(params.bassGainDb, -1),
        playbackRate: Math.min(params.playbackRate, 0.98),
        echoMix: Math.max(params.echoMix, 0.5),
        reverbMix: Math.max(params.reverbMix, 0.34),
      };
    case 'leader':
      return {
        ...params,
        detuneCents: Math.min(params.detuneCents, -200),
        playbackRate: Math.min(params.playbackRate, 0.9),
        bassGainDb: Math.min(params.bassGainDb, 3),
        echoMix: Math.max(params.echoMix, 0.8),
        reverbMix: Math.max(params.reverbMix, 0.58),
      };
    case 'alien':
      return {
        ...params,
        detuneCents: Math.max(params.detuneCents, 500),
        bassGainDb: Math.min(params.bassGainDb, -4),
        playbackRate: Math.max(0.94, Math.min(params.playbackRate, 1.08)),
        echoMix: Math.max(params.echoMix, 0.68),
        reverbMix: Math.max(params.reverbMix, 0.66),
      };
    case 'turtle':
      return {
        ...params,
        playbackRate: Math.min(params.playbackRate, 0.74),
        detuneCents: Math.min(params.detuneCents, -140),
        bassGainDb: Math.max(params.bassGainDb, 3),
      };
    case 'cheetah':
      return {
        ...params,
        playbackRate: Math.max(params.playbackRate, 1.28),
        detuneCents: Math.max(params.detuneCents, 140),
        bassGainDb: Math.min(params.bassGainDb, 0),
      };
    default:
      return params;
  }
}

/** Matches BufferSource playbackRate * 2^(detune/1200) used in offline render. */
export function combinedPlaybackRate(
  params: Pick<AudioEffectDspParams, 'playbackRate' | 'detuneCents'>,
): number {
  const pitchFactor = 2 ** (params.detuneCents / 1200);
  return params.playbackRate * pitchFactor;
}

export function hasAudibleEffects(params: AudioEffectDspParams): boolean {
  return (
    Math.abs(params.detuneCents) > 1 ||
    Math.abs(params.playbackRate - 1) > 0.01 ||
    Math.abs(params.bassGainDb) > 0.2 ||
    params.echoMix > 0.02 ||
    params.reverbMix > 0.02
  );
}

/** Echo/reverb need OfflineAudioContext; pitch/tempo/bass can run in JS. */
export function needsWetProcessing(params: AudioEffectDspParams): boolean {
  return params.echoMix > 0.01 || params.reverbMix > 0.01;
}
