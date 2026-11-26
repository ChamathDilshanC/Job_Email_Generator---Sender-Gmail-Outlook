# Security Policy

## Reporting a vulnerability

Please report security issues privately to **dilshancolonne123@gmail.com**. Include:

- a clear description of the issue;
- affected route, component, or deployment;
- reproducible steps or a minimal proof of concept;
- potential impact and any suggested mitigation.

Do not include real OAuth tokens, database credentials, resume files, or other personal data in a report. Redact them or use synthetic values.

## Security model

- Google sign-in uses the OAuth authorization-code flow.
- Google refresh tokens are encrypted with AES-256-GCM before being stored in MongoDB.
- Refresh tokens are not returned to browser code.
- The scheduled-email endpoint requires `Authorization: Bearer <CRON_SECRET>`.
- Job-posting URL fetching rejects loopback, private, link-local, and other unsafe destinations before making the request.
- Tracking pixels return the same 1×1 response even when a tracking ID is unknown, avoiding ID enumeration.
- Account deletion removes resume profiles, tagged CV files, and email history owned by the account.

## Deployment hygiene

Keep secrets only in local environment files or the Vercel/GitHub secret stores. Before opening a pull request, check the staged file list and verify that no `.env`, key, token, or private export is included.

## Supported versions

The `main` branch and the current production deployment are the supported versions. Older tags may not contain current security fixes; upgrade before reporting an issue against an old release.
