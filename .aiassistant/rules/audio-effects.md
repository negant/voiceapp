---
apply: always
---

# Audio effects — struktura modułów

Voice App ma dwa poziomy efektów audio. Każdy efekt/preset ma **własny folder** — nie twórz monolitycznych plików z wieloma efektami.

## Basic Effects (`src/services/audio/basicEffects/`)

Presety DSP (slidery + opcjonalny wet chain Web Audio).

```
basicEffects/
  applyBasicEffect.ts      # pipeline wejście → DSP → WAV
  wetRegistry.ts           # mapa presetów z wet chain (robot, kratos, …)
  types.ts
  shared/                  # kod współdzielony (connectWetChain, tapeSaturation, …)
  presets/
    {presetId}/
      effects.ts           # wartości sliderów (AudioEffects) — obowiązkowe dla każdego presetu
      index.ts             # eksport BasicWetPresetModule — tylko gdy preset ma wet chain
      voiceChain.ts        # łańcuch głosu (wet)
      connectEcho.ts       # echo (wet)
      mixGains.ts          # mix dry/wet
      preProcess.ts        # opcjonalnie
      ambience.ts          # opcjonalnie (oldRadio, submarine)
```

### Zasady Basic

1. **Jeden preset = jeden folder** w `presets/{presetId}/`.
2. **`effects.ts`** — jedyne miejsce na wartości `AudioEffects` presetu; `voiceStudioEffects.ts` agreguje je w `PRESET_AUDIO_EFFECTS`.
3. **Wet chain** — tylko presety z niestandardowym renderowaniem (robot, helium, oldRadio) rejestruj w `wetRegistry.ts`.
4. **Współdzielony kod** — wyłącznie w `shared/`; nie kopiuj logiki między presetami bez uzasadnienia.
5. **`audioDsp.ts`** — tylko re-export wstecznej kompatybilności; nowy kod importuj z `basicEffects/`.

## Advanced Effects (`src/services/audio/advancedEffects/`)

Efekty offline (łańcuch filtrów, SoundTouch pitch shift).

```
advancedEffects/
  applyAdvancedEffect.ts   # pipeline decode → filtry → encode WAV
  registry.ts              # mapa AdvancedEffectId → definicja
  types.ts
  shared/                  # filters, soundtouchPitchShift
  effects/
    {effectId}/
      {effectId}Effect.ts  # definicja filtrów + ffmpegReference
      {effectId}Effect.test.ts
```

### Zasady Advanced

1. **Jeden efekt = jeden folder** w `effects/{effectId}/`.
2. **Rejestr** — każdy nowy efekt dodaj do `registry.ts` i `ADVANCED_EFFECTS` (`constants/advancedEffects.ts`).
3. **Typy** — rozszerz `AdvancedEffectId` w `src/types/voiceStudio.ts`.
4. **i18n** — klucze `voiceStudio.advancedEffectItems.{id}` we wszystkich `locales/*.json` + `schema.json`.
5. **Ikona** — `AdvancedEffectIcon` dla nowego `effectId`.
6. **Nie duplikuj Basic** — presety sliderów (np. Light / Deep) należą do Basic, nie Advanced.
7. **Filtry łańcucha** — `highpass`, `noise_reduce`, `pitch_shift`, `formant_shift`, `tempo_shift`, `equalizer`, `lowshelf`, `resonant_echo`, `lowpass`, `soft_clip`, `waveshaper`, `gain`.

## Testy

- Każdy nowy efekt/preset: test jednostkowy obok modułu.
- Po zmianach: `npm test` i `npm run lint`.

## Dodawanie nowego efektu — checklist

### Basic (slider + ewentualny wet)

- [ ] `presets/{id}/effects.ts`
- [ ] Jeśli wet: `index.ts`, `voiceChain.ts`, … + wpis w `wetRegistry.ts`
- [ ] `VoicePresetId` + `VOICE_PRESETS` + i18n `voiceStudio.presets.{id}`
- [ ] Testy wartości / wet tail jeśli dotyczy

### Advanced

- [ ] `effects/{id}/{id}Effect.ts` + test
- [ ] `registry.ts`, `AdvancedEffectId`, `ADVANCED_EFFECTS`
- [ ] i18n, `AdvancedEffectIcon`, test `applyAdvancedEffect`

## AI Effects (`src/services/audio/aiEffects/`)

Cloud Speech-to-Speech via **WaveSpeed Chatterbox** (internal). UI catalog: **narratorka**, **narrator**, **legionista**, **demonMale**, **frenchFemale**, **matureMale**, **femaleSensual** (PNG avatars). User-facing copy: advanced AI + internet required (no vendor/API branding). Offline → AI cards disabled + **AppAlert** (`showOfflineAlert`). Output = API **MP3**.

```
aiEffects/
  applyAiEffect.ts
  registry.ts
  waveSpeed/
    waveSpeedSpeechToSpeech.ts   # upload → submit → poll → download MP3
    applyWaveSpeedAiEffect.ts
    waveSpeedConfig.ts
```

Requires `AI_EFFECTS_API_KEY` + `ENABLE_AI_EFFECTS` + `AI_EFFECTS_API_BASE_URL` (default WaveSpeed v3). References: `assets/references/` (`narratorFemale.mp3`, `narratorMale.mp3`, `legionary.mp3`, `demonMale.mp3`, `frenchFemale.mp3`, `matureMale.mp3`, `femaleSensual.mp3`) via `waveSpeedReferences.ts`. Extra avatar PNGs under `assets/presets/` (romantyczna, pirat, ogr, …) are kept for later use.

### AI — checklist

- [ ] `AiEffectId`, `AI_EFFECTS`, i18n `voiceStudio.aiEffectItems.{id}`
- [ ] `AiEffectCard`, `AiEffectIcon`
- [ ] reference asset in `waveSpeedReferences.ts`
- [ ] `processAudio` branch `effectTier: 'ai'`
