# Voice App

Aplikacja mobilna **React Native** (iOS + Android) do **lokalnego przetwarzania głosu** w plikach dźwiękowych.

Użytkownik wrzuca plik audio (np. MP3) — przetwarzanie odbywa się na urządzeniu, bez wysyłania do chmury.

> **Status:** faza boilerplate. UI i dokumentacja są gotowe; pipeline audio będzie dodany w kolejnych iteracjach. Zobacz [PROGRESS.md](./PROGRESS.md).

## Wymagania

| Narzędzie | Wersja / uwagi |
|-----------|----------------|
| Node.js | >= 22.11 |
| npm | 10+ |
| Xcode | macOS, do budowania iOS |
| CocoaPods | `gem install cocoapods` |
| Android Studio | SDK, emulator lub urządzenie |
| JDK | 17 (zalecane dla RN 0.86) |

## Szybki start

### 1. Klonowanie i zależności

```sh
git clone <repo-url> voice-app
cd voice-app
npm install
```

### 2. Konfiguracja środowiska

```sh
cp .env.example .env
```

Edytuj `.env` według potrzeb. Zmienne opisane w [`.env.example`](./.env.example). W kodzie używaj wyłącznie `src/config/env.ts`.

### 3. iOS (macOS)

Pierwsze uruchomienie — instalacja gemów i podów:

```sh
cd ios
bundle install
export LANG=en_US.UTF-8
bundle exec pod install
cd ..
```

Uruchomienie na symulatorze:

```sh
npm run ios
```

Konkretny symulator:

```sh
npx react-native run-ios --simulator="iPhone 17" --port 8088
# lub: npm run ios
```

Otwórz projekt w Xcode (jeśli potrzebujesz debugowania natywnego):

```sh
open ios/VoiceApp.xcworkspace
```

### 4. Android

1. Uruchom emulator w Android Studio **lub** podłącz urządzenie z włączonym USB debugging.
2. Ustaw `JAVA_HOME` / `ANDROID_HOME` (patrz niżej), jeśli `java` / `adb` nie są w PATH.
3. Sprawdź połączenie: `adb devices`
4. Uruchom aplikację z **katalogu głównego** projektu (nie z `android/`):

```sh
npm run android
```

**Release na telefonie (bez Metro)** — JS bundle jest wbudowany w APK; aplikacja działa po wyłączeniu bundlera:

```sh
npm run android -- --mode=release
```

#### Windows (Git Bash) — sesja terminala

React Native wymaga **JDK 17–20** (`npx react-native doctor`). **Nie używaj** JBR z Android Studio, jeśli to Java 21+/25 — build pada na CMake (`:react-native-nitro-modules:configureCMakeDebug`) z komunikatem `restricted method in java.lang.System`.

1. Zainstaluj JDK 17 (PowerShell / CMD):

```bat
winget install --id Microsoft.OpenJDK.17 -e --accept-source-agreements --accept-package-agreements
```

2. W Git Bash ustaw zmienne (dostosuj ścieżkę, jeśli wersja patch różni się):

```sh
# dokładna nazwa folderu zależy od wersji patch — sprawdź:
#   ls "/c/Program Files/Microsoft/"
export JAVA_HOME="/c/Program Files/Microsoft/jdk-17.0.20.101-hotspot"
export ANDROID_HOME="$LOCALAPPDATA/Android/Sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

java -version   # powinno pokazać 17.x
adb devices
npm run android
```

Dla trwałych ustawień dodaj `JAVA_HOME` (JDK 17), `ANDROID_HOME` oraz wpisy PATH w **Zmiennych środowiskowych** użytkownika Windows, potem otwórz nowy terminal.

#### macOS / Linux

```sh
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
```

### 5. Metro bundler

W osobnym terminalu (opcjonalnie — `run-ios` / `run-android` uruchamia Metro automatycznie):

```sh
npm start
```

Reset cache po zmianach w `.env`, **Tailwind/NativeWind** lub natywnych modułach:

```sh
npm start -- --reset-cache
```

Skrót:

```sh
npm run start:reset
```

## Stylowanie (NativeWind)

Projekt używa **[NativeWind v4](https://www.nativewind.dev/)** — Tailwind CSS dla React Native.

### Zasady
- Stylowanie przez prop **`className`**, nie `StyleSheet.create`.
- Klasy Tailwind: `flex-1`, `p-6`, `text-lg`, `dark:bg-background-dark` itd.
- Kolory semantyczne w `tailwind.config.js`: `background`, `surface`, `foreground`, `brand`, `border`.
- Warunkowe klasy: helper **`cn()`** z `src/lib/cn.ts`.

### Przykład

```tsx
import { Text, View } from 'react-native';
import { cn } from '@/lib/cn';

<View className="rounded-2xl border border-border bg-surface p-6 dark:border-border-dark dark:bg-surface-dark">
  <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
    Tytuł
  </Text>
</View>
```

### Pliki konfiguracyjne
- `tailwind.config.js` — preset NativeWind, kolory, ścieżki `content`
- `global.css` — dyrektywy Tailwind (import w `App.tsx`)
- `nativewind-env.d.ts` — typy `className` dla TypeScript

Po zmianie klas uruchom Metro z resetem cache: `npm start -- --reset-cache`.

### Tryb jasny / ciemny
- `tailwind.config.js` → `darkMode: 'class'`
- Hook `useTheme()` — `toggleColorScheme()`, `setThemeMode('light' | 'dark' | 'system')`
- Przełącznik w nagłówku: `ThemeToggle` (kompaktowy switch, ikona Sun/Moon w suwaku)

### Ikony (Lucide)
```tsx
import { Mic } from 'lucide-react-native';

<Mic size={24} color="#4F46E5" />
```

## Lokalna baza SQLite

Aplikacja używa **`react-native-sqlite-storage`** do przechowywania danych lokalnie (offline-first, bez zależności od API na start).

### Struktura
```
src/services/database/
├── sqliteManager.ts      # Połączenie, executeQuery
├── schema.ts             # Migracje, schema_version
├── settingsRepository.ts # get/set ustawień (key/value)
└── constants.ts          # DATABASE_NAME, SETTING_KEYS
```

### Co jest zapisywane
| Klucz | Opis |
|-------|------|
| `theme_mode` | `light` / `dark` / `system` |

Motyw jest wczytywany przy starcie aplikacji i zapisywany przy każdej zmianie przełącznika.

### Rozszerzanie
- Nowe ustawienia → `SETTING_KEYS` + funkcje w repozytorium lub nowe tabele w `schema.ts`.
- Nowa wersja schematu → podnieś `SCHEMA_VERSION` i dodaj migrację w `runMigrations()`.
- Logika biznesowa (audio, pliki) → osobne repozytoria w `src/services/database/`.

### iOS
Po `npm install` uruchom ponownie `pod install` w katalogu `ios/`.

## Skrypty

| Skrypt | Opis |
|--------|------|
| `npm start` | Metro bundler |
| `npm run start:reset` | Metro bundler z wyczyszczonym cache |
| `npm run ios` | Build i uruchomienie na iOS |
| `npm run android` | Build i uruchomienie na Android |
| `npm run android -- --mode=release` | Android release (działa bez Metro) |
| `npm test` | Wszystkie testy Jest |
| `npm run test:watch` | Testy w trybie watch |
| `npm run test:coverage` | Testy z raportem pokrycia |
| `npm run lint` | ESLint |
| `npm run generate:icons` | Ikony iOS + Android z `assets/logo.svg` |
| `npm run i18n:schema` | Regeneruje `schema.json` z `en.json` (ścieżki kluczy) |

## Logo i ikony aplikacji

Źródło: `assets/logo.svg` (fala dźwiękowa w zaokrąglonym kwadracie).

Po zmianie logo uruchom:

```sh
npm run generate:icons
```

Skrypt generuje:
- **iOS** — `ios/VoiceApp/Images.xcassets/AppIcon.appiconset/` (9 rozmiarów + `Contents.json`)
- **Android** — `android/app/src/main/res/mipmap-*/ic_launcher.png` i `ic_launcher_round.png`

Komponent UI: `Logo` w `src/components/atoms/Logo/`.

## Tłumaczenia (i18n)

Języki: **angielski** i **polski**. Pliki w `src/i18n/locales/`.

- **Start:** język z ustawień urządzenia (jeśli PL lub EN), inaczej angielski.
- **Fallback tłumaczeń** i źródło struktury typów: `en.json` (`DEFAULT_LOCALE`).

- `en.json` — teksty EN + **źródło typów** (`TranslationKey` dla autouzupełniania `t('...')`)
- `pl.json` — teksty PL (ta sama struktura co `en.json`)
- `schema.json` — mapa ścieżek kluczy dla tłumaczy (jak w kupbilecikpl-app); regeneracja: `npm run i18n:schema`

**Nowy klucz:** dopisz do `en.json` i `pl.json` → `npm run i18n:schema` → `npm test`.

```ts
import { useTranslation } from '@/hooks/useTranslation';

const { t, locale, setLocale } = useTranslation();
t('home.description'); // typowany klucz — IDE podpowiada ścieżki
t('home.statusMaxSize', { size: 50 });
```

Wybór języka: nagłówek → ikona ustawień → **Język aplikacji**. Wartość zapisywana w SQLite (`app_locale`) i ma pierwszeństwo nad językiem urządzenia.

## Struktura projektu

```
voice-app/
├── AGENTS.md              # Instrukcje dla agentów AI
├── CHANGELOG.md           # Historia zmian
├── PROGRESS.md            # Bieżący status prac
├── .aiassistant/rules/    # Zasady architektury, kodu, domeny
├── .cursor/rules/         # Reguły Cursor (always apply)
├── .env.example           # Szablon zmiennych środowiskowych
├── assets/logo.svg        # Źródło logo i ikon aplikacji
├── global.css             # Tailwind / NativeWind
├── tailwind.config.js     # Kolory i content paths
└── src/
    ├── components/          # UI — Atomic Design (patrz components.md)
    │   ├── atoms/           # Button…
    │   ├── molecules/       # ThemeToggle…
    │   └── organisms/       # Screen…
    ├── config/env.ts      # Odczyt zmiennych z .env
    ├── hooks/
    ├── navigation/
    ├── screens/             # ekrany routingu (nie components/)
    ├── providers/         # DatabaseProvider, ThemeProvider
    ├── services/
    │   └── database/      # SQLite, settings, migracje
    ├── theme/
    ├── types/
    └── utils/             # helpery + *.test.ts
```

### Komponenty UI (Atomic Design)

Każdy komponent ma własny folder w warstwie `atoms` / `molecules` / `organisms`:

```
src/components/
├── atoms/Button/
├── molecules/ThemeToggle/
├── organisms/Screen/
└── index.ts              # barrel: import { Button, Screen } from '@/components'
```

Szczegóły dla developerów i agentów AI: [`.aiassistant/rules/components.md`](./.aiassistant/rules/components.md).

Importy z aliasem `@/`:

```ts
import { Button } from '@/components';
import { env } from '@/config/env';
```

## Testy jednostkowe

Projekt używa **Jest**. **Każda nowa funkcjonalność wymaga testów** dodanych razem z kodem (szczegóły w [`.aiassistant/rules/testing.md`](./.aiassistant/rules/testing.md)).

### Uruchamianie

```sh
# Wszystkie testy (jednorazowo)
npm test

# Tryb watch — przy ciągłej pracy nad kodem
npm run test:watch

# Raport pokrycia kodu
npm run test:coverage

# Pojedynczy plik
npm test -- audioFile

# Pojedynczy test po fragmencie nazwy
npm test -- -t "returns false"
```

Przed commitem / zakończeniem zadania uruchom:

```sh
npm run lint && npm test
```

### Gdzie trzymać testy

Preferowany wzorzec: plik testowy **obok kodu** w `src/`:

```
src/utils/audioFile.ts
src/utils/audioFile.test.ts   ← colocated test
```

| Warstwa | Przykład | Co testować |
|---------|----------|-------------|
| `src/utils/` | `audioFile.test.ts` | Walidacja formatu, rozmiaru pliku |
| `src/services/` | `audioProcessor.test.ts` | Pipeline audio (mock native) |
| `src/hooks/` | `useAudioImport.test.ts` | Logika hooków |
| `src/components/` | `molecules/ThemeToggle/ThemeToggle.test.tsx` | Tylko przy nietrywialnej logice |
| root | `__tests__/App.test.tsx` | Smoke test całej aplikacji |

### Priorytety

1. **Logika czysta** (`utils`, parsowanie, walidacja) — zawsze testuj.
2. **Serwisy** (`services/`) — happy path + błędy; mockuj moduły natywne.
3. **UI** — render bez crash; unikaj kruchych snapshotów całych ekranów.

### Przykład — funkcja czysta

```ts
// src/utils/audioFile.test.ts
import { isWithinMaxUploadSize } from './audioFile';

describe('isWithinMaxUploadSize', () => {
  it('returns false when file exceeds limit', () => {
    expect(isWithinMaxUploadSize(51 * 1024 * 1024, 50)).toBe(false);
  });
});
```

### Mocki

- `@env` jest mockowany globalnie → `src/config/__mocks__/env.ts`
- Moduły natywne mockuj przez `jest.mock('nazwa-modulu')`

### Dla agentów AI

Przy każdej nowej funkcji agent **automatycznie** dodaje testy i uruchamia `npm test`. Przy bugfixie: najpierw test reprodukujący błąd, potem poprawka.

## Stack

- React Native 0.86, React 19, TypeScript
- **NativeWind v4** + Tailwind CSS 3 (`className`, `global.css`)
- **lucide-react-native** — ikony (wymaga `react-native-svg`)
- **react-native-sqlite-storage** — lokalna baza SQLite
- React Navigation (native stack)
- react-native-safe-area-context, react-native-screens
- react-native-dotenv — zmienne z `.env`
- Jest — testy jednostkowe
- Motyw jasny / ciemny (systemowy)

## Dokumentacja dla developerów i AI

- [AGENTS.md](./AGENTS.md) — jak pracować w repo (język, git, pliki do aktualizacji)
- [.aiassistant/rules/](./.aiassistant/rules/) — architektura, kontekst, reguły kodu, **komponenty** (`components.md`), domena audio
- [CHANGELOG.md](./CHANGELOG.md) — co się zmieniło
- [PROGRESS.md](./PROGRESS.md) — roadmapa i status

### Cursor — automatyczne reguły

W projekcie jest plik `.cursor/rules/voice-app.mdc` z `alwaysApply: true`. Cursor ładuje go w każdej sesji, więc agent wie o `AGENTS.md`, `.aiassistant/rules/` i obowiązku aktualizować `CHANGELOG.md` / `PROGRESS.md`.

Dodatkowo Cursor czyta **`AGENTS.md`** w katalogu głównym (standardowy plik instrukcji dla agentów).

## Rozwój funkcji audio (plan)

1. Import pliku — document picker
2. Walidacja formatu i rozmiaru (`env.maxUploadSizeMb`)
3. Lokalne przetwarzanie DSP w `src/services/audio/`
4. Podgląd (`env.enableAudioPreview`)
5. Eksport / udostępnienie pliku

Szczegóły domenowe: [.aiassistant/rules/domain-knowledge.md](./.aiassistant/rules/domain-knowledge.md).

## Rozwiązywanie problemów

**iOS — błąd CocoaPods / encoding**

```sh
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8
cd ios && bundle exec pod install
```

**Metro nie widzi zmian w `.env`**

```sh
npm start -- --reset-cache
```

**Android — „SDK location not found”**

Utwórz `android/local.properties`:

```properties
sdk.dir=/Users/<user>/Library/Android/sdk
```

## Licencja

Prywatny projekt — do ustalenia.
