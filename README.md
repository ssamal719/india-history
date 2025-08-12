State-wise Today in History - GitHub Pages Package
=================================================

Files included:
- index.html
- style.css
- script.js
- events.json (sample dataset - one event per state/UT)
- README.md (this file)

How to use:
1. Create a new GitHub repository (public) and upload these files to the root.
2. In repo Settings -> Pages, set Source to 'main' branch and root folder, save.
3. After a minute, your site will be available at: https://<your-github-username>.github.io/<repo-name>/

Notes:
- Language translations:
  - If you add a Google Translate API key to script.js (GOOGLE_TRANSLATE_KEY), translations will use the official API.
  - If left empty, the script falls back to the unofficial translate.googleapis.com endpoint (may be rate-limited).
- To add manual translations, extend events.json entries with translations per language.
- For production: move translation to server side, add scheduling, and connect to WordPress for monetization.

If you want, I can push this to a GitHub repo for you or guide you step-by-step while you upload.