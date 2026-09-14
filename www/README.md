# www — Negant site (negant.pl)

Static marketing site for the **Negant** studio: app list, legal documents, and contact.

## Structure

```
www/
├── index.html                 # Landing — app list
├── css/styles.css
├── js/main.js
├── assets/images/             # Hero, illustrations, logo
└── apps/
    └── voice-app/
        ├── privacy.html       # Privacy policy
        ├── terms.html         # Terms of use
        └── contact.html       # Contact / support
```

All public copy is in **English**.

## Local preview

From the repo root:

```sh
npx --yes serve www -p 4173
```

Or open `www/index.html` directly in a browser.

## Hosting on negant.pl

Upload the contents of `www/` to the domain root (or a subdirectory). Target Voice App URLs:

- `https://negant.pl/`
- `https://negant.pl/apps/voice-app/privacy.html`
- `https://negant.pl/apps/voice-app/terms.html`
- `https://negant.pl/apps/voice-app/contact.html`

## Adding another app

1. Copy `apps/voice-app/` → `apps/<slug>/`.
2. Fill in privacy / terms / contact copy.
3. Add an `.app-block` on `index.html` (top to bottom order).
4. Place artwork in `assets/images/`.
