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
  aiEffectsApiKey: 'wsk_test_key',
  aiEffectsApiBaseUrl: 'https://api.wavespeed.ai/api/v3',
  aiEffectsApiStatusUrl: 'https://api.wavespeed.ai/public/v3/summary.json',
  enableAiEffects: true,
  creditsPerStartedMinute: 1,
  startingCredits: 10,
  premiumPriceUsd: 4.99,
  premiumCredits: 100,
  premiumGratisCredits: 25,
  maxAudioDurationFreeSec: 60,
  maxAudioDurationPremiumSec: 600,
  backendApiBaseUrl: null as string | null,
  backendApiToken: null as string | null,
  privacyPolicyUrl: 'https://ukrywane.pl/privacy',
};

export function isAiEffectsConfigured(): boolean {
  return Boolean(env.enableAiEffects && env.aiEffectsApiKey);
}

export function isCloudAiConfigured(): boolean {
  return isAiEffectsConfigured();
}
