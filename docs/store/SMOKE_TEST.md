# Android release smoke test (Internal testing)

Install the Internal testing build (not debug). `DEBUG_MODE=false`, API = `https://api.ukrywane.pl`.

1. Cold start → launcher → Home; no developer section in Settings.
2. Device ID visible in Settings → About; survives force-stop (Keystore).
3. Import short audio → Basic effect → play → export.
4. Record with mic → Advanced effect.
5. Airplane mode → AI disabled with alert; Basic still works.
6. Online → AI effect spends credits (balance drops before processing).
7. Credits screen → Buy Premium → Play Billing sheet → Premium + pack credits.
8. Restore / relaunch → Premium still active after sync.
9. Update status row loads (not stuck on “Checking…” when API up).
10. Privacy policy link opens https://ukrywane.pl/privacy.

Capture screenshots for listing during steps 3, 6, 7, Settings.
