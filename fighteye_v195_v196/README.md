# FightEye v195–v196

Combined release containing the existing FightEye application plus two new phases.

## v195 — AI & Analytics Platform

- Athlete-specific analytics dashboard
- Explainable event-fit scoring
- Competition shortlist
- Form-confidence summary
- Season and goal planning
- Downloadable analytics report
- `/.netlify/functions/analytics` recommendation endpoint

The included recommendation engine is deterministic, transparent and usable without an external AI subscription. It does not claim guaranteed fight or medal outcomes.

## v196 — Production & DevOps

- Production diagnostics dashboard
- Release-gate browser checks
- API and metrics health checks
- Cache recovery controls
- Exportable diagnostics
- `/.netlify/functions/metrics` endpoint
- GitHub Actions QA workflow
- Local smoke-test and syntax-check commands

## Local checks

```bash
npm test
npm run check
```

## Deployment

The project root can be deployed directly to Netlify. `netlify.toml` publishes the current directory and deploys functions from `netlify/functions`.

External source synchronisation, generative AI, real-time notifications, authentication and remote persistence require separately configured provider credentials and services.
