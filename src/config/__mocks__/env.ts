export const env = {
  appEnv: 'test',
  debugMode: false,
  maxUploadSizeMb: 50,
  supportedAudioFormats: ['mp3', 'wav'],
  processingThreads: 2,
  enableAudioPreview: true,
  enableSourceDenoise: true,
  sourceDenoiseStrength: 0.58,
  appDisplayName: 'Voice App',
  waveSpeedApiKey: 'wsk_test_key',
  enableWaveSpeedSts: true,
  creditsPerStartedMinute: 1,
  startingCredits: 10,
  premiumPriceUsd: 4.99,
  appUsdPerStartedMinute: 0.05,
  premiumCredits: 100,
  premiumGratisCredits: 25,
  maxAudioDurationFreeSec: 60,
  maxAudioDurationPremiumSec: 600,
  creditsApiBaseUrl: null as string | null,
  creditsApiToken: null as string | null,
} as const;

export function isWaveSpeedStsConfigured(): boolean {
  return Boolean(env.enableWaveSpeedSts && env.waveSpeedApiKey);
}

export function isCloudAiConfigured(): boolean {
  return isWaveSpeedStsConfigured();
}
