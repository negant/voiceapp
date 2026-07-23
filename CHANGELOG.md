# Changelog

Wszystkie istotne zmiany w projekcie Voice App są dokumentowane w tym pliku.

Format oparty na [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/).
Wersjonowanie zgodne z [Semantic Versioning](https://semver.org/lang/pl/).

## [Unreleased]

### Added
- **AI service status:** przy starcie aplikacji pobierany jest publiczny status WaveSpeed (`AI_EFFECTS_API_STATUS_URL` / `summary.json`); box w Ustawieniach (nad językiem) z kolorem zielony/żółty/czerwony oraz komunikatem; żółty/czerwony zapisywany w SQLite; przy efektach AI w „Co się stanie” badge statusu po prawej od nazwy efektu.
- **Google Play release prep:** package `pl.ukrywane.voiceapp`, release keystore scripts, AAB `npm run android:bundle:release`, store docs (`docs/store/`), privacy policy HTML/MD, Data safety sheet, listing copy, feature graphic + 512 icon.
- **Play Billing Premium:** `react-native-iap` purchase flow → `POST /v1/credits/plan` with `googlePlayPurchase`; server verifies via Google Play Developer API (`googleapis`) when `GOOGLE_PLAY_REQUIRE_PURCHASE_VERIFY=true`.
- **Durable device_id:** Android Keystore / iOS Keychain via `react-native-keychain` (SQLite mirror + migration).
- **Remote update check:** `fetchAppUpdateStatus` reads `GET /v1/setup` (available / required).
- **Settings:** link to privacy policy URL (`PRIVACY_POLICY_URL`).
- **Ustawienia (dev):** przycisk „Usuń kredyty” pod „Włącz premium” — zeruje saldo na potrzeby testów (przez `spendCredits` / API gdy skonfigurowane).
- **Ustawienia (dev):** przycisk „Wyczyść dane aplikacji” — kasuje settings/presety/historię/pliki audio + reload (symulacja nowej instalacji / nowego `device_id`).
- **Welcome credits dialog:** po instalacji, gdy pula free przyzna kredyty (`granted`), komunikat powitalny; pending zapisany w SQLite do kliknięcia OK (przetrwa restart).

### Changed
- **Limit długości pliku:** dialog przed importem/nagraniem pokazywany **raz na uruchomienie** aplikacji (nie przy każdym tapnięciu).
- **ConversionSummary:** usunięty opis „Konwersja AI w chmurze… / do Xs”; szacowany koszt: `1 kredyt ≈ 1 rozpoczęta minuta`.
- **AI status:** `DotBadge` przy ikonie Settings w top nav (zielony/żółty/czerwony); w Ustawieniach label `AiServiceStatusBadge` jak wcześniej; Developer — przyciski symulacji statusów.
- **AI service status:** URL z env `AI_EFFECTS_API_STATUS_URL`; odpytywanie tylko przy starcie oraz po błędzie konwersji AI (bez częstego pollingu); komunikat błędu AI: spróbuj później; badge OK: **Operational** / **Działające**.
- **App version:** `1.0.0` (Android `versionName` / `versionCode` 1 aligned).
- **Credits “Buy Premium”:** opens Play Billing instead of free `setAccountPlan('premium')` (dev switch remains for `__DEV__` / `DEBUG_MODE`).
- **Free credits tylko z API:** bez `BACKEND_API_BASE_URL` / offline → saldo startowe **0** (brak lokalnego grantu welcome); dialog powitalny tylko przy `bootstrapStatus=granted`.
- **Badge kredytów w nagłówku:** przy saldzie 0 pokazuje **0** (nie CTA „Kup Premium”) — Premium to subskrypcja miesięczna z resetem pakietu.
- **Copy Premium:** subskrypcja **Google Play** — kredyty resetują się co miesiąc; **niewykorzystane przepadają** (plan features + billing).
- **Env naming (vendor-agnostic):** `WAVESPEED_API_KEY` / `ENABLE_WAVESPEED_STS` → `AI_EFFECTS_API_KEY` / `ENABLE_AI_EFFECTS`; `CREDITS_API_BASE_URL` / `CREDITS_API_TOKEN` → `BACKEND_API_BASE_URL` / `BACKEND_API_TOKEN` (provider/backend mogą się zmienić bez rename w app).
- **Usunięto `APP_USD_PER_STARTED_MINUTE`:** nieużywane w runtime — cena to `PREMIUM_PRICE_USD` + pakiet kredytów.
- **`AI_EFFECTS_API_BASE_URL`:** adres API efektów AI w `.env` (domyślnie WaveSpeed `https://api.wavespeed.ai/api/v3`) — da się podmienić bez zmiany kodu.

### Fixed
- **Kredyty AI:** odejmowanie przy **starcie** konwersji AI (przed WaveSpeed), nie po sukcesie — unikamy sytuacji, w której API WaveSpeed rozlicza zadanie, a aplikacja nie odejmie kredytów po killu/crashu w trakcie joba.
- **Server build:** `src/types.ts` import `./domain/creditsEconomy.js` (było błędne `../domain/`).
- **Prod migrate:** `schema.sql` kopiowany do `dist/db/` przy `npm run build`; fallback w `migrate.ts` na `src/db/schema.sql`.
- **Release Android AI (WaveSpeed):** upload źródła przez `wrap(path)`; referencje MP3 — `assets.srcDir` z repo (bez taska Copy), odczyt `bundle-assets://` z mapowaniem lowercase URI → camelCase (`resolveBundledAssetFile.ts`).

- **Prod API URL:** `CREDITS_API_BASE_URL=https://api.ukrywane.pl` (DNS A → `91.228.196.27`); `.env.example` i `server/README.md` — dev LAN jako komentarz.

- **API kredytów (`server/`):** Fastify + Postgres (Docker); tabele `voiceapp_devices`, `voiceapp_device_plan_events`, `voiceapp_setup`, ledger; auth Bearer; register/sync/spend/plan/setup; lokalny start w `server/README.md`.
- **API logi plikowe:** `server/logs/api-YYYY-MM-DD.log` **tylko w development** (`NODE_ENV`); gitignore zawartości; skrypty `logs:tail`, `db:psql` / `db:tables` / `db:devices`; zdarzenia sync: `credits_register` / `credits_sync` / `credits_plan` / `credits_spend`.
- **Fix URL API na urządzeniu:** fizyczny Android nie może używać `localhost` — `CREDITS_API_BASE_URL` = IP LAN (np. `http://192.168.x.x:8787`).
- **Device ID:** UUID w SQLite + wyświetlenie w Ustawieniach (support); bootstrap API przy `CREDITS_API_BASE_URL`.
- **Copy planów:** free credits ważne **3 miesiące**; Premium — kredyty **odnawiane co miesiąc**.

### Removed
- **Doładowanie kredytów:** usunięte top-up z ekranu Kredyty i switch „Dodaj kredyty” w Ustawieniach (dev) — jedyna ścieżka płatna to Premium.
- **Wstępne odszumianie przy imporcie/nagraniu:** `prepareSourceAudio` robi tylko trim długości; usunięte `denoiseSourceAudio` i profil `import`. Odszumianie zostaje opcjonalnie przy konwersji Basic/Advanced (`ENABLE_SOURCE_DENOISE`).
- **ElevenLabs:** usunięty cały silnik STS (`aiEffects/elevenLabs/`), głosy Romantyczna / Male Deep / Pirat / Ogr oraz env `ELEVEN_LABS_API_KEY` / `ENABLE_ELEVENLABS_STS`. AI = wyłącznie WaveSpeed (Narratorka, Narrator, Legionista). Awatary PNG byłych głosów zostawione w `assets/presets/`.

### Added
- **FAQ — kredyty AI:** pytanie o to, za co odejmowane są kredyty (tylko efekty AI), że charge jest na starcie oraz że przerwanie / utrata sieci nie daje zwrotu.
- **Premium $10:** **150 + 50 free = 200** rozpoczętych minut AI (≈ **3,3 h**); copy na ekranie konta z rozbiciem i godzinami.
- **AI Effects — WaveSpeed Chatterbox STS:** silnik `waveSpeed/`; głosy produktowe **Narratorka** / **Narrator** / **Legionista**; env `WAVESPEED_API_KEY` + `ENABLE_WAVESPEED_STS`.
- **Limity długości pliku w `.env`:** `MAX_AUDIO_DURATION_FREE_SEC` (domyślnie **60**) i `MAX_AUDIO_DURATION_PREMIUM_SEC` (domyślnie 600) — `env.maxAudioDurationFreeSec` / `env.maxAudioDurationPremiumSec`; używane przez `resolveAiMaxDurationSec` i limity lokalne.
- **Pula kredytów testowych (30k instalacji):** dokumentacja API bootstrap (`credits-backend.md`), stałe `FREE_INSTALLS_WITH_TEST_CREDITS`, stub `fetchCreditsBootstrap`, UI na ekranie Kredyty.
- **Plan konta (free/premium):** `account_plan` w SQLite; `CreditsProvider` eksponuje `accountPlan` / `isPremium`; ekran Kredyty pokazuje plan.
- **Łączenie efektów (Premium):** gate na „Połącz efekty”; blokada łańcucha **2× AI** (podwójne zużycie kredytów).

### Changed
- **Free credits expiry:** 3 miesiące od **`installed_at`**; przy **Premium** free credits zostają na stałe (`free_credits_expires_at=NULL`); po downgrade przywracana data z instalacji (+ ewentualne wyzerowanie przy sync).
- **Sync kredytów z API:** start appki = register + sync; włączenie/wyłączenie Premium i zakup = `POST /v1/credits/plan`; zużycie AI = `POST /v1/credits/spend` (`spendCredits`); lokalne SQLite jako cache.
- **Ekran konta (Premium):** tytuł **Twoje Konto**; wspólny styl nagłówków saldo/plan; Premium w jednej karcie z planem; rozliczanie bez kosztów API; bez sekcji „efekty lokalne”.
- **Voice Studio — limity w „Twoje audio”:** opis AI Effects bez limitu długości; na Free mały CTA „Rozszerz do 10 min · Kup Premium” pod hintem formatów.
- **Saldo startowe Free:** migracja legacy salda `0` → **250** kredytów powitalnych (jednorazowo, `credits_seed_version`).
- **Limity długości pliku:** Free **1 min**, Premium **10 min** (env `MAX_AUDIO_DURATION_*_SEC`); komunikaty w planach, imporcie i nagrywaniu; dłuższe klipy obcinane.
- **Ekonomia kredytów (WaveSpeed):** **1 kredyt = 1 rozpoczęta minuta**; API **$0.02 / min**; app retail **`APP_USD_PER_STARTED_MINUTE`** (domyślnie **$0.05**); Premium **`PREMIUM_PRICE_USD`** (domyślnie **$4.99** ≈ **100 min**); Free = 10 kredytów; bez doładowań.
- **Nagłówek kredytów:** saldo na free/premium; **Buy Premium** gdy free i saldo 0.
- **Ustawienia (dev):** tylko „Włącz premium” (włączenie → 200 kredytów, wyłączenie → 10); bez doładowań / „Usuń kredyty”.
- **AI — referencje WaveSpeed:** pliki w `assets/references/` — `narratorFemale.mp3`, `narratorMale.mp3`, `legionary.mp3`.
- **AI — Narratorka / Narrator / Legionista:** przeniesione z ElevenLabs na **WaveSpeed Chatterbox** (referencje z `assets/references/`); usunięte osobne karty testowe `testFemale` / `testMale` / `testLegionista`.
- **Limity audio — czas > rozmiar:** główny limit to długość klipu; rozmiar importu to safety cap (`IMPORT_SAFETY_MAX_SIZE_MB`); denoise nie odrzuca WAV po trimie z powodu rozmiaru; UI bez promowania MB.
- **AI 10 s tylko na free:** `resolveAiMaxDurationSec(plan)` — premium do 10 min; copy PL/EN w Voice Studio, FAQ i podsumowaniu konwersji.
- **AI a saldo kredytów:** efektywny limit AI = min(plan, saldo); nagrywanie z efektem AI ograniczone kredytami; hinty kosztu w UI; blokada przy braku kredytów.

### Fixed
- **Limity długości w UI planów:** Free zawsze pokazuje sekundy (np. **60 s**), żeby nie wychodziło „0 min” przy zaokrągleniu; Premium zostaje w minutach gdy pełne (np. **10 min**).
- **Copy Premium:** tytuł i przycisk bez powtórzonego „+50” — bonus tylko w highlightcie i opisie.
- **Trim przed konwersją AI:** `process-trim` nie usuwa już pliku źródłowego (`replaceSource: false`) — naprawia ENOENT przy ponownym odczycie po obcięciu do 10 s.
- **Konwersja AI po trimie:** klipy >10 s są obcinane w pamięci (`prepareAiSourceForSts`) i wysyłane do STS jako base64 — bez polegania na pliku tymczasowym po `trimAudioFileIfNeeded`.
- **Nazwy importów:** spacje w nazwach plików zamieniane na `_` w `sanitizeImportFileName`.

### Changed
- **Home hero:** copy pod twórców (m.in. Reels/Shorts/TikTok, podcast, pranki — nie wyłącznie short-form); badge'e use case; karta z tłem; **SourceAudioActions** — duże kafelki importu i nagrania.
- **Karty efektów:** usunięto widoczne opisy pod nazwą (Basic/Advanced/AI) — mniejsza wysokość siatki; opisy zostają w etykietach dostępności.
- **Karty efektów:** badge Free / Premium na każdej karcie (`EffectAccessBadge`); konfiguracja per efekt w `effectAccessTiers.ts`.
- **Komunikacja produktu (PL/EN):**

### Fixed
- **Alerty warn/error — czytelność:** tekst i tło dialogów z jawnymi kolorami motywu (NativeWind w Modal bywał niewidoczny); błędy/ostrzeżenia przez `showErrorAlert` / `showWarningAlert` zamiast natywnego `Alert.alert`.

### Added
- **Limity audio:** Basic/Advanced do **10 min** (nagrywanie + import z auto-obcinaniem); AI demo **10 s** na konwersję; import max **25 MB**; komunikaty w UI i FAQ.
- **Kredyty (ekonomia):** saldo w nagłówku Home obok logo (`CreditsHeaderBadge`); start **1000 kredytów** zapisywany w SQLite przy pierwszym uruchomieniu (`CreditsProvider`, `creditsRepository`); tap → ekran **Kredyty** (`CreditsInfoScreen`); kurs **1000 kr = 1 min AI**.
- **AppAlert system:** stylowane alerty (`AppAlert` + `AppAlertProvider` / `useAppAlert`) — warianty info/success/warning/error, kolejka, helpery offline/online/error/warning; auto-alert po powrocie internetu.
- **AI Effects — Ogr** (`ogr`): voice ID `aFP3vBsOLKEfWMAMPheP`, awatar `assets/presets/ogr.png`.
- **AI Effects — tryb offline:** bez internetu karty AI są wyszarzone; wybór pokazuje alert (wymagane połączenie). NetInfo (`@react-native-community/netinfo`).

### Removed
- **AI Effects — lokalny FACodec / ONNX:** usunięto cały pipeline lokalnej konwersji głosu (`onnxruntime-react-native`, modele `facodec_*.onnx`, bundlowanie assetów, skrypty download/link, post-DSP vocodera). AI = wyłącznie ElevenLabs STS.
- **AI Effects — zbędne cele:** usunięto z katalogu French / Vampire / Male / Male Deep / Mature Male / Extraterrestrial. Zostają **narrator** i **godOfWar** (awatary PNG zachowane na dysku).

### Changed
- **AI Effects — katalog UI:** `narratorka`, `romantyczna`, `narrator`, `maleDeep`, `pirat`, `ogr`, `legionista` z PNG. Opisy użytkownika: zaawansowane AI + internet (bez brandingu / API w UI). Voice ID m.in. Ogr `aFP3vBsOLKEfWMAMPheP`, Pirat `GN6I0I29hj3Z6rDzBCbt`, Romantyczna `HECTtlQhQlGs92mhlNnU`, Narrator `HIGUfNOdjuWQwwapnTRW`, Male Deep `IRHApOXLvnW57QJPQH2P`, Legionista `3eLZ7H8WE2u8aGFekoLj`; Narratorka — do uzupełnienia.
- **AI Effects — ElevenLabs:** wynik STS zapisywany jako **MP3 as-is** (bez lokalnego decode/encode do WAV).
- **AI Effects:** ElevenLabs Speech-to-Speech; wynik API bez lokalnego DSP post-process.
- **FAQ / i18n:** opisy AI jako cloud STS (bez lokalnych referencji ONNX).

### Fixed
- **Alerty / dialogi — czytelność:** natywne Android `Alert.alert` — motyw `AppAlertDialogTheme`; `ConfirmDialog` / `SuccessDialog` / `Button` używają `useTheme().isDark` (biały tekst na białym tle w Modal).
- **ElevenLabs STS — encoding:** po API wynik MP3 zapisany od razu na dysk (bez wolnego JS byte↔base64); logi `mp3 decoded` / `wav encoded` z czasami.
- **ElevenLabs STS na Androidzie:** upload base64 multipart (bez `wrap` — spacje w nazwie pliku); odpowiedź przez `base64()` zamiast `fileCache` (unika „Download interrupted.”).
- **ElevenLabs STS na Androidzie:** upload przez `react-native-blob-util` multipart zamiast `fetch`+FormData (hang na Bridgeless); timeout 180 s + logi `request start/finished`.
- **Require cycle:** `NEUTRAL_AUDIO_EFFECTS` / `AUDIO_EFFECT_KEYS` przeniesione do `src/constants/audioEffects.ts` — brak cyklu `voiceStudio.ts` ↔ `voiceStudioEffects.ts`.

### Changed
- **Wstępne odszumianie źródła:** ponownie aktywne po imporcie i nagraniu (profil `import` bez bramki — bezpieczny dla AI); mocniejsze tłumienie szumu, rumble HPF, tame rezonansowych gór 3–4 kHz i soft limiter szczytów; domyślna siła 0.58 (`SOURCE_DENOISE_STRENGTH`). Basic/Advanced nadal dokładają pełne odszumianie przy konwersji (łagodniejsze gdy plik już `-clean.wav`).

### Added
- **FAQ:** strzałki rozwijania/zwijania (góra/dół), pytania o tiery efektów (Basic / Advanced / AI), czas przetwarzania, legalne użycie efektów głosu oraz od czego zależy końcowy efekt (PL/EN).

### Added
- **Twoje efekty — Połącz efekty:** zapis własnego efektu jako łańcucha dwóch wbudowanych efektów (basic / advanced / AI) stosowanych po kolei; modal z opisem działania i wyborem kolejności; przetwarzanie sekwencyjne w pipeline audio.

### Changed
- **Launcher:** dolny panel komiksowy — **God of War** zamiast Leader (`godOfWar.png` z tieru AI).
- **Basic Effects — Leader:** preset `kratos` przemianowany na **Leader** (`leader`); nowy awatar `leader.png`. AI efekt wojownika to osobno **God of War** w tierze AI.

### Changed
- **Połącz efekty — awatary:** zapisane połączenia w „Twoje efekty” pokazują dwa mniejsze awatary ze strzałką (bez opisu pod tytułem); w modalu wyboru pozostają kompaktowe tagi tekstowe.
- **Home — scroll:** wydzielony memoizowany `VoiceStudioScrollContent` (lista nie przeładowuje się przy odtwarzaniu/konwersji), memo na kartach efektów, `removeClippedSubviews` na Androidzie, usunięte cienie z awatarów AI.
- **AI Effects (Narrator) — modele FP32 zamiast INT8:** wbudowany stos `facodec_*.onnx` (~149 MB) — potwierdzona lepsza jakość na urządzeniu (mniej szumu vs INT8); wolniejsza inferencja i większy APK. Powrót do INT8: `node scripts/download-ai-models.mjs --int8`.

### Fixed
- **AI Effects (Narrator) — trzaski na końcach i rozciągnięte „sss”:** trim wyrównany do ramek vocodera (200 próbek), cosine fade-out 28 ms, prozodia mel trzyma ostatnią ramkę zamiast ciszy, bramka na RMS (nie peak), de-hiss powyżej 6.2 kHz, lżejszy denoise (~15%).

### Added
- **Basic Effects — Slow / Fast Voice:** presety **Turtle** (wolny głos) i **Cheetah** (szybki głos) — DSP tempo + pitch; awatary anime `turtle.png` / `cheetah.png`. drugi efekt FACodec z referencją `en-US-GuyNeural` (voiceclonnx demo, MIT edge-tts); awatar anime `narratorMale.png`; współdzielone modele ONNX z Narrator Female.
- **AI Effects (tier 3):** sekcja w Voice Studio z efektem **Narrator Female** — lokalna konwersja głosu ONNX (FACodec INT8); modele wbudowane w aplikację.
- **Twoje nagrania — usuń wszystkie:** przycisk „Usuń wszystkie nagrania” (gdy jest więcej niż 2 pozycje) z modalem potwierdzenia; usuwa wpisy z bazy i pliki audio z urządzenia.
- **Nagrywanie audio z mikrofonu** — modal Start/Stop, uprawnienie mikrofonu (Android runtime + iOS przy pierwszym użyciu), zapis M4A do `audio/imports/` i ten sam pipeline edycji co import pliku.
- **Wstępne odszumianie źródła** — po imporcie i nagraniu lekki noise gate + tłumienie szumu (`ENABLE_SOURCE_DENOISE`), zapis oczyszczonego pliku jako WAV w `audio/imports/`.

### Changed
- **About:** zakładka przemianowana z Instrukcja; nagłówek „Wykonaj te kroki” nad krokami; krok 1 opisuje import i nagrywanie mikrofonem.
- **Instrukcja + FAQ:** sekcja FAQ przeniesiona do ekranu About (dawniej Instrukcja); osobna ikona FAQ usunięta z nagłówka.
- **Ustawienia:** usunięto sekcję i odnośnik do ekranu Twoje nagrania (dostęp pozostaje z nagłówka i sekcji na Home).
- **Advanced — Female/Male Voice:** eksperymentalny krok `formant_shift` (STFT, przesunięcie obwiedni widmowej) po pitch shift — damski ×1.12, męski ×0.87.
- **Advanced — Android:** suchy syntetyczny TTS (`formant_shift` ×1.1, wąskie piki 1.2/2.45/3.8 kHz, micro-comb zamiast comb echo Robot).
- **Modal nagrywania:** duży przycisk-mikrofon do startu; podczas nagrywania zmienia się w stop z pulsującymi pierścieniami reagującymi na głos.
- **Przygotowanie źródła:** modal i podpowiedź „Przygotowywanie audio” podczas odszumiania; wpis w FAQ.
- **Basic Effects:** nowe presety **Demon**, **Stary telefon**, **Kratos** i **Kosmita** z wet chain DSP i awatarami PNG.
- **Advanced Effects — Hall:** preset na bazie Commandera z dużo mocniejszym echem hali (mix 0.72, 5 tapów do 1.1 s); awatar `hall.png` (pusta, echująca przestrzeń).
- **Pitch tweak przed Convert** — suwak pitch + zapis do Your effects (nazwa efektu + pitch, awatar źródłowy; edycja tylko pitch).
- **AI model assets:** usunięto legacy duplikaty z `assets/ai-models/` (~130 MB); jedyny katalog źródłowy: `src/assets/ai-models/`.
- **AI Effects (Narrator) — cofnięcie agresywnego DSP:** powrót do pełnego stosu INT8; uproszczony post-process (łagodna bramka, denoise ~30%).

### Fixed
- **AI Effects — modele tylko z APK/IPA (bez pobierania z sieci):** runtime kopiuje ONNX z natywnych assetów aplikacji do `DocumentDir`; usunięto fallback HuggingFace; Gradle `linkAiModelAssets` przed każdym buildem Android.
- **AI Effects — zawieszanie na „Ładowanie modeli” (~16%):** kopiowanie ONNX — priorytet natywne assety Android (`link:ai-model-assets` + rebuild), potem Metro HTTP (tylko dev), walidacja rozmiaru; `noCompress` dla `.onnx` w APK.
- **Android build (onnxruntime-react-native):** patch `patch-package` — zamiana usuniętego w Gradle 9 `VersionNumber.parse()` na porównanie wersji RN (microsoft/onnxruntime#27385).
- **Nagłówek przy starcie:** poprawione safe area przy pierwszym uruchomieniu (`initialWindowMetrics`, spójny `StatusBar`, bez podwójnego paddingu u góry w `Screen`).
- **Recent na Home:** sekcja ostatnich nagrań odświeża się po powrocie z ekranu Your Recordings (spójność z usunięciami z listy nagrań).
- **SQLite migracja v4:** idempotentne dodawanie kolumn `source_tier` / `source_id` / `avatar_image_key` (PRAGMA `table_info` zamiast powtarzającego się `ALTER`).
- **Advanced Effects:** `@soundtouchjs/core` (SoundTouch WSOLA) zamiast wycofanego `react-native-ffmpeg`; preset **Chipmunk** (pitch ×1.55) do słyszalnych testów.

### Changed
- **Basic Effects:** preset Megafon przemianowany na **Kratos** (ten sam łańcuch DSP) + nowy awatar wojownika.
- **Basic Effects:** usunięto presety **Submarine**, **Seductive Female** i **Hamster** z siatki; **female** → etykieta **Light** / **Lekki**, **male** → **Deep** / **Głęboki** (bez słów „female”/„male”).
- Launcher: panele komiksowe — **Female Voice** Advanced (środek) i **Kratos** Basic (dół); zamiana miejsc z poprzednią konfiguracją Warrior/Hall.
- Wartości sliderów presetów przeniesione do `basicEffects/presets/{id}/effects.ts`; `voiceStudioEffects.ts` agreguje rejestr.
- Advanced Effects: usunięto **Female Voice** z tieru advanced (pozostaje w Basic); jedyny advanced: **Chipmunk**.
- Menu nagłówka: licznik nagrań zastąpiony **kropką** (`DotBadge`) — widoczna gdy są nagrania, znika po usunięciu wszystkich.
- **Nagłówek nawigacji**: pełna lista ikon + przełącznik motywu tylko na **Home**; na pozostałych ekranach tytuł po lewej, strzałka powrotu po prawej.

### Fixed
- **Advanced Effects:** awatary PNG dla **Commander** i **Chipmunk**; kafelki advanced wyrównane do wysokości basic (`VoicePresetCard`).
- Launcher: usunięto trójkątną szczelinę między panelami Kratos / Robot / Demon (wspólny wierzchołek paneli).
- Launcher: tło komiksowe wypełnia cały ekran (bez szarego pasa na dole).

### Added
- **Twoje nagrania** — osobna strona z pełną listą przetworzonych plików (play, download, share, delete); dostęp z menu nagłówka i Ustawień.
- Menu nagłówka: ikona nagrań z **licznikiem** (jak koszyk) tuż przy przełączniku motywu.
- Home: sekcja „Ostatnio przetworzone” pokazuje **5 ostatnich** pozycji + przycisk **Pokaż więcej**.
- Udostępnianie przetworzonego pliku (`shareProcessedAudio`) przez natywny Share sheet.
- Voice Studio: **dwupoziomowa struktura efektów** — sekcja Effects z podsekcjami **Basic Effects** (dotychczasowe presety DSP) i **Advanced Effects** (łańcuchy filtrów w stylu FFmpeg); pierwszy efekt zaawansowany: **Female Voice** (`src/services/audio/advancedEffects/`).
- Voice Studio: `AdvancedEffectCard` z gradientową ikoną SVG (odróżnienie od kart Basic).
- Voice Studio: brak automatycznie wybranego efektu przy starcie (`selection: none`).
- Launcher: komiksowe tło z 5 panelami pod skosem (female, male, robot, kratos, demon) za logo i nazwą aplikacji.
- Preset **Hamster** (`hamster`) — po **Hel** w siatce (dawniej SpongeBob); piszczący głos chomika, bardzo wysoki ton, szybka mowa i sprężyste echo.
- Preset **Helium** (`helium`) — po **Uwodzicielska** w siatce; bardzo wysoki głos po helu z nosowym, kaczym brzmieniem (offline render).
- Preset **Submarine** (`submarine`) — łódź podwodna z przyciszonym metalicznym głosem, mocnym pogłosem i szumem ciśnienia w tle (bez sonaru).
- Preset **Old Radio** (`oldRadio`) — po **Robot** w siatce; grafika retro radia w `assets/presets/oldRadio.png`; wąskie pasmo AM, echo z głośnika i pogłos pokoju (offline render).
- Preset **Seductive Female** (`sexy`) — po **Damski** w siatce; nowa grafika anime; wysoki uwodzicielski głos z echem (offline render).
- Preset **Kratos** — bardzo niski pitch, wolne tempo, mocny bas (inspiracja głosem z God of War); awatary graficzne dla wszystkich presetów wbudowanych w `assets/presets/`.
- Voice Studio: lista ostatnio przetworzonych plików (SQLite, max 20) z ikonami odsłuchu, pobrania i usuwania; nazwa pliku i preset na liście.
- Voice Studio: dynamiczny podgląd waveform w modalu odsłuchu — analiza amplitudy z rzeczywistego pliku (`audioWaveform`, `waveformPreview`).

### Fixed
- Import audio: krótkie odłożenie otwarcia native pickera i blokada podwójnego tapnięcia, żeby uniknąć błędu Android `Current activity is null` / alertu bez Activity.
- Wydajność: usunięto ciągłą animację logo na Home (główna przyczyna spowolnień UI).
- DSP: fix ucinania końcówki przy Kratos/Robot — render liczy `detune + tempo` (combined playback rate) i dłuższy ogon feedbacku echa.
- Modal konwersji: licznik i przycisk przerwania nie zamrażają się podczas DSP — yieldy w downmix/resample/efektach/kodowaniu WAV; licznik w osobnym komponencie (1 Hz).
- Preset **Robot** (v2): więcej echa (pętla feedback + 3 opóźnienia), mniej sygnału dry, niższy pitch, sample-hold przed wet chain; wyższe limity wet mix przy `robotVoice`.
- **Wydajność DSP** — fix `mixDownToMono`: jeden snapshot kanału z native zamiast `getChannelData` per próbka (główna przyczyna ~3 min na 9 s).
- DSP: crash przy 55% — `copyToChannel` z `subarray` kopiował cały backing buffer w native API; kopia pełnego kanału.
- Eksport: poprawny MIME `audio/wav`, weryfikacja istnienia pliku przed zapisem.
- DSP: szybsze kodowanie WAV (chunkowany base64); logi czasu etapów przetwarzania.

### Changed
- Voice Studio: **Basic Effects** i **Advanced Effects** jako osobne, identycznie wyglądające sekcje (`StudioSection`) z opisem pod tytułem; usunięto wewnętrzną ramkę i slider z Advanced.
- Lista przetworzonych plików: tytuł i efekt w osobnych liniach, pod spodem rząd przycisków play / download / share / delete.
- Preset **Kratos** (v2): szybsza mowa i mocniejszy pogłos jaskiniowy.
- Preset **Helium** — nowy awatar sterowca; **SpongeBob** przemianowany na **Chomik** (`hamster`).
- Preset **Old Radio** (v2): szum/crackle, lekkie przesterowanie (WaveShaper), mocniejsze echo i pogłos.
- Preset **Old Radio** (v3): sam delikatny szum w segmentach z krótkimi ciszami — bez nakładania warstw i bez trzasków.
- Długi opis (`introBody`) na dole ekranu głównego.
- UI: kafelki efektów — tło ze zdjęcia (niska opacity) + gradient szkła 35°.
- Voice Studio: wyłączona edycja wbudowanych efektów — **Edytuj efekt** tylko dla własnych zapisanych efektów.
- Preset **Kratos** (v2): mocne echo i reverb (offline render), głębszy pitch, max bas; łańcuch „ciężki” (hall echo + feedback, długi reverb, filtry chest/gravel).
- Preset **Kratos**: więcej chrypki — mocniejsze filtry gravel/rasp/grit + snarl (~2.2 kHz).
- **EffectSlider**: większy odstęp suwak ↔ pole wartości (kółko nie nachodzi na input przy skrajnych pozycjach).
- Edycja efektów: pole wartości (−10…+10) obok suwaka; krótszy slider — mniej przypadkowych zmian przy przewijaniu.
- Voice Studio: większe awatary presetów (80×80); damski i męski — nowe portrety anime; ponowne kliknięcie efektu go odznacza.
- UI: lista dozwolonych formatów wejściowych (MP3, WAV, M4A, AAC) przy ładowaniu pliku, w FAQ i instrukcji.
- Voice Studio: sekcja **Efekty** w siatce 2 kolumn (zamiast poziomego scrolla); etykiety UI „efekt” zamiast „preset”.
- **Presety v1** — 4 wbudowane: damski (`female`), męski (`male`), robot, kratos; domyślny `female`; usunięto natural/warm/deep/bright.
- **Echo/reverb** — mapowanie zgodne ze skalą −10…+10 (≤0 = wyłączone, >0 = mix); Kratos z nieco szybszym tempem.
- Voice Studio: opisy suwaków efektów z wyjaśnieniem w nawiasie (PL/EN); karty presetów z miniaturą i krótkim opisem.
- Voice Studio: usunięto sekcję efektów z głównego panelu (edycja tylko w modalu presetów); przycisk „Dodaj własny preset”; naprawione przewijanie w modalu; ładniejszy komunikat sukcesu po zapisie presetu; odsłuch oryginału i usuwanie pliku jako przyciski z ikoną (Play / czerwony kosz).
- Nagłówek: logo + Voice App; nawigacja Instrukcja i FAQ; opis aplikacji; uprawnienia plików (SQL + runtime); modal presetów ze suwakami; większe przyciski Edytuj/Usuń preset.
- Voice Studio: usunięto numerację kroków 1–2–3.
- Eksport: zapis do Pobranych (Android) / folderu VoiceApp w Plikach (iOS) zamiast share sheet; usunięto `react-native-share`.
- Aplikacja zablokowana w orientacji pionowej (iOS + Android).

### Fixed
- SQLite: migracja v3 nie tworzyła tabeli `processed_history` przy pierwszej instalacji (błąd „no such table”); DDL uruchamiane idempotentnie przy każdym starcie.
- i18n: brakujący klucz `voiceStudio.presetNameLabel` w modalu presetów (wyświetlał się surowy identyfikator zamiast etykiety).
- Voice Studio: modal „Usunąć preset?” był zawsze widoczny po starcie (brakujący prop `visible` na `ConfirmDialog`).
- Import audio na Androidzie: poprawna normalizacja ścieżek `file://` (brakujące `/`) i kopia do `audio/imports/` zamiast stat na ścieżce z pickera.
- Import audio: logi diagnostyczne (`logger`), odczyt czasu trwania nie blokuje importu przy błędzie metadanych.

### Changed
- Voice Studio: suwaki efektów z przeciąganiem, skalą -10…+10 i polem numerycznym; przyciski presetów na pełną szerokość.
- Voice Studio: nowy flow — odsłuch oryginału i usuwanie pliku przy załadowaniu; akcje presetów pod suwakami; na dole „Przetwórz”, potem modal odsłuchu efektu i pobieranie.
- Voice Studio: zapis presetu tylko przy zmianie efektów; usuwanie własnych presetów (X + modal potwierdzenia).
- Voice Studio: zapis własnych presetów w SQLite, sekcja „Twoje presety”, dialog z nazwą przy zapisie.
- Voice Studio: wybór presetu ustawia profile efektów; przycisk „Przywróć domyślne” dla aktywnego presetu.
- i18n: język startowy z ustawień urządzenia (PL/EN), fallback `en`; wybór w ustawieniach nadal w SQLite.
- Dokumentacja AI: launcher, Reanimated, wersja/aktualizacje, mock Jest dla Reanimated v4.
- i18n: typowany `TranslationKey` z `en.json`, `schema.json` (jak kupbilecikpl-app), skrypt `npm run i18n:schema`.
- Konwencje kodu: komentarze po angielsku (dlaczego, nie co), typy komponentów w `*.types.ts`, domyślny język `en`, test parity tłumaczeń.
- Reorganizacja `src/components/` na **Atomic Design** (`atoms/`, `molecules/`, `organisms/`).
- Dokumentacja komponentów: `.aiassistant/rules/components.md`; aktualizacja `AGENTS.md`, `coding-rules.md`, `architecture.md`, `README.md`.
- Patch `react-native-sqlite-storage` rozszerzony o usunięcie przestarzałego `dependency.platforms.ios.project` z `react-native.config.js`.

### Added
- **Przetwarzanie audio (DSP)** — `react-native-audio-api` + `OfflineAudioContext`: pitch, tempo, bass, echo, reverb; wynik jako WAV.
- Modal przetwarzania z ostrzeżeniem o nie zamykaniu aplikacji i paskiem postępu.
- **Import/eksport audio** — `@react-native-documents/picker`, `react-native-blob-util`, `react-native-share`, `react-native-sound-player`; metadane czasu trwania z nagłówka pliku.
- **Voice Studio** na ekranie głównym — ładowanie pliku (demo 30 s), presety głosu, efekty (pitch/tempo/echo/reverb/bass), odsłuch i pobieranie.
- **Ekran startowy (launcher)** — animowane logo (Reanimated), fade-out po inicjalizacji aplikacji.
- Sekcja **O aplikacji** w ustawieniach — wersja z `package.json`, status aktualizacji (stub pod przyszły sklep/API).
- **Wielojęzyczność (i18n)** — PL/EN, pliki JSON w `src/i18n/locales/`, hook `useTranslation`, persystencja `app_locale` w SQLite.
- Ekrany **Ustawienia** i **Język aplikacji**; ikona ustawień w nagłówku obok przełącznika motywu.
- **Logo aplikacji** — komponent SVG `Logo` (atom) z motywem fali dźwiękowej; warianty `mark` (ikona z gradientem) i `plain`; użyte w nagłówku ekranu Home.
- `assets/logo.svg` — źródłowy plik logo (fala dźwiękowa w zaokrąglonym kwadracie) do generowania ikon aplikacji.
- Skrypt `npm run generate:icons` — generuje ikony iOS (`AppIcon.appiconset`) i Android (`mipmap-*`) z `assets/logo.svg`.
- Patch `react-native-sqlite-storage` (`jcenter()` → `mavenCentral()`) przez `patch-package`; skrypt `postinstall`.
- **SQLite** (`react-native-sqlite-storage`) — lokalna baza `voiceapp.db`, tabela `settings`.
- Persystencja motywu (`theme_mode`) — wczytanie przy starcie, zapis przy przełączeniu.
- `DatabaseProvider`, `ThemeProvider`, warstwa `src/services/database/`.
- Przełącznik trybu jasny/ciemny w nagłówku (`ThemeToggle` — kompaktowy switch z ikoną Sun/Moon w suwaku).
- Skrypt `npm run start:reset` do restartu Metro po zmianach NativeWind / env.
- Zasady testów jednostkowych: `.aiassistant/rules/testing.md` (obowiązek przy nowych funkcjach).
- Przykład: `src/utils/audioFile.ts` + `audioFile.test.ts`.
- Skrypty `npm run test:watch`, `npm run test:coverage`.
- Dokumentacja dla agentów AI: `AGENTS.md`, `.aiassistant/rules/`.
- Reguła Cursor `.cursor/rules/voice-app.mdc` (always apply).
- `CHANGELOG.md`, `PROGRESS.md`.
- Konfiguracja środowiska: `.env.example`, `src/config/env.ts`, `react-native-dotenv`.
- Boilerplate React Native 0.86 (TypeScript, React Navigation, motyw jasny/ciemny).
- Ekrany demonstracyjne: Home, Details.
- Komponenty: `Button`, `Screen`.
- Testy Jest, ESLint, alias importów `@/`.

## [0.0.1] — 2026-07-03

### Added
- Inicjalizacja projektu Voice App — lokalne przetwarzanie plików audio (faza boilerplate).

[Unreleased]: https://github.com/your-org/voice-app/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/your-org/voice-app/releases/tag/v0.0.1
