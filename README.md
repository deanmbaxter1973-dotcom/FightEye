# FightEye

FightEye Enterprise 14.0 is a mobile-first fight operations app for athletes, coaches, clubs and competition days.

## Current application

The deployable application is in [`fighteye_enterprise_14_0`](./fighteye_enterprise_14_0). Older folders are retained as release history.

## Netlify

The root `netlify.toml` selects the current application automatically. Connect this repository to Netlify and deploy the `main` branch; no manual publish directory is required.

- Build: `npm run build:netlify`
- Runtime: Node.js 22.13
- Framework: Next.js App Router
- PWA: installable on iPhone and supported browsers
