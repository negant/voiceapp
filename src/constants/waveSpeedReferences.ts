/**
 * Bundled WaveSpeed reference samples under `assets/references/`.
 * Uploaded to WaveSpeed as `reference_audio` for Chatterbox STS.
 */
export const WAVESPEED_REFERENCE_AUDIO_ASSETS = {
  narratorka: require('../../assets/references/narratorFemale.mp3'),
  narrator: require('../../assets/references/narratorMale.mp3'),
  legionista: require('../../assets/references/legionary.mp3'),
} as const;

/**
 * Android release: Image.resolveAssetSource returns lowercased res/raw names
 * (e.g. assets_references_narratorfemale). APK assets/ ships the same files at root
 * (via Gradle sourceSet) with original camelCase filenames.
 */
export const WAVESPEED_REFERENCE_ANDROID_BUNDLE_PATHS: Record<string, string> = {
  assets_references_narratorfemale: 'narratorFemale.mp3',
  assets_references_narratormale: 'narratorMale.mp3',
  assets_references_legionary: 'legionary.mp3',
};
