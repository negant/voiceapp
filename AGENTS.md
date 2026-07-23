# AGENTS.md

Instrukcje dla agentów AI pracujących w repozytorium **Voice App**.

## Język i styl pracy
- Odpowiadaj po polsku (komunikacja z użytkownikiem, dokumentacja projektu).
- **Komentarze w kodzie po angielsku** — opisuj *dlaczego*, nie tylko *co* (szczegóły: `coding-rules.md`).
- Nazwy API, zmiennych, plików i komponentów po angielsku.
- Preferuj małe, bezpieczne zmiany zamiast dużych refaktorów.
- Zachowuj istniejące wzorce projektu, nazewnictwo, strukturę katalogów i styl kodu.
- Najpierw diagnozuj przyczynę problemu, potem proponuj i wdrażaj minimalną poprawkę.

## Źródła zasad (nadrzędne i obowiązujące)
Wszystkie działania muszą być zgodne z zasadami w katalogu `.aiassistant/rules/`:
- `.aiassistant/rules/architecture.md` — architektura i przepływ danych.
- `.aiassistant/rules/coding-rules.md` — standardy kodu i implementacji.
- `.aiassistant/rules/components.md` — **Atomic Design** (atoms / molecules / organisms).
- `.aiassistant/rules/testing.md` — testy jednostkowe (obowiązkowe przy nowych funkcjach).
- `.aiassistant/rules/project-context.md` — kontekst projektu, cele i ryzyka.
- `.aiassistant/rules/domain-knowledge.md` — wiedza domenowa (przetwarzanie audio).
- `.aiassistant/rules/Rules.md` — mapa dokumentacji.

Zasady są wiążące dla każdego agenta AI w tym projekcie.

## Dokumentacja utrzymywana na bieżąco
Podczas pracy **aktualizuj** te pliki, gdy zmienia się stan projektu:
- `CHANGELOG.md` — każda istotna zmiana (funkcja, fix, konfiguracja, breaking change).
- `.aiassistant/rules/domain-knowledge.md` — nowa wiedza o audio, formatach, pipeline przetwarzania **oraz statusie usługi AI** (kiedy odpytywać, semafor, env).
- `.aiassistant/rules/project-context.md` — zmiany w stacku, modułach, ograniczeniach platformy.
- `.aiassistant/rules/components.md` — nowe konwencje komponentów UI (jeśli dotyczy).
- `PROGRESS.md` — bieżący status, co zrobione, co następne (krótko).

Format wpisu w `CHANGELOG.md`: sekcja `[Unreleased]` na górze, potem wersje z datą. Używaj kategorii: Added, Changed, Fixed, Removed.

## Komponenty UI
- **Atomic Design** — każdy komponent w `src/components/{atoms|molecules|organisms}/Nazwa/`.
- Nie twórz płaskiej listy plików w `src/components/`.
- Szczegóły: `.aiassistant/rules/components.md`.

## Wiedza domenowa
- Jeśli napotkasz wiedzę domenową (formaty audio, DSP, uprawnienia, limity urządzenia), której nie ma w `domain-knowledge.md`, **dopisz ją** do tego pliku.

## Kontekst produktu
- **Voice App** — aplikacja mobilna (iOS + Android) do **lokalnego** przetwarzania głosu w plikach dźwiękowych.
- Użytkownik wrzuca plik (np. MP3); przetwarzanie odbywa się **na urządzeniu**, bez wysyłania audio do chmury (domyślny model produktu).
- Stack: React Native 0.86, TypeScript, React Navigation, **NativeWind**, **SQLite**.

## Testy jednostkowe (obowiązkowe)
- **Każda nowa funkcjonalność** wymaga testów jednostkowych dodanych razem z kodem.
- Szczegóły: `.aiassistant/rules/testing.md`.
- Po każdej zmianie uruchom `npm test` (oraz `npm run lint`).
- Przy bugfixie: najpierw test reprodukujący błąd, potem poprawka.
- Priorytet testów: `src/services/`, `src/utils/`, logika w hookach; UI tylko przy nietrywialnej logice.

## Git
- Nie commituj bez wyraźnej prośby użytkownika.
- Nie commituj pliku `.env` (tylko `.env.example`).
- Nie ujawniaj sekretów ani kluczy API w kodzie i dokumentacji.

## Obszary wysokiego ryzyka
- Dostęp do plików użytkownika i mikrofonu — wymagają uprawnień i jasnej komunikacji w UI.
- Przetwarzanie audio — pamięć, czas CPU, rozmiar plików; testuj na urządzeniach fizycznych.
- Eksport / nadpisywanie plików — unikaj utraty oryginału bez potwierdzenia użytkownika.
