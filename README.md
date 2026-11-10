# FitTrack

A mobile-first web app I use to plan workouts, run them with set and rest timers, and log daily calories and protein.

Live version: https://du0ks.github.io/fitness/ (built and deployed to GitHub Pages by the workflow in `.github/workflows/static.yml`)

## Why I built it

I wanted a single app on my phone that knows my routines, tells me when to start the next set, and keeps a simple calorie/protein count, without signing up for anything.

## What it does

- **Workouts:** create, edit and delete routines. Each exercise has a number of sets, rest between sets and rest after the exercise (in seconds).
- **Exercise mode:** pick a routine and go through it set by set. It counts down rest periods, times each set, and tracks total workout time. When the session ends it is saved to history with total time, time spent in sets and time spent resting.
- **Plan:** a month calendar (weeks start on Monday) with recurring habits. A habit links a workout to either specific weekdays or an "every N days" interval, and has a color. Days with several habits are shown with a color gradient. The last 10 completed workouts are listed below the calendar.
- **Today:** calorie and protein totals for the day with progress bars against targets I can change, plus a history view of past days.

## How it works

- No backend. Workouts, schedule, workout history and nutrition logs are each stored in `localStorage` through the `useLocalStorage` hook from usehooks-ts (`src/hooks`).
- Timers use `Date.now()` timestamps rather than counting interval ticks, so rest countdowns and set times stay correct when the phone throttles or suspends the tab.
- During an active session the runner pushes a history entry and listens for `popstate`, so the phone's back button opens an "are you sure?" dialog instead of leaving the workout.
- The app uses `HashRouter` and a relative Vite `base` so it works from the GitHub Pages subpath.
- vite-plugin-pwa generates the manifest and service worker so it can be installed to the home screen.

## Tech stack

React 19, Vite, React Router, Tailwind CSS 4, Framer Motion, date-fns, lucide-react, usehooks-ts, vite-plugin-pwa.

## Running it

```bash
npm install
npm run dev       # dev server
npm run build     # production build in dist/
npm run preview   # serve the build locally
```

No environment variables are needed.

## Project structure

```
src/
  hooks/        localStorage-backed state: workouts, schedule, history, nutrition
  components/
    workouts/   routine list and editor
    session/    exercise mode (timers, exit confirmation)
    planner/    calendar and habit rules
    nutrition/  daily totals, targets, history
    layout/     bottom navigation
  pages/        route components
```

## Limitations

- Data lives only in the browser's `localStorage`. There is no sync or export, and clearing browser data removes it.
- The PWA manifest references `pwa-192x192.png` and `pwa-512x512.png`, which are not in `public/` yet, so the installed app has no proper icon.
- `use-sound` and `unique-names-generator` are installed but not used yet.
- No tests.
