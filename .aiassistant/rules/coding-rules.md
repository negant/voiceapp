---
apply: always
---

# Reguły kodowania (AI) — Voice App

## Zasady pracy
- Odpowiadaj i komentuj zmiany po polsku (komunikacja, dokumentacja).
- **Komentarze w kodzie źródłowym — po angielsku.**
- Nazwy API, typów, plików i komponentów — po angielsku.
- Preferuj małe, bezpieczne poprawki; unikaj szerokich refaktorów bez prośby.
- Zachowuj strukturę `src/`, alias `@/`, styl istniejących komponentów.
- Najpierw diagnozuj przyczynę, potem minimalny fix.
- Po zmianach uruchom `npm run lint` i `npm test`.
- **Aktualizuj dokumentację** przy istotnych zmianach: `CHANGELOG.md`, `PROGRESS.md`, pliki w `.aiassistant/rules/` (patrz `AGENTS.md`).

## Komentarze w kodzie
- Język: **angielski** (dotyczy `//`, `/* */`, JSDoc w `.ts` / `.tsx`).
- Cel: wyjaśniaj **dlaczego** coś jest zrobione w dany sposób, nie powtarzaj oczywistego „co robi” kod.
- Dobry komentarz: `// Optimistic UI: don't block the toggle when SQLite write fails.`
- Zły komentarz: `// Set theme mode` (to widać z kodu).
- Nie komentuj oczywistych operacji; komentuj decyzje, ograniczenia platformy, workaroundy.

## Testy jednostkowe
- **Nowa funkcjonalność = nowe testy** w tym samym zadaniu. Bez wyjątku, chyba że użytkownik wyraźnie odmówi.
- Szczegółowe zasady: `testing.md`.
- Pliki testowe: `*.test.ts` / `*.test.tsx` **obok** kodu źródłowego w `src/` (colocated).
- Testuj logikę czystą i serwisy w pierwszej kolejności; mockuj moduły natywne.
- Przy zmianie zachowania — aktualizuj istniejące testy, nie usuwaj bez uzasadnienia.
- Bugfix: red → green (test najpierw, potem fix).

## Komponenty UI (Atomic Design)
- Szczegóły: **`components.md`** (obowiązkowe przy nowych komponentach).
- Struktura: `src/components/{atoms|molecules|organisms}/NazwaKomponentu/`.
- Jeden komponent = jeden folder z `ComponentName.tsx` + `ComponentName.types.ts` + `index.ts`.
- **Typy propsów** w osobnym pliku `ComponentName.types.ts`; import w komponencie; re-eksport w `index.ts`.
- **Nie** dodawaj plików bezpośrednio do `src/components/` (bez podfolderu warstwy).
- Ekrany tylko w `src/screens/`; komponenty wielokrotnego użytku w `src/components/`.

## Internacjonalizacja (i18n)
- Tłumaczenia UI w `src/i18n/locales/{locale}.json` — **nie** hardcoduj tekstów w komponentach.
- **Źródło prawdy struktury:** `en.json` → typ `TranslationKey` (autouzupełnianie w `t('...')`).
- **Schema dla tłumaczy:** `schema.json` (ścieżki kluczy, jak w kupbilecikpl-app) — regeneruj: `npm run i18n:schema`.
- Domyślny język aplikacji: **`en`** (`DEFAULT_LOCALE`) — fallback gdy język urządzenia nie jest obsługiwany.
- Przy **pierwszym uruchomieniu** (brak `app_locale` w SQLite): język z ustawień urządzenia (`Intl`), jeśli obsługiwany (`pl` / `en`).
- Po wyborze w ustawieniach języka: zapis w SQLite ma pierwszeństwo nad urządzeniem.
- Hook: `useTranslation()` → `t('key.path', { param })` — `key` jest typowany (`TranslationKey`).
- **Nowy klucz:** (1) dopisz do `en.json`, (2) do `pl.json` (+ inne locale), (3) `npm run i18n:schema`, (4) `npm test`.
- Persystencja wyboru języka: SQLite (`settings.app_locale`).

## TypeScript / React Native
- Komponenty funkcyjne; hooki w `src/hooks/`.
- **Stylowanie: NativeWind** — używaj `className` z klasami Tailwind; unikaj `StyleSheet.create` w nowym kodzie.
- Kolory semantyczne z `tailwind.config.js` (`bg-background`, `dark:bg-background-dark`, `text-brand` itd.).
- Helper `cn()` z `src/lib/cn.ts` do łączenia klas warunkowych.
- Ekrany owijaj w `Screen` z `@/components` (organism).
- Logikę biznesową (audio, pliki, baza) trzymaj w `src/services/`, nie w ekranach ani komponentach UI.
- Typy domenowe współdzielone w `src/types/`; typy propsów komponentów w `ComponentName.types.ts`.

## Importy
```ts
import { Button, Screen, ThemeToggle } from '@/components';
import type { ButtonProps } from '@/components/atoms/Button';
import { env } from '@/config/env';
import { useTranslation } from '@/hooks/useTranslation';
```

## Env i sekrety
- Nie hardcoduj wartości z `.env` w kodzie.
- Odczyt wyłącznie przez `src/config/env.ts`.
- Nie commituj `.env`.

## Git
- Nie commituj bez wyraźnej prośby użytkownika.
- Nie pushuj bez prośby.

## Bezpieczeństwo i prywatność
- Przetwarzanie audio domyślnie **lokalne** — nie wysyłaj plików użytkownika na serwer bez zgody i jawnej funkcji.
- Przy uprawnieniach (pliki, mikrofon) dodawaj opisy w UI i natywnych manifestach.

## Code review — priorytety
Skupiaj się na:
- regresjach na iOS i Android,
- wyciekach pamięci przy dużych plikach,
- poprawności typów nawigacji,
- zgodności z `domain-knowledge.md`,
- poprawnej warstwie komponentu (atom vs molecule vs organism),
- parze kluczy i18n we wszystkich locale.

## Dokumentacja po zmianie
- Nowa funkcja → wpis w `CHANGELOG.md` (Added).
- Zmiana zachowania → Changed.
- Naprawa → Fixed.
- Wiedza o audio/formacie → `domain-knowledge.md`.
- Nowa funkcja → testy jednostkowe w `*.test.ts(x)` obok kodu.
- Nowy wzorzec UI / komponent → ewentualna aktualizacja `components.md`.
