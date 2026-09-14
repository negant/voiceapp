declare module '@env' {
  export const APP_ENV: string;
  export const DEBUG_MODE: string;
  export const MAX_UPLOAD_SIZE_MB: string;
  export const SUPPORTED_AUDIO_FORMATS: string;
  export const PROCESSING_THREADS: string;
  export const ENABLE_AUDIO_PREVIEW: string;
  export const ENABLE_SOURCE_DENOISE: string;
  export const SOURCE_DENOISE_STRENGTH: string;
  export const APP_DISPLAY_NAME: string;
  /** Cloud AI provider key — vendor-agnostic name (provider may change). */
  export const AI_EFFECTS_API_KEY: string;
  export const AI_EFFECTS_API_BASE_URL: string;
  export const ENABLE_AI_EFFECTS: string;
  export const CREDITS_PER_STARTED_MINUTE: string;
  export const STARTING_CREDITS: string;
  export const PREMIUM_PRICE_USD: string;
  export const PREMIUM_CREDITS: string;
  export const PREMIUM_GRATIS_CREDITS: string;
  export const MAX_AUDIO_DURATION_FREE_SEC: string;
  export const MAX_AUDIO_DURATION_PREMIUM_SEC: string;
  /** App backend (devices / credits / setup) — not tied to a vendor name. */
  export const BACKEND_API_BASE_URL: string;
  export const BACKEND_API_TOKEN: string;
  export const PRIVACY_POLICY_URL: string;
}
