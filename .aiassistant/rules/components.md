---
apply: always
---

# Komponenty UI — Atomic Design

## Zasada
**Nie wrzucaj wszystkich komponentów do jednego płaskiego katalogu.** Każdy komponent ma własny folder w odpowiedniej warstwie atomic design.

Struktura: `src/components/{atoms|molecules|organisms|templates}/ComponentName/`

## Warstwy

| Warstwa | Opis | Przykłady w projekcie |
|---------|------|------------------------|
| **atoms** | Najmniejsze, pojedyncze elementy UI bez logiki biznesowej | `Button`, `Logo`, `Slider` |
| **molecules** | Kilka atomów + prosta interakcja lub stan lokalny | `ThemeToggle`, `SettingsRow`, `EffectSlider`, `VoicePresetCard`, `VoiceEffectGrid`, `StudioSection`, `PresetEditorModal`, `ProcessedHistoryList`, `AppAlert`, `SuccessDialog`, `ConfirmDialog`, `CollapsibleSection`, `AppVersionInfo`, `HeaderActions`, `HeaderBackButton`, `ScreenHeaderTitle` |
| **organisms** | Większe sekcje UI, wiele molekuł/atomów | `Screen`, `LaunchScreen`, `VoiceStudioPanel` |
| **templates** | Układ strony bez treści domenowej (opcjonalnie) | `MainLayout` |

Ekrany (`src/screens/`) **nie są** komponentami — to warstwa routingu; składają się z organisms/molecules/atoms.

## Struktura folderu komponentu

```
src/components/molecules/ThemeToggle/
├── ThemeToggle.tsx
├── ThemeToggle.types.ts   # typy propsów (import/export)
├── ThemeToggle.test.tsx   # jeśli jest logika do testowania
└── index.ts               # export komponentu + typów
```

Jeden komponent = jeden folder. Plik główny ma taką samą nazwę jak folder.

### Typy komponentów
- Props i typy pomocnicze komponentu → **`ComponentName.types.ts`** w tym samym folderze.
- W `ComponentName.tsx` tylko `import type { ... } from './ComponentName.types'`.
- W `index.ts` re-eksportuj typy: `export type { ThemeToggleProps } from './ThemeToggle.types'`.
- Komentarze w kodzie komponentów — **po angielsku**, opisują *dlaczego* (patrz `coding-rules.md`).

## Importy

Preferowany import z barrel file:

```ts
import { Button, Screen, ThemeToggle } from '@/components';
```

Bezpośredni import z warstwy (gdy potrzebny):

```ts
import { Button } from '@/components/atoms/Button';
```

## Gdzie co umieszczać — decyzja

1. **Atom** — nie składa się z innych komponentów projektu (może używać RN primitives).
2. **Molecule** — łączy atomy; ma prostą logikę (toggle, input + label).
3. **Organism** — sekcja ekranu, layout, formularz z wieloma polami.
4. Gdy niepewny — zacznij od molecule; wydziel atom gdy komponent jest reużywany w 2+ miejscach.

## Animacje (react-native-reanimated)
- Biblioteka: **react-native-reanimated** v4; plugin **musi** być ostatni w `babel.config.js`.
- Logo: statyczne `Logo` (atom) — Home intro, nagłówek; **`AnimatedLogo` tylko na launcherze** (lekka animacja pasków fali, jeden `sharedValue` fazowy).
- Home intro: `AppIntroSection` (logo + nagłówek + tagline u góry), `AppIntroFooter` (długi `home.introBody` na dole scrolla).
- **AppIntroSection:** karta hero z tagline i podtytułem (bez badge'ów platform).
- **EffectAccessBadge** (atom) — Free / Premium na kartach efektów; mapy w `src/constants/effectAccessTiers.ts`.
- Pełnoekranowy launcher: `LaunchScreen` (organism) — `AnimatedLogo` + jednorazowy fade-out całego ekranu; logika czasu w `src/config/launch.ts`.
- **Launcher tło komiksowe:** `ComicLauncherBackground` (molecule) — 5 paneli pod skosem z awatarami presetów (`female`, `male`, `robot`, `kratos`, `demon`); układ w `launchComicPanels.ts`; logo i nazwa aplikacji na wierzchu z miękką plamą czytelności.
- **AppAlert** (molecule) + **AppAlertProvider** — stylowane alerty (info/success/warning/error); `useAppAlert().showAlert` / `showOfflineAlert` / `showOnlineAlert`; kolejka; auto „Back online” po powrocie sieci.
- W testach Jest: mock `__mocks__/react-native-reanimated.js` (rejestrowany w `jest.setup.js`).

## Logo — współdzielona geometria
- `src/components/atoms/Logo/logoWaveform.ts` — `buildWaveform()`, `LOGO_BAR_HEIGHT_RATIOS`, `getLogoMetrics()`.
- Używane przez `Logo`; nie duplikuj proporcji fali w innych plikach.

## VoicePresetCard (presety wbudowane)
- Molecule: miniatura (`assets/presets/{id}.png` przez `PRESET_AVATAR_IMAGES`), nazwa; opis i18n tylko w `accessibilityLabel` (`voiceStudio.presets.*Description`).
- Miniatura awatara presetu: **96×96** (`h-24 w-24`), okrągła; wbudowane presety używają `assets/presets/{id}.png`.
- **Stała wysokość tekstu:** slot nazwy `h-8` (max 2 linie). Opisy presetów nie są renderowane na karcie (tylko w `accessibilityLabel`).
- **VoicePresetCard** — okrągły awatar (80px) + etykieta; bez widocznego opisu pod nazwą.
- Ponowne kliknięcie wybranego efektu **odznacza** go (`toggleBuiltinPresetSelection` / `toggleCustomPresetSelection`).
- Własne presety użytkownika: tylko awatar z inicjałem i nazwa.

### Grafiki presetów (`assets/presets/`)
- **Format:** kwadrat (1:1) lub prostokąt (np. 4:3); min. ~512 px; PNG.
- **Kompozycja:** twarz/postać wycentrowana, **bez napisów i logo** — nadaje się do okrągłego awatara (`resizeMode="cover"`).
- **Styl:** spójny z resztą presetów (anime / manga, np. Huntrix-inspired dla postaci ludzkich).
- **Nazwa pliku:** `{VoicePresetId}.png` (np. `demon.png`); po dodaniu pliku zaktualizuj `VoicePresetId`, `PRESET_AVATAR_IMAGES`, `VOICE_PRESETS`, i18n i testy.
- **AI Effects:** awatary w `assets/presets/` (np. `narratorFemale.png`), mapowanie w `AI_EFFECT_AVATAR_IMAGES`; karta `AiEffectCard` jak `AdvancedEffectCard` (okrągły PNG 96×96, fallback SVG `AiEffectIcon`).

## Czego unikać

- Płaskiego `src/components/Button.tsx` obok dziesiątek innych plików.
- Logiki audio / SQLite / API w komponentach — przenieś do `src/services/`.
- Ekranów w `src/components/` — trzymaj w `src/screens/`.

## Nowy komponent — checklist

1. Określ warstwę (atom / molecule / organism).
2. Utwórz folder `src/components/{warstwa}/{Nazwa}/`.
3. Dodaj `index.ts` i eksport w `src/components/{warstwa}/index.ts`.
4. Dodaj eksport w `src/components/index.ts` (przez `export *`).
5. Test colocated, jeśli jest nietrywialna logika.
6. Zaktualizuj `CHANGELOG.md` przy istotnej zmianie.
