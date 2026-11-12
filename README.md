# Sai Srikiran J — Portfolio

An interactive portfolio: a tunable dial intro, a scroll-flown WebGL corridor of projects,
a list-and-preview "Work" module, a case-study strip, academic and credential timelines,
and a footer wordmark. Built with React 19, TypeScript and Vite. The sound is synthesised
with the Web Audio API (no audio files), and the artwork is generated on canvas.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

Pushing to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`.

## Structure

- `data.ts`, `lib/stories.ts` — all portfolio content (projects, ventures, education, credentials, case studies)
- `components/` — sections and UI (hero dial + corridor, work, telemetry, about, origins, contact, footer)
- `lib/` — WebGL corridor, audio engine, smooth scroll, canvas art, preview stage
- `styles/site.css` — the design system
