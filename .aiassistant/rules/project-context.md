---
apply: always
---

# Kontekst projektu (dla AI)

## Co to za projekt
- **Voice App** — aplikacja mobilna React Native (iOS + Android) do przetwarzania głosu w plikach dźwiękowych.
- Użytkownik wybiera / wrzuca plik audio (np. MP3); Basic/Advanced przetwarzają **lokalnie na urządzeniu**. Tier AI (WaveSpeed Chatterbox STS) wysyła audio do chmury gdy klucz jest skonfigurowany.
- Wersja w repo: `0.0.1` (boilerplate / faza początkowa).

## Cel produktu (roboczy)
- Import pliku audio z pamięci urządzenia lub udostępnionego źródła.
- **react-native-audio-api** — decode/encode audio, offline render (Basic Effects).
- **@soundtouchjs/core** — pitch shift WSOLA dla Advanced Effects (zamiast wycofanego `react-native-ffmpeg`).
- Podgląd i eksport przetworzonego pliku.
- Brak domyślnej zależności od backendu dla Basic/Advanced — prywatność jako założenie. AI (WaveSpeed) jest opcjonalne i wymaga klucza API.
- **Kredyty AI:** plany **free** (10 kredytów, ważne **3 mies. od instalacji**) i **premium** (**$4.99** / **100 + 25 gratis = 125 min**, **odnawiane co miesiąc**; free credits przy Premium **bezterminowe**; stawka app **$0.05**/min, API **$0.02**/min); env `PREMIUM_CREDITS` / `PREMIUM_GRATIS_CREDITS`; **1 kredyt = 1 rozpoczęta minuta**; bez doładowań. Backend: monorepo **`server/`** (Postgres Docker + Fastify), `CREDITS_API_BASE_URL` / `CREDITS_API_TOKEN`.

## Stack techniczny
- React Native `0.86`, React `19`, TypeScript.
- Nawigacja: `@react-navigation/native` + native stack.
- Alias importów: `@/` → `src/`.
- Zmienne środowiskowe: `.env` + `react-native-dotenv` (`src/config/env.ts`).
- **NativeWind v4** + Tailwind CSS 3 — stylowanie przez `className`.
- **SQLite** (`react-native-sqlite-storage`) — lokalna baza `voiceapp.db`, ustawienia i przyszłe dane offline.
- **react-native-reanimated** v4 — fade-out launchera; bez ciągłych animacji logo (wydajność).
- **react-native-gesture-handler** — wymagane przez `react-native-audio-api` i React Navigation; import na początku `index.js`.
- **react-native-svg** — logo SVG (`Logo`).
- **i18n** — PL/EN, `LocaleProvider`, `useTranslation()`, persystencja `app_locale` w SQLite.
- Testy: Jest (`npm test`), lint: ESLint (`npm run lint`).

## Struktura katalogów (docelowa)
```
src/
├── components/     # UI — Atomic Design
│   ├── atoms/        # Button, Icon, Text…
│   ├── molecules/    # ThemeToggle, FormField…
│   └── organisms/    # Screen, AudioFileCard…
├── config/         # env, stałe aplikacji (app.ts, launch.ts)
├── hooks/
├── i18n/           # tłumaczenia, LocaleProvider helpers
├── navigation/
├── providers/      # Database, Locale, Theme, AppAlert, ProcessedRecordingsCount
├── screens/        # ekrany (routing), nie components/
├── services/       # logika audio, pliki, database, credits, updates
│   ├── audio/
│   │   ├── basicEffects/     # presety DSP (presets/{id}/, wetRegistry)
│   │   ├── advancedEffects/  # efekty offline (effects/{id}/, registry)
│   │   └── aiEffects/        # WaveSpeed Chatterbox STS (narratorka, narrator, legionista); NetInfo gate
│   ├── credits/              # bootstrap instalacji → API (`server/`)
│   └── device/               # device_id (SQLite; Keychain później)
├── theme/          # legacy tokeny (preferuj Tailwind)
└── types/
```

Monorepo API: **`server/`** — Fastify + Postgres (Docker); docs `credits-backend.md`. Logi do `server/logs/` tylko przy `NODE_ENV=development`.

Szczegóły komponentów: `.aiassistant/rules/components.md`.

## Start aplikacji
- `App.tsx` → `AppProviders` → `AppContent`.
- Przed nawigacją: **LaunchScreen** (organism) ze statycznym **Logo** i jednorazowym fade-out.
- Launcher czeka na: min. czas animacji (`LAUNCH_MIN_DURATION_MS` w `src/config/launch.ts`) **oraz** gotowość DB + hydratację motywu i locale.
- Po fade-out wywoływany jest `AppNavigator`.

## Wersja i aktualizacje
- Wersja aplikacji: `src/config/app.ts` (`appVersion` z `package.json`).
- Status aktualizacji: `src/services/updates/` — stub `fetchAppUpdateStatus()` (gotowy pod App Store / Play Store / API).
- UI: sekcja „O aplikacji” na ekranie Ustawienia (`AppVersionInfo`).

## Środowisko developerskie
- Node.js >= 22.11
- macOS + Xcode — build iOS, CocoaPods (`ios/Podfile`)
- Android Studio + SDK — build Android
- Metro: `npm start`

## Ryzyka i ograniczenia
- Duże pliki audio — limity pamięci RAM; główny limit to czas (`MAX_AUDIO_DURATION_FREE_SEC` / `MAX_AUDIO_DURATION_PREMIUM_SEC`); rozmiar to safety cap (`MAX_UPLOAD_SIZE_MB`) w `.env`.
- Różnice iOS vs Android — uprawnienia, ścieżki plików, kodeki natywne.
- Przetwarzanie w tle — ograniczenia OS; na razie zakładamy przetwarzanie na pierwszym planie.
- Nowa Architektura React Native — włączona w RN 0.86; native moduły audio muszą być kompatybilne.

## Jak AI powinno pracować w tym repo
- Rozszerzaj `src/services/` zamiast wrzucać logikę do ekranów.
- Nowe komponenty UI w `src/components/{atoms|molecules|organisms}/Nazwa/` — patrz `components.md`.
- Po każdej istotnej zmianie: `CHANGELOG.md`, ewentualnie `PROGRESS.md` i `domain-knowledge.md`.
- Uruchamiaj `npm test` i `npm run lint` po zmianach w TS/TSX.
- Nie zakładaj backendu, chyba że użytkownik wyraźnie o to poprosi.
