# Polityka prywatności — Voice App

**Ostatnia aktualizacja:** 2026-07-22  
**Operator:** Voice App / ukrywane.pl  
**Kontakt:** support@ukrywane.pl  
**Publiczny URL (hostuj ten dokument):** https://ukrywane.pl/privacy

## Skrót

Voice App przetwarza audio lokalnie (efekty Basic i Advanced). Opcjonalne efekty AI wysyłają audio do dostawcy w chmurze. Nie wymagamy konta użytkownika. Używamy losowego identyfikatora urządzenia do kredytów i ochrony przed nadużyciami.

## Jakie dane przetwarzamy

| Dane | Cel | Gdzie |
|------|-----|-------|
| Audio (import, nagranie, eksport) | Lokalne efekty głosu; zapis na urządzeniu | Urządzenie (SQLite / pamięć aplikacji) |
| Audio przy efektach AI | Konwersja głosu w chmurze (WaveSpeed / skonfigurowany STS) | Przejściowo u dostawcy AI |
| Device ID (losowy UUID) | Saldo kredytów, jednorazowy grant free, support | Urządzenie (bezpieczne przechowywanie) i nasze API (`api.ukrywane.pl`) |
| Plan / ledger kredytów | Free vs Premium, zużycie minut AI | Postgres API |
| Wersja aplikacji / platforma | Setup, force update, diagnostyka | API (bez PII) |
| Tokeny zakupów Google Play | Weryfikacja subskrypcji Premium | API |

**Nie zbieramy** imienia, e-maila, telefonu ani precyzyjnej lokalizacji w ramach podstawowego produktu.

## Uprawnienia (Android)

- **Mikrofon** — tylko przy nagrywaniu, gdy wybierzesz „Nagraj”.
- **Odczyt audio / mediów** — tylko przy imporcie wybranego pliku.
- **Internet** — API kredytów, opcjonalne AI, sprawdzanie aktualizacji.

## Podstawy prawne (EOG/UK)

- **Umowa / świadczenie usługi** — przetwarzanie audio i kredytów na Twoje żądanie.
- **Uzasadniony interes** — Device ID przeciw nadużyciom puli free; bezpieczeństwo API.

## Podmioty trzecie

- **Nasze API** (`api.ukrywane.pl`) — urządzenia, kredyty, setup.
- **Dostawca AI** (konfiguracja `AI_EFFECTS_*`, obecnie WaveSpeed) — audio tylko przy efekcie AI.
- **Google Play** — płatności Premium; dane płatności według zasad Google.

## Retencja

- Lokalne audio i presety: do usunięcia przez Ciebie lub wyczyszczenia danych aplikacji.
- Rekordy kredytów urządzenia: tak długo, jak potrzebne do usługi i anti-abuse.
- Weryfikacja zakupów: zgodnie z wymogami rozliczeń i odnowień.

## Twoje wybory

- Korzystaj z Basic/Advanced bez AI — audio zostaje na urządzeniu.
- Odmów uprawnień mikrofonu / mediów — powiązane funkcje będą niedostępne.
- Zarządzaj lub anuluj Premium w subskrypcjach Google Play.
- W supportcie podaj Device ID (Ustawienia → O aplikacji).

## Dzieci

Aplikacja nie jest skierowana do dzieci poniżej 13. roku życia (lub wieku minimalnego w Twoim kraju).

## Zmiany

Polityka może się zmieniać. Data aktualizacji i URL hostingu wskazują aktualną wersję.

## Kontakt

support@ukrywane.pl
