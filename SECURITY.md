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
- Resume/profile/CV APIs derive ownership from the verified Google bearer token and reject mismatched client-supplied IDs.
- DevResume generation requires the authenticated JobMail user to have a one-to-one linked DevResume account; upstream calls use a server-only shared secret.
- Tailored generation validates UUID request IDs, bounds role/company/job-description input, polls only the matching request, validates PDF content, and caps the returned artifact at 5 MB.
- Tailored generation runs against an isolated copy of resume data and a short-lived GitHub artifact; it does not commit role-specific data to the canonical resume or expose GitHub credentials to the browser.

## Deployment hygiene

Keep secrets only in local environment files or the Vercel/GitHub secret stores. Before opening a pull request, check the staged file list and verify that no `.env`, key, token, or private export is included.

## Supported versions

The `main` branch and the current production deployment are the supported versions. Older tags may not contain current security fixes; upgrade before reporting an issue against an old release.
