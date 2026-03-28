# Habit Tracker

A mobile-first habit tracker built with SvelteKit, TypeScript, Tailwind CSS, and localStorage persistence.

## Features

- Today view with daily summary and habit checklist
- Add, edit, and delete habits
- Daily, weekdays, and custom day schedules
- Streak tracking and completion history
- Stats page with weekly progress and habit analytics
- Mobile bottom navigation
- Light and dark theme toggle

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Optional validation:

```bash
npm run check
npm run build
```

4. Open the app shown by Vite, usually:

```text
http://localhost:5173
```

## Project structure

- `src/routes/+page.svelte` for the Today view
- `src/routes/stats/+page.svelte` for stats
- `src/lib/components/` for reusable UI pieces
- `src/lib/stores/` for persistence and theme state
- `src/lib/utils/` for date, streak, and storage helpers

## Notes

- Data is stored in `localStorage`, so it persists across refreshes in the browser.
- The app is client-rendered to keep the local storage flow simple and reliable.
