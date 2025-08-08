# Security Policy

- Report vulnerabilities via email: security@blacktop-blackout.local
- Do not open public issues for vulnerabilities.
- We will acknowledge and triage within 72 hours.

## Best Practices enforced
- Dependencies audited via CI (`npm audit`)
- Modern React and Vite versions
- No secrets committed; use `.env`
- CSP recommended for production reverse proxy

## Authentication notes
See `PROJECT_FIXES_SUMMARY.md` for the current authentication security roadmap.