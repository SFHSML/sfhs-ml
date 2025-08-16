# SFHS Machine Learning Club — Website

A lightweight static site you can deploy in minutes.

## Quick Start
1. Download the ZIP and unzip it.
2. Open `index.html` locally to preview.
3. Deploy:
   - **GitHub Pages** (free): create a repo, upload files, Settings → Pages → Source = main branch → Save. Your site will be live at `https://<your-username>.github.io/<repo>/`.
   - **Netlify/Vercel**: drag-and-drop the folder onto their dashboard.

## Customize
- Change the meeting rule in `script.js`:
  ```js
  const MEETING_RULE = { which: 'first', weekday: 4 }; // Thursday (0=Sun..6=Sat)
  ```
  Options for `which`: `first`, `second`, `third`, `fourth`, `last`.

- Update officer names/photos in the Officers section of `index.html`.
- Update location/time in `script.js` (`MEETING_TIME`, `MEETING_LOCATION`).

## Notes
- The Join form is demo-only (stores entries in localStorage). Hook it up to Google Forms or a simple serverless function for real signups.
