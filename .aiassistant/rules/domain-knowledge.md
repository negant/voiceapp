---
apply: always
---

# Domain Knowledge — Voice App

## Zasada aktualizacji
Jeśli w trakcie pracy napotkasz wiedzę domenową, której tu nie ma, **dopisz ją** do tego pliku.

## Produkt
- Aplikacja służy do **przerabiania / transformacji głosu** w nagraniach audio.
- Użytkownik dostarcza plik (np. MP3); wynik powstaje **lokalnie** na telefonie.
- Prywatność: brak domyślnego uploadu do chmury.

## Formaty (planowane)
- Wejście (pierwsza iteracja): **MP3** — najczęstszy format od użytkowników.
- Rozszerzenia docelowe (konfiguracja `SUPPORTED_AUDIO_FORMATS` w `.env`): `mp3`, `wav`, `m4a`, `aac`.
- Konwersja między formatami — do ustalenia w module natywnym; **Advanced Effects** używają łańcuchów filtrów w stylu FFmpeg w JS (`src/services/audio/advancedEffects/`) z biblioteką **`@soundtouchjs/core`** (WSOLA pitch shift) — bez binarnego `react-native-ffmpeg` / FFmpegKit (wycofane).

## Ograniczenia plików
- Maks. rozmiar importu: `MAX_UPLOAD_SIZE_MB` (domyślnie 50 MB w `.env.example`).
- Duże pliki — ryzyko OOM; rozważ streaming / chunk processing w przyszłości.

## Przetwarzanie głosu
- **Tiery efektów (Voice Studio):** `Basic` → `Advanced` → **`AI`**. AI = **WaveSpeed Chatterbox** Speech-to-Speech (`narratorka`, `narrator`, `legionista`) gdy `AI_EFFECTS_API_KEY`; UI: „zaawansowane AI” + wymóg internetu (bez brandingu/API). Bez sieci karty AI wyłączone (NetInfo) + **AppAlert** (`showOfflineAlert`). Po powrocie sieci — `showOnlineAlert`. Wynik = **MP3** z API.
- **AppAlert:** globalny system stylowanych alertów (`AppAlertProvider` / `useAppAlert`) — `showAlert` / `showErrorAlert` / `showWarningAlert` / offline-online; kolejka; warianty; jawne kolory tekstu (NativeWind w Modal bywa niewidoczny).
- **WaveSpeed Chatterbox STS:** upload źródła (`POST /media/upload/binary`) → `POST /chatterbox/speech-to-speech` z `audio` + `reference_audio` → poll wyniku → pobranie MP3; referencje w `assets/references/` (`narratorFemale.mp3`, `narratorMale.mp3`, `legionary.mp3`); wymaga `AI_EFFECTS_API_KEY` + `ENABLE_AI_EFFECTS` + `AI_EFFECTS_API_BASE_URL` (domyślnie `https://api.wavespeed.ai/api/v3`). Szczegóły statusu usługi: sekcja **Status usługi AI** poniżej. **Release Android:** Metro pakuje `require()` MP3 do `res/raw` jako **lowercase** `assets_references_*` (np. `narratorfemale`); te same pliki trafiają do APK `assets/` przez Gradle `assets.srcDir` — JS mapuje lowercase URI → camelCase (`narratorFemale.mp3`) i czyta `bundle-assets://`. Debug ładuje referencje przez Metro HTTP. Cennik ok. **$0.02 / rozpoczęta minuta** źródła. ElevenLabs usunięte z produktu (za drogie).
- Pipeline basic: decode → **mono downmix** → **resample 22.05 kHz** → **dry presets: JS pitch/tempo/bass** (female/light, male/deep) / **robot + oldRadio + helium: offline render** → encode WAV z lokalnego `Float32Array` (sync) → zapis binarny.
- Pipeline advanced: decode → mono → resample 22.05 kHz → łańcuch filtrów (`highpass` → `noise_reduce` → **`pitch_shift` (SoundTouch)** → **`formant_shift` (STFT envelope)** → **`tempo_shift` (WSOLA)** → EQ / saturacja → `gain`) → encode WAV. Efekty: **Commander**, **Hall**, **Warrior**, **Female Voice**, **Male Voice**, **Android**, **Chipmunk** — wyłącznie wspólny runner JS (`applyAdvancedEffect`), nie OfflineAudioContext.
- **`formant_shift`:** przesunięcie obwiedni widmowej w STFT (Hann 2048, hop 512) — rozciąga magnitude wzdłuż osi częstotliwości bez zmiany długości; `factor > 1` jaśniejszy / wyższe formanty, `< 1` ciemniejszy. Używany w Advanced Female (×1.12), Male (×0.87) i **Android** (×1.1 — syntetyczny TTS).
- **Advanced Android:** suchy asystent TTS — wąskie piki EQ 1.2/2.45/3.8 kHz (nie 2.8/4.6 jak Robot), `formant_shift`, micro-comb 11–19 ms (mix 0.1), bez długiego comb echo presetu Robot.
- **Presety wbudowane Basic (v1)** — `female`, `helium`, `male`, `robot`, `oldRadio`, `demon`, `telephone`, **`leader`** (dawny kratos), `alien` (9 w siatce); miniatury w `assets/presets/`; **Leader**: głęboki rozkazujący głos + saturacja i slapback.
- Efekty: `detune` (pitch), `playbackRate` (tempo), `BiquadFilter lowshelf` (bass), `DelayNode` bez sprzężenia zwrotnego (echo/reverb). Echo/reverb: na suwaku −10…+10 wartość ≤0 = wyłączone, >0 = mix (spójnie z pitch/tempo/bass).
- Offline render musi liczyć długość bufora z ogonem echo/reverb (`calculateWetRenderDurationSec`) oraz **effective playback rate** (`combinedPlaybackRate`: tempo + detune). Stały zapas 0.5 s lub pominięcie detune ucinało końcówkę przy presetach z pogłosem i niskim pitch.
- Przy braku słyszalnych efektów (pitch/tempo/bass neutralne, echo/reverb = 0) pomijany jest offline render — bezpośrednie kodowanie WAV z zdekodowanego bufora.
- Logi czasu: `AudioDsp` emituje `timing:<etap>` z `stageMs` i `totalMs` (wymaga `DEBUG_MODE=true`).
- **Wydajność DSP** — snapshot kanałów audio raz do JS (`snapshotChannelData`), bez `getChannelData` w pętli próbek.
- Wynik przetwarzania: Basic/Advanced → **WAV** (PCM 16-bit); AI (WaveSpeed) → **MP3** z API bez lokalnego decode/encode.
- Podczas konwersji UI pokazuje modal „nie zamykaj aplikacji”.
- **Voice Studio (UI)** — ekran główny: ładowanie pliku, presety głosu (wbudowane + własne), odsłuch i eksport. Sekcja Effects: **Basic Effects** (karty `VoicePresetCard`) + **Advanced Effects** (karty `AdvancedEffectCard` z ikoną SVG). Suwaki efektów tylko w modalu `PresetEditorModal` (dodawanie / edycja presetu). Karty presetów wbudowanych: miniatury + opisy i18n o stałej wysokości (`VoicePresetCard`).
- **Ekonomia / kredyty:** **1 kredyt = 1 rozpoczęta minuta** AI. Koszt API providera: **~$0.02 / min** (`AI_EFFECTS_USD_PER_STARTED_MINUTE`). Premium: **`PREMIUM_PRICE_USD`**, pakiet **`PREMIUM_CREDITS` + `PREMIUM_GRATIS_CREDITS`**, subskrypcja **30 dni** — przy odnowieniu pakiet **resetuje się** do pełnej kwoty (**niewykorzystane kredyty przepadają**, bez rollover). Free welcome: **tylko z API** (`STARTING_FREE_CREDITS` / pula `FREE_INSTALLS_WITH_TEST_CREDITS`); **bez API / offline = 0** (żeby każdy offline nie dostawał darmowych). Free credits ważne **3 miesiące** od `installed_at`; przy **Premium** remaining free credits **nie wygasają**. Brak doładowań. Po `bootstrapStatus=granted` UI pokazuje dialog powitalny (pending w SQLite `welcome_credits_prompt` do kliknięcia OK). **Zużycie AI:** `spendCredits` / `POST /v1/credits/spend` **na starcie** konwersji AI (przed cloud job).
- **API kredytów (monorepo `server/`):** Postgres (Docker) + Fastify; tabele `voiceapp_devices`, `voiceapp_device_plan_events`, `voiceapp_setup`, ledger. Auth Bearer token. Device ID w Ustawieniach (support). Logi plikowe `server/logs/api-*.log` **tylko w `NODE_ENV=development`**. Szczegóły: `credits-backend.md` + `server/README.md`.
- **Pula free credits:** pierwsze **30** unikalnych `device_id` (`voiceapp_setup.free_credits_install_cap`); licznik w `voiceapp_stats`. Reinstall tego samego device → restore planu/kredytów, bez nowych free. Po wyczerpaniu puli: nowe device bez free (chyba że Premium).
- **Import/eksport audio** — picker dokumentów, kopia lokalna; przetwarzanie DSP przez `react-native-audio-api` (offline render → WAV).
- **Odsłuch audio** — modal używa `react-native-sound-player`; waveform z analizy amplitudy pliku (`getAudioWaveformPreview`).
- **Własne presety** — zapis w SQLite (`voice_presets`), sekcja „Twoje presety”; modal edycji z suwakami, polem nazwy (`voiceStudio.presetNameLabel`), przyciskiem „Aktualizuj” z `ConfirmDialog`, `SuccessDialog` po zapisie.
- **Historia przetworzeń** — SQLite (`processed_history`, max 20); lista pod przyciskiem „Przetwórz” z ikonami odsłuchu, pobrania i usuwania; nazwa pliku + preset na liście.
- Import pliku: `@react-native-documents/picker` + kopia do `audio/imports/` przez `react-native-blob-util`; na Androidzie ścieżki `file://` muszą mieć wiodące `/` przed `stat`/`readFile`.
- **Nagrywanie z mikrofonu** — `AudioRecorder` z `react-native-audio-api`, format **M4A** (mono), tymczasowo w cache → kopia do `audio/imports/` (`audioRecording.ts`); ten sam `SelectedAudioFile` i pipeline edycji co import. Limit **10 min** (`RECORDING_MAX_DURATION_SEC` = `LOCAL_MAX_AUDIO_DURATION_SEC`); auto-stop po limicie.
- **Limity długości (v1):** free **1 min** (`MAX_AUDIO_DURATION_FREE_SEC=60`) — 1 kredyt AI; premium **10 min** (`MAX_AUDIO_DURATION_PREMIUM_SEC=600`). Limit dotyczy importu, nagrania i przetwarzania (`resolvePlanMaxDurationSec`). Dłuższe pliki obcinane. Rozmiar — secondary: `IMPORT_SAFETY_MAX_SIZE_MB` = 500.
- **Formaty wejściowe:** `SUPPORTED_AUDIO_FORMATS` (domyślnie `mp3,wav,m4a,aac`); walidacja po **rozszerzeniu** nazwy w `audioImport.ts`; nagranie mikrofonu → **M4A**.
- **Nagrywanie:** auto-stop po 10 min (`useEffect` + timer); finalize odrzuca tylko gdy duration > limit (nie trimuje w `finalizeRecordedAudio` — trim dopiero w `prepareSourceAudio`).
- **Łączenie efektów:** funkcja **Premium** (`isPremium`); zabronione **2× AI** w jednym łańcuchu (`hasMultipleAiInChain`).
- **Przygotowanie źródła:** `prepareSourceAudio()` po imporcie/nagraniu robi tylko **trim** długości — **bez wstępnego odszumiania** (psuło jakość). Odszumianie opcjonalnie przy konwersji Basic/Advanced (`sourceDenoise.ts`, `ENABLE_SOURCE_DENOISE` / `SOURCE_DENOISE_STRENGTH`).

## Status usługi AI (WaveSpeed) — reguła produktu

Publiczny health/status providera AI (bez klucza API). **Nie mylić** z naszym backendem kredytów (`BACKEND_API_*`).

### Endpoint i env
- Env: **`AI_EFFECTS_API_STATUS_URL`** (w `.env` / `.env.example`).
- Domyślnie: `https://api.wavespeed.ai/public/v3/summary.json` (Instatus-compatible).
- Status page (ludzie): https://status.wavespeed.ai
- Kod: `src/services/aiServiceStatus/`, provider `AiServiceStatusProvider`, config `resolveAiEffectsApiStatusUrl` w `src/config/aiEffects.ts`.

### Kiedy odpytywać (ważne — bez częstego pollingu)
1. **Przy starcie aplikacji** — jednorazowo po gotowości DB (`AiServiceStatusProvider`).
2. **Po błędzie konwersji AI** — `refreshStatusAfterAiFailure()` z `useVoiceStudio` (quiet refresh, bez migania „Checking…”).
3. **Nie** odpytywać okresowo / na timerze / przy każdym wejściu w Ustawienia.

### Mapowanie → UI (semafor)
| Warunek | Severity | Kolor | Badge EN | Badge PL |
|---------|----------|-------|----------|----------|
| `page.status=UP` + puste `activeIncidents` + puste `activeMaintenances` | `ok` | zielony | **Operational** | **Działające** |
| `UNDERMAINTENANCE` lub niepusta `activeMaintenances` | `degraded` | żółty | Maintenance | Konserwacja |
| `HASISSUES` / `DOWN` lub niepusta `activeIncidents` | `outage` | czerwony | Issues | Problemy |
| Błąd sieci / nieparsowalna odpowiedź | `unknown` | szary | Unknown | Nieznany |

### Persystencja
- Żółty / czerwony → zapis w SQLite (`settings.ai_service_status_degraded` / `SETTING_KEYS.AI_SERVICE_STATUS_DEGRADED`).
- Przy powrocie do `ok` → wyczyść cache.
- Cache pozwala pokazać ostatni znany problem przed / gdy świeży fetch jeszcze nie wrócił.

### UI
- **Top nav:** `DotBadge` na ikonie Settings w `HeaderActions` (styl jak „Twoje pliki”) — zielony / żółty / czerwony wg statusu.
- **Ustawienia:** `AiServiceStatusCard` **nad** sekcją języka — `AiServiceStatusBadge` + komunikat (OK / konserwacja / awaria / niedostępny).
- **Voice Studio:** w `ConversionSummary` („Co się stanie”), tylko dla `cloud` / `mixed` — badge po prawej od „Efekt: …”.
- Atom badge: `AiServiceStatusBadge`; kropka: `DotBadge` (tone green/yellow/red).

### Komunikat przy błędzie AI
- Po nieudanej konwersji cloud: `voiceStudio.convertFailedAiServiceMessage` — problem z usługą AI, spróbuj później (PL/EN).
- Równolegle: odśwież status (`refreshStatusAfterAiFailure`) oraz `refreshBalance()` (kredyty pobrane z góry zostają — wg [WaveSpeed Refund Policy](https://wavespeed.ai/docs/refund-policy) ich strona może zwrócić własne kredyty providera przy błędzie systemu; nasze kredyty app nie refundujemy po spend).

### Po udanej konwersji AI
- WaveSpeed: poll `GET …/predictions/{id}/result` aż `completed` + niepuste `outputs` ([get-result](https://wavespeed.ai/docs/get-result)); lokalnie `assertAiOutputAudioFileReady` (plik istnieje, size ≥ min).
- Potem `refreshBalance()` (sync z backendem) + `SuccessDialog` (`aiConvertCredits*`) — ile odjęto / saldo.

### Ostrzeżenie przed Convert (żółty / czerwony)
- Gdy status AI to `degraded` lub `outage` i użytkownik naciska Convert przy efekcie AI: `ConfirmDialog` (`aiStatusConvertWarning*`) — **raz na sesję** (jak limit długości); mogą wystąpić problemy (trwają prace), kredyty mogą zostać odjęte; **OK** kontynuuje (`acknowledgedAiStatusRisk`), Anuluj zamyka (kolejne Convert w tej sesji bez ponownego modala).

### SDK WaveSpeed
- Oficjalne JS SDK **nie** ma metody health — używamy wyłącznie publicznego `summary.json` (nie `wavespeed.run` / Client).

## Uprawnienia platformowe

### Obecny stan (import pliku + lokalne DSP)
| Cel | iOS | Android |
|-----|-----|---------|
| Wybór pliku audio użytkownika | Systemowy picker (`UIDocumentPicker`) — użytkownik wybiera plik w dialogu; **brak stałego dostępu do całej biblioteki** | Storage Access Framework przez `@react-native-documents/picker` — plik wskazany przez użytkownika; często **bez** `READ_MEDIA_AUDIO` w runtime |
| Zapis / eksport wyniku | `MediaCollection.copyToMediaStore` → `Downloads/VoiceApp/` (`react-native-blob-util`) | Kopia do `Documents/VoiceApp/` + `UIFileSharingEnabled` (Pliki) |
| Odsłuch w aplikacji | Brak dodatkowej zgody (pliki w sandboxie aplikacji) | j.w. |
| Nagrywanie z mikrofonu | Systemowy prompt przy pierwszym użyciu (`NSMicrophoneUsageDescription`) | `RECORD_AUDIO` + runtime (`ensurePermission('microphone')`) |
| Przetwarzanie lokalne | Brak zgody sieciowej na audio (domyślnie bez uploadu) | j.w. |

### Wymagane teraz w projekcie
- **INTERNET** — opcjonalnie pod przyszłe aktualizacje / API (już w manifest).
- **Mikrofon** — `NSMicrophoneUsageDescription` (iOS), `RECORD_AUDIO` (Android); status cache w SQLite (`permission_microphone`).

### Przed szerokim skanowaniem biblioteki (bez pickera)
- **Android 13+:** `READ_MEDIA_AUDIO`.
- **Android 10–12:** `READ_EXTERNAL_STORAGE` lub MediaStore scoped.
- **iOS:** brak odpowiednika — tylko picker lub `NSAppleMusicUsageDescription` przy dostępie do biblioteki mediów (rzadko potrzebne).

### Zgody prawne / produktowe (nie systemowe)
- **Polityka prywatności** — nawet przy 100% lokalnym DSP: informacja, że głos jest przetwarzany na urządzeniu, co jest zapisywane (SQLite, pliki w sandbox), czy coś idzie do chmury (domyślnie nie).
- **RODO** — głos = dane osobowe; podstawa prawna, prawo usunięcia (usuwanie pliku w aplikacji), informacja o braku przekazywania do państw trzecich (jeśli dotyczy).
- **Eksport** — zapis do stałej lokalizacji (Pobrane / Pliki); nazwa pliku slugowana (bez spacji).

### Opcjonalne w przyszłości
- Powiadomienia (`POST_NOTIFICATIONS`, Android 13+) — przetwarzanie w tle.
- `FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_MEDIA_PLAYBACK` — jeśli długie renderowanie w tle (`react-native-audio-api` może tego wymagać przy playback w tle).

## UX założenia
- Ekran startowy (launcher) z animowanym logo przy każdym uruchomieniu — min. ~1,5 s lub do zakończenia inicjalizacji (co dłużej).
- Użytkownik widzi postęp przetwarzania (docelowo, pipeline audio).
- Oryginał nie jest nadpisywany bez potwierdzenia.
- Możliwość odsłuchu przed eksportem (`ENABLE_AUDIO_PREVIEW`).
- W ustawieniach: wersja aplikacji i status aktualizacji (informacyjnie).

## Lokalne przechowywanie danych
- **SQLite** (`react-native-sqlite-storage`) — główny magazyn lokalny na urządzeniu.
- Plik bazy: `voiceapp.db` (iOS/Android, lokalizacja `default`).
- Ustawienia użytkownika w tabeli `settings` (key/value): `theme_mode`, `app_locale`.
- Preferencje motywu i języka wczytywane przy starcie; launcher czeka na hydratację obu.
- Język startowy bez zapisu w SQLite: zgodny z językiem urządzenia (PL/EN), inaczej angielski.
- Przyszłe dane lokalne: metadane importowanych plików, kolejka przetwarzania, cache odpowiedzi API (offline-first).
