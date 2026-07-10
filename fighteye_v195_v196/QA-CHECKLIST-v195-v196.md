# FightEye v195–v196 QA Checklist

## v195 — AI & Analytics Platform
- [x] Athlete selector updates analytics state
- [x] Goal selector persists locally
- [x] Explainable event-fit scoring is deterministic
- [x] Competition shortlist uses valid event records
- [x] Analytics report exports as JSON
- [x] Analytics Netlify Function returns ranked recommendations
- [x] Output is labelled as guidance rather than a guaranteed prediction

## v196 — Production & DevOps
- [x] Production diagnostics screen added
- [x] Release-gate checks added
- [x] Metrics endpoint added
- [x] API/metrics combined health action added
- [x] Cache-clear control added
- [x] Diagnostics export added
- [x] GitHub Actions QA workflow included
- [x] npm test and npm run check scripts included

## Automated checks completed
- [x] Front-end JavaScript syntax
- [x] All Netlify Function syntax
- [x] Event JSON parsing
- [x] Manifest JSON parsing
- [x] Required event fields
- [x] Unique event IDs
- [x] HTML referenced-file check
- [x] Health endpoint invocation
- [x] Metrics endpoint invocation
- [x] Analytics endpoint invocation
- [x] Service-worker cache version updated
- [x] ZIP integrity

## Deployment notes
The analytics engine is deterministic and works without external AI credentials. Live generative-AI responses, provider imports, push notifications and a remote production database still require external services and credentials.
