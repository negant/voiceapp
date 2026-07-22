---
apply: always
---

# Architektura — Voice App

## Stack i runtime
- **React Native 0.86** — jedna codebase, dwa natywne targety (iOS, Android).
- **TypeScript** — typowanie w warstwie UI i serwisów.
- **Hermes** — silnik JS (domyślnie w RN 0.86).
- **New Architecture** — włączona; nowe native moduły planuj pod Fabric/TurboModules.
- **react-native-reanimated** v4 — animacje UI na wątku UI; wymaga pluginu Babel.

## Warstwy aplikacji

```
┌─────────────────────────────────────┐
│  screens/          Ekrany + flow UI │
├─────────────────────────────────────┤
│  components/       UI (atomic design) │
│    atoms/ molecules/ organisms/     │
├─────────────────────────────────────┤
│  hooks/            Logika React     │
├─────────────────────────────────────┤
│  navigation/       React Navigation│
├─────────────────────────────────────┤
│  services/         Audio, pliki,   │
│                    database (SQLite)│
│                    credits (stub)  │
│                    updates (stub)  │
├─────────────────────────────────────┤
│  config/           env, stałe       │
│                    (app, launch)   │
├─────────────────────────────────────┤
│  i18n/             tłumaczenia PL/EN│
└─────────────────────────────────────┘
         │                    │
         ▼                    ▼
   React Native bridge   Native (iOS/Android)
   (przyszłe moduły audio)
```

## Cykl życia aplikacji (start)

```
AppProviders (SafeArea → Database → Locale → Theme)
       │
       ▼
  AppContent
       │
       ├─ launchComplete === false
       │       └─ LaunchScreen (Logo + tytuł, fade-out)
       │              isAppReady = DB + theme hydrated + locale hydrated
       │              + min. czas animacji (launch.ts)
       │
       └─ launchComplete === true
               └─ AppNavigator (stack)
```

- Pusty ekran ładowania **nie** jest używany — zamiast tego launcher z animacją logo.
- `StatusBar` ustawiany już na launcherze (motyw jasny/ciemny).

## Przepływ danych (docelowy — voice processing)

1. **Import** — użytkownik wybiera plik (`DocumentPicker` / `react-native-fs` — do wdrożenia).
2. **Walidacja** — format, rozmiar (`env.maxUploadSizeMb`), metadane.
3. **Przetwarzanie** — pipeline lokalny w `services/audio/` (natywny moduł lub biblioteka — TBD).
4. **Podgląd** — odtwarzacz w aplikacji.
5. **Eksport** — zapis do pamięci urządzenia / share sheet.

Na etapie boilerplate flow kończy się na **Voice Studio** (UI + stub serwisów); natywny pipeline DSP — TBD.

## Voice Studio (ekran główny)
- Organism: `VoiceStudioPanel`; stan: hook `useVoiceStudio`.
- Serwisy: `src/services/audio/` (`audioImport`, `audioProcessing`).
- Typy: `src/types/voiceStudio.ts`; presety: `src/constants/voiceStudio.ts`.

## Frontend i UI
- **NativeWind v4** — utility-first styling (`className` + Tailwind CSS 3).
- `global.css` importowany w `App.tsx`; Metro opakowany `withNativeWind`.
- Kolory semantyczne w `tailwind.config.js`; dark mode przez prefiks `dark:`.
- `src/lib/cn.ts` — łączenie klas warunkowych.
- `src/theme/` — legacy tokeny (opcjonalnie); preferuj klasy Tailwind w nowym kodzie.

### Komponenty (Atomic Design)
- `src/components/atoms/` — najmniejsze elementy (np. `Button`, `Logo`).
- `src/components/molecules/` — kilka atomów + prosta logika (np. `ThemeToggle`, `AppVersionInfo`).
- `src/components/organisms/` — większe sekcje UI (np. `Screen`, `LaunchScreen`).
- Jeden komponent = folder `Nazwa/` z `Nazwa.tsx` + `index.ts`.
- Import: `import { Button, Screen, ThemeToggle } from '@/components';`
- Szczegóły: `components.md`.

## Konfiguracja
- `.env` — zmienne developerskie (nie w repo).
- `.env.example` — szablon dokumentowany.
- `src/config/env.ts` — jedyny punkt odczytu env w kodzie aplikacji.
- `src/config/app.ts` — `appVersion` (z `package.json`).
- `src/config/launch.ts` — czas trwania launchera, `canCompleteLaunch()`.

## Internacjonalizacja (i18n)
- Tłumaczenia w `src/i18n/locales/{pl,en}.json` — płaski JSON z kluczami kropkowymi (`home.description`).
- `LocaleProvider` + hook `useTranslation()` → `t('key', { param: value })`.
- Persystencja języka w SQLite (`settings.app_locale`).
- Domyślny język przy braku zapisu: **język urządzenia** (`src/utils/deviceLocale.ts`, `Intl`), fallback **`en`**.
- Domyślny język tłumaczeń (missing key): **`en`**. Nowy klucz → `en.json` + wszystkie locale + `npm run i18n:schema`; typ `TranslationKey` z `en.json`; test parity w `translate.test.ts`.

## Lokalna baza SQLite
- Biblioteka: `react-native-sqlite-storage` (promise API).
- Warstwa: `src/services/database/` — manager, migracje, repozytoria.
- Provider: `DatabaseProvider` → hook `useDatabase()`.
- Tabela `settings` (key/value) — ustawienia aplikacji: `theme_mode`, `app_locale`.
- Tabela `voice_presets` — zapisane przez użytkownika presety efektów (nazwa + pitch/tempo/echo/reverb/bass).
- Tabela `processed_history` — ostatnio przetworzone pliki (nazwa WAV, URI, źródło, etykieta presetu, `created_at`); limit 20 wpisów.
- Tabela `schema_version` — wersjonowanie schematu (`SCHEMA_VERSION`).
- Docelowo: kolejne tabele (pliki audio, historia przetwarzania, cache API).
- Dostęp z UI wyłącznie przez serwisy/repozytoria, nie bezpośrednio z ekranów.

## Aktualizacje aplikacji (stub)
- `src/services/updates/updateStatus.ts` — `fetchAppUpdateStatus()`, `getUpdateStatusMessage()`.
- Stany: `checking`, `current`, `available` (z `version`), `unknown`.
- Obecnie stub zwraca `{ state: 'current' }`; przyszła integracja ze sklepem bez zmiany kontraktu UI.

## Kredyty i bootstrap instalacji (stub → API)
- Stałe puli: `src/config/credits.ts` (`FREE_INSTALLS_WITH_TEST_CREDITS` = **30**, zgodne z `voiceapp_setup.free_credits_install_cap`).
- API: `src/services/credits/creditsBootstrap.ts` — `fetchCreditsBootstrap()` → `POST /v1/devices/register`; bez `BACKEND_API_BASE_URL` → `local_fallback`. Backend: monorepo `server/` (patrz `credits-backend.md`).
- Sync: `creditsApi.ts` — start: register + `POST /v1/credits/sync`; zmiana planu → `POST /v1/credits/plan`; zużycie AI → `POST /v1/credits/spend` **przed** startem przetwarzania AI (`chargeAiCreditsBeforeProcessing` w `convertAudio`; WaveSpeed rozlicza przy submit joba).
- **URL API na urządzeniu:** fizyczny telefon = IP LAN Maca (nie `localhost`); emulator Android = `10.0.2.2`. Logi syncu: `credits_register` / `credits_sync` / `credits_plan` / `credits_spend` w `server/logs/`.
- Device: `src/services/device/` — `ensureDeviceId()`; UI w `AppVersionInfo`.
- Docelowo: `CreditsProvider` przy pierwszym starcie woła API; status w SQLite (`credits_bootstrap_status`, `installation_id`).
- Kontrakt REST i zachowanie przy `pool_exhausted`: `.aiassistant/rules/credits-backend.md`.
- v0: `creditsRepository.ensureInitialCreditsBalance()` seeduje lokalnie do czasu API.

## Nawigacja
- Native Stack (`AppNavigator`).
- Typy tras: `src/navigation/types.ts`.
- Nowe ekrany rejestruj w navigatorze + typach.

## Testowanie
- Jest + `@react-native/jest-preset`.
- **Każda nowa funkcja wymaga testów** — zasady w `testing.md`.
- Testy colocated: `*.test.ts` / `*.test.tsx` obok kodu w `src/`.
- Integracja audio — dodatkowo testy manualne na urządzeniach.

## Native (przyszłość)
- Moduły audio (FFmpeg, DSP, Core Audio / AAudio) — osobne natywne moduły lub istniejące biblioteki RN.
- Uprawnienia: iOS `Info.plist`, Android `AndroidManifest.xml`.
