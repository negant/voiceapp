# Postęp prac — Voice App

Ostatnia aktualizacja: **2026-07-20**

## Status ogólny
Faza: **Voice Studio + Basic/Advanced DSP + AI (WaveSpeed Chatterbox STS)**

## Zrobione
- [x] Inicjalizacja React Native 0.86 (iOS + Android)
- [x] Struktura `src/` (components, hooks, navigation, screens, theme)
- [x] React Navigation (stack)
- [x] Motyw jasny / ciemny
- [x] Testy Jest, ESLint
- [x] Dokumentacja AI (`AGENTS.md`, `.aiassistant/rules/`)
- [x] `CHANGELOG.md`, `.env.example`, konfiguracja env
- [x] **NativeWind v4** — stylowanie Tailwind (`className`)
- [x] Tryb jasny/ciemny z przełącznikiem w nawigacji
- [x] **SQLite** — lokalna baza, persystencja motywu
- [x] **Atomic Design** — `src/components/{atoms,molecules,organisms}/`
- [x] Dokumentacja komponentów (`components.md`) + aktualizacja reguł AI
- [x] Logo aplikacji (SVG, fala dźwiękowa) — komponent `Logo` + `assets/logo.svg`
- [x] Ikony aplikacji iOS + Android wygenerowane z logo (`npm run generate:icons`)
- [x] **i18n** — PL/EN, `useTranslation`, JSON w `src/i18n/locales/`, zapis języka w SQLite
- [x] Ekrany Ustawienia + Język aplikacji (ikona w nagłówku)
- [x] Sekcja wersji aplikacji i statusu aktualizacji w ustawieniach (stub)
- [x] Launcher: komiksowe tło z awatarami presetów (5 paneli pod skosem)
- [x] Voice Studio na Home — UI + przetwarzanie audio (demo 30 s)
- [x] Zapis własnych presetów głosu w SQLite
- [x] Import audio (picker) + eksport (pobieranie) + odsłuch
- [x] DSP Basic + Advanced (pitch/tempo/bass/echo/reverb + SoundTouch / formant)
- [x] **Nagrywanie z mikrofonu**
- [x] **AI Effects — WaveSpeed** — Narratorka / Narrator / Legionista; referencje `assets/references/`
- [x] **Usunięcie wstępnego odszumiania** — import/nagranie bez denoise (tylko trim); denoise opcjonalnie przy konwersji Basic/Advanced
- [x] **Usunięcie ElevenLabs** — brak EL w stacku; awatary PNG byłych głosów zostawione w `assets/presets/`
- [x] **AI offline gate** — NetInfo; bez sieci AI wyłączone + stylowany AppAlert
- [x] **AppAlert system** — provider + helpery offline/online (reuse na przyszłość)
- [x] **Twoje efekty — Połącz efekty:** łańcuch 2 efektów
- [x] FAQ — tiery, czas, legalność, jakość wyniku (PL/EN)
- [x] **Komunikacja tierów** — badge local/cloud, podsumowanie przed konwersją, spójne copy PL/EN (prywatność vs AI w chmurze)
- [x] **Limity audio** — Free **60 s** / Premium **10 min**; limity w `.env` (`MAX_AUDIO_DURATION_*_SEC`); import limitowany czasem (nie MB w UI)
- [x] **Plan konta** — `free` / `premium` w SQLite; gate „Połącz efekty”; blokada 2× AI w łańcuchu
- [x] **Limity długości** — Free **1 min** (UI: **60 s**), Premium **10 min** (env + plan); import/nagranie/trim; copy w planach i FAQ
- [x] **Kredyty / plany** — **Free** (10 kr) + **Premium** (**$4.99** / **100 + 25 gratis = 125 min**); env `PREMIUM_CREDITS` / `PREMIUM_GRATIS_CREDITS`; **1 kr = 1 rozpoczęta minuta**; bez doładowań
- [x] **AI ↔ kredyty w UI** — limit nagrania/konwersji AI z salda; hinty kosztu (rozpoczęte minuty); `resolveEffectiveAiMaxDurationSec`
- [x] **Pula testowa 30k instalacji** — dokumentacja API (`credits-backend.md`), stałe, stub bootstrap, copy PL/EN
- [x] **Fix AI po trimie** — `prepareAiSourceForSts` (trim w pamięci → base64 do STS); osobna ścieżka `processAiTierAudio`

## W toku
- [ ] **Deploy API na VPS** — Debian, `api.ukrywane.pl` → `91.228.196.27`; Caddy HTTPS, systemd, Postgres Docker
- [ ] Keychain/Keystore dla trwałego `device_id` (anty-reinstall)
- [ ] Podpięcie `GET /v1/setup` w `fetchAppUpdateStatus`

## Zrobione (niedawno)
- [x] DNS prod API: `api.ukrywane.pl`; `.env` → `https://api.ukrywane.pl`
- [x] Sync plan/saldo z API (start, plan, spend AI)
- [x] **Backend kredytów** — monorepo `server/` (Docker Postgres + Fastify)
- [x] Device ID w ustawieniach + bootstrap API

## Uwagi
- AI wymaga `WAVESPEED_API_KEY` + `ENABLE_WAVESPEED_STS` — audio opuszcza urządzenie.
- Awatary PNG byłych efektów AI (romantyczna, pirat, ogr, …) zostawione w `assets/presets/` na później.
- Przetwarzanie DSP: `react-native-audio-api`; wynik WAV.
