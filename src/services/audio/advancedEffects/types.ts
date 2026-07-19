import type { AdvancedEffectId } from '@/types/voiceStudio';

/** Declarative FFmpeg-style filter step — executed by the advanced effects runner. */
export type FfmpegFilterStep =
  | {
      type: 'highpass';
      frequencyHz: number;
    }
  | {
      type: 'pitch_shift';
      /** Pitch multiplier (1.0 = unchanged). Mirrors asetrate + atempo in FFmpeg. */
      factor: number;
    }
  | {
      type: 'formant_shift';
      /** Spectral-envelope stretch (>1 brighter / feminine, <1 darker / masculine). */
      factor: number;
    }
  | {
      type: 'tempo_shift';
      /** Tempo multiplier (<1 slower speech, >1 faster) without changing pitch. */
      factor: number;
    }
  | {
      type: 'noise_reduce';
      /** 0–1 cleanup strength for hiss / room noise in uploaded recordings. */
      strength: number;
    }
  | {
      type: 'equalizer';
      frequencyHz: number;
      gainDb: number;
      q?: number;
    }
  | {
      type: 'lowpass';
      frequencyHz: number;
    }
  | {
      type: 'soft_clip';
      /** 0–1 drive amount — mirrors tape saturation in basic Kratos wet chain. */
      amount: number;
    }
  | {
      type: 'lowshelf';
      frequencyHz: number;
      gainDb: number;
    }
  | {
      type: 'waveshaper';
      /** 0–1 curve amount — same tape curve as basic wet presets. */
      amount: number;
      /** Pre-drive before lookup — hotter signal yields more gravel harmonics. */
      inputGain?: number;
    }
  | {
      type: 'gain';
      /** Linear output trim — use <1 to recover headroom after EQ/saturation. */
      linear: number;
    }
  | {
      type: 'resonant_echo';
      /** Wet mix 0–1 — multi-tap hall/slap inspired by basic Kratos. */
      mix: number;
      /** Grit on echo taps — subtle gravel on reflections. */
      grit?: number;
      /** Optional tap overrides — defaults to Commander-style delays when omitted. */
      taps?: Array<{ delaySec: number; gain: number }>;
    };

export type AdvancedEffectDefinition = {
  id: AdvancedEffectId;
  /** Human-readable FFmpeg filter chain reference for debugging/docs. */
  ffmpegReference: string;
  filters: FfmpegFilterStep[];
};
