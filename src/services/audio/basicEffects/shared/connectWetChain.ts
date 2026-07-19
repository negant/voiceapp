import { OfflineAudioContext } from 'react-native-audio-api';

import { copyMonoToContext } from '@/services/audio/basicEffects/shared/copyMonoToContext';
import {
  feedbackDecaySec,
  mixTailFromParams,
  WET_TAIL_PADDING_SEC,
} from '@/services/audio/basicEffects/shared/wetDuration';
import {
  WET_PRESET_REGISTRY,
  type WetPresetVoice,
} from '@/services/audio/basicEffects/wetRegistry';
import {
  combinedPlaybackRate,
  type AudioEffectDspParams,
} from '@/utils/audioEffectParams';

export type WetChainPresetVoice = WetPresetVoice | 'default';

export function calculateWetSourcePlaybackSec(
  sourceDurationSec: number,
  params: Pick<AudioEffectDspParams, 'detuneCents' | 'playbackRate'>,
): number {
  return sourceDurationSec / Math.max(combinedPlaybackRate(params), 0.1);
}

export function calculateWetTailSec(
  params: Pick<AudioEffectDspParams, 'echoMix' | 'reverbMix'>,
  presetVoice: WetChainPresetVoice = 'default',
): number {
  if (presetVoice !== 'default') {
    return WET_PRESET_REGISTRY[presetVoice].calculateTailSec(params);
  }

  return mixTailFromParams(params) + WET_TAIL_PADDING_SEC;
}

export function calculateWetRenderDurationSec(
  sourceDurationSec: number,
  params: AudioEffectDspParams,
  presetVoice: WetChainPresetVoice = 'default',
): number {
  return (
    calculateWetSourcePlaybackSec(sourceDurationSec, params) +
    calculateWetTailSec(params, presetVoice)
  );
}

export function connectWetChain(
  offlineCtx: OfflineAudioContext,
  monoSamples: Float32Array,
  sampleRate: number,
  sourceDurationSec: number,
  params: AudioEffectDspParams,
  presetVoice: WetChainPresetVoice = 'default',
): void {
  const preset =
    presetVoice === 'default' ? null : WET_PRESET_REGISTRY[presetVoice];
  const renderDurationSec = calculateWetRenderDurationSec(
    sourceDurationSec,
    params,
    presetVoice,
  );
  const contextBuffer = copyMonoToContext(offlineCtx, monoSamples, sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = contextBuffer as never;
  source.playbackRate.value = params.playbackRate;
  source.detune.value = params.detuneCents;

  const bassFilter = offlineCtx.createBiquadFilter();
  bassFilter.type = 'lowshelf';
  bassFilter.frequency.value = 180;

  const mix = preset
    ? preset.resolveMixGains(params)
    : {
        bassGainDb: params.bassGainDb,
        masterGain: 1,
        wetSend: Math.min(0.65, params.echoMix + params.reverbMix),
        dryGain: Math.max(0.4, 1 - Math.min(0.65, params.echoMix + params.reverbMix) * 0.55),
        reverbDelay1Sec: 0.04,
        reverbDelay2Sec: 0.11,
        reverbWetGain: params.reverbMix,
      };

  bassFilter.gain.value = mix.bassGainDb;

  const masterGain = offlineCtx.createGain();
  masterGain.gain.value = mix.masterGain;
  masterGain.connect(offlineCtx.destination);

  const dryGain = offlineCtx.createGain();
  dryGain.gain.value = mix.dryGain;

  source.connect(bassFilter);

  const wetSource = preset
    ? preset.connectVoiceChain(offlineCtx, bassFilter)
    : bassFilter;

  wetSource.connect(dryGain);
  dryGain.connect(masterGain);

  if (params.echoMix > 0.01) {
    if (preset) {
      preset.connectEcho(offlineCtx, wetSource, masterGain, params.echoMix);
    } else {
      const echoDelay = offlineCtx.createDelay(0.5);
      echoDelay.delayTime.value = 0.14 + params.echoMix * 0.16;
      const echoWet = offlineCtx.createGain();
      echoWet.gain.value = params.echoMix;
      wetSource.connect(echoDelay);
      echoDelay.connect(echoWet);
      echoWet.connect(masterGain);
    }
  }

  if (params.reverbMix > 0.01) {
    const reverbDelay1 = offlineCtx.createDelay(0.35);
    reverbDelay1.delayTime.value = mix.reverbDelay1Sec;
    const reverbDelay2 = offlineCtx.createDelay(0.55);
    reverbDelay2.delayTime.value = mix.reverbDelay2Sec;
    const reverbWet = offlineCtx.createGain();
    reverbWet.gain.value = mix.reverbWetGain;
    wetSource.connect(reverbDelay1);
    reverbDelay1.connect(reverbDelay2);
    reverbDelay2.connect(reverbWet);
    reverbWet.connect(masterGain);
  }

  preset?.connectAmbience?.(
    offlineCtx,
    masterGain,
    sampleRate,
    renderDurationSec,
  );

  const sourcePlaybackSec = calculateWetSourcePlaybackSec(
    sourceDurationSec,
    params,
  );
  source.start(0);
  source.stop(sourcePlaybackSec);
}

export { feedbackDecaySec };
