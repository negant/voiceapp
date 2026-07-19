---
apply: always
---

# Testy jednostkowe — Voice App

## Zasada ogólna
**Każda nowa funkcjonalność musi mieć testy jednostkowe** — dodawane w tym samym PR / commicie co kod produkcyjny.

Dotyczy to w szczególności:
- `src/services/` — logika audio, pliki, pipeline przetwarzania
- `src/utils/` — walidacja, parsowanie, helpery
- `src/hooks/` — hooki z logiką (nie tylko UI)
- `src/config/` — parsowanie konfiguracji
- `src/components/` — tylko gdy komponent ma nietrywialną logikę (warunki, stany, callbacki)

Nie wymagaj testów dla:
- czystego stylowania / layoutu bez logiki,
- prostych re-eksportów,
- plików konfiguracyjnych bez logiki.

## Obowiązek agenta AI
Przy dodawaniu lub zmianie funkcjonalności agent **automatycznie**:
1. Pisze lub aktualizuje testy pokrywające nowe zachowanie.
2. Uruchamia `npm test` przed zakończeniem zadania.
3. Przy bugfixie najpierw dodaje test reprodukujący błąd, potem poprawkę.

## Konwencje plików

| Warstwa | Lokalizacja testu | Przykład |
|---------|-------------------|----------|
| Util / serwis | obok pliku źródłowego | `audioFile.ts` → `audioFile.test.ts` |
| Hook | obok hooka | `useAudioImport.ts` → `useAudioImport.test.ts` |
| Komponent | obok komponentu w folderze warstwy | `molecules/ThemeToggle/ThemeToggle.test.tsx` |
| Integracja app | `__tests__/` w root | `__tests__/App.test.tsx` |

Preferuj **colocated tests** (`*.test.ts` / `*.test.tsx` obok kodu) w `src/`.

## Stack testowy
- **Jest** 29 + preset `@react-native/jest-preset`
- **react-test-renderer** — render komponentów RN
- Mock `@env` → `src/config/__mocks__/env.ts` (skonfigurowany w `jest.config.js`)
- Mock `react-native-reanimated` → `__mocks__/react-native-reanimated.js` (w `jest.setup.js`); wymagany przy komponentach z Reanimated v4

## Co testować (priorytety)

### 1. Logika czysta (najwyższy priorytet)
Funkcje bez zależności od RN / native:
- walidacja formatu pliku, rozmiaru,
- parsowanie metadanych,
- transformacje ścieżek / nazw plików.

### 2. Serwisy i i18n
- mockuj moduły natywne (`jest.mock('react-native-fs')` itd.),
- testuj happy path + edge cases (pusty plik, za duży plik, nieobsługiwany format),
- testuj obsługę błędów.
- **i18n:** przy nowym kluczu `t('...')` dopisz go we **wszystkich** `src/i18n/locales/*.json`; test `locale parity` w `translate.test.ts` musi przechodzić.

### 3. Hooki
- `@testing-library/react-native` — rozważ dodanie w przyszłości; na razie `renderHook` z test-utils lub test przez komponent opakowujący.

### 4. Komponenty UI
- render bez crash,
- interakcje kluczowe (np. przycisk wywołuje callback),
- unikaj testów snapshot całych ekranów — kruche i mało wartościowe.

## Wzorce

### Test funkcji czystej
```ts
import { isWithinMaxUploadSize } from './audioFile';

describe('isWithinMaxUploadSize', () => {
  it('returns true when file is within limit', () => {
    expect(isWithinMaxUploadSize(1024 * 1024, 50)).toBe(true);
  });

  it('returns false when file exceeds limit', () => {
    expect(isWithinMaxUploadSize(51 * 1024 * 1024, 50)).toBe(false);
  });
});
```

### Mock modułu natywnego
```ts
jest.mock('react-native-document-picker', () => ({
  pick: jest.fn(),
}));
```

### Mock react-native-reanimated
W projekcie używany jest własny mock w `__mocks__/react-native-reanimated.js` (rejestracja w `jest.setup.js`). Nie używaj `require('react-native-reanimated/mock')` — z Reanimated v4 powoduje błąd ESM w Jest.

### Test komponentu
```tsx
import ReactTestRenderer from 'react-test-renderer';
import { Button } from './Button';

test('renders title', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<Button title="Import" onPress={jest.fn()} />);
  });
  expect(tree!.toJSON()).toBeTruthy();
});
```

## Komendy
```sh
npm test              # jednorazowe uruchomienie
npm run test:watch    # tryb watch
npm run test:coverage # raport pokrycia
npm test -- audioFile # pojedynczy plik
npm test -- -t "returns false"  # pojedynczy test po nazwie
```

## Pokrycie (cele orientacyjne)
- `src/services/`, `src/utils/` — dążyć do **≥ 80%** lines przy nowym kodzie.
- Ekrany — testy integracyjne opcjonalne; priorytet na logikę biznesową.

## Czego unikać
- Testów, które tylko sprawdzają, że mock został wywołany bez asercji biznesowej.
- Testów zależnych od kolejności wykonania.
- Hardcodowania wartości z `.env` — używaj mocka `@env` lub przekazuj parametry do funkcji czystych.

## Po zmianie testów
- Uruchom `npm test` i `npm run lint`.
- Wpis w `CHANGELOG.md` (Added: testy dla X) — gdy dodano istotny zestaw testów do nowej funkcji.
