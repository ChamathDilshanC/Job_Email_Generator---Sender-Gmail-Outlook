# Deployment Guide

## Production topology

- **Web host:** Vercel, connected to the GitHub repository.
- **Database:** MongoDB-compatible storage, currently Azure Cosmos DB for MongoDB.
- **Scheduled delivery trigger:** GitHub Actions every five minutes.
- **Email provider:** Gmail API for direct/background sending; Outlook uses a mailto flow from the client.
- **Production URL:** [https://www.jobemail.me](https://www.jobemail.me).

## Vercel setup

1. Import the repository into Vercel.
2. Set the production environment variables listed in [`.env.local.example`](./.env.local.example) and [README.md](./README.md).
3. Configure the production domain and make sure `APP_BASE_URL` has no trailing slash.
4. Deploy the `main` branch.
5. Verify the home page, Google sign-in, resume load, email preview, and a non-production send path before changing traffic.

Vercel automatically creates preview deployments for pull requests and production deployments after a merge to `main`.

## Required environment configuration

Required server-side values include `GOOGLE_CLIENT_SECRET`, `TOKEN_ENCRYPTION_KEY`, `CRON_SECRET`, `APP_BASE_URL`, `MONGODB_URI`, and `GEMINI_API_KEY` for AI parsing. Google sign-in also needs `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. The skills and DevResume integrations need their corresponding API/base URL and shared-secret values. For the tailored-CV bridge, configure the matching integration secret in JobMail and DevResume Admin; keep the DevResume GitHub token only in DevResume Admin.

Never commit these values. Configure them in Vercel Project Settings → Environment Variables.

## GitHub Actions

### CI

`.github/workflows/ci.yml` runs for pushes and pull requests targeting `main`:

```text
npm ci
npm run build
npx tsc --noEmit
```

The build job uses placeholder values only. Production secrets remain in Vercel.

### Scheduled email trigger

`.github/workflows/scheduled-email-cron.yml` runs every five minutes and calls:

```text
GET https://www.jobemail.me/api/cron/process-scheduled-emails
Authorization: Bearer <CRON_SECRET>
```

The GitHub repository secret `CRON_SECRET` must match the Vercel environment variable exactly. The GitHub schedule is best-effort and may run a few minutes late.

### Tailored DevResume CV bridge

The **Generate DevResume CV** action in Send Email requires an existing
one-to-one DevResume connection. JobMail sends the authenticated user's role,
company, and available job description to DevResume Admin, then polls the
request until a validated PDF artifact is ready.

- JobMail: `DEVRESUME_RESUME_ENDPOINT`, `JOBMAIL_INTEGRATION_SECRET`, and
  `DEVRESUME_APP_URL`.
- DevResume Admin: the same `JOBMAIL_INTEGRATION_SECRET` and a server-only
  `JOBMAIL_GITHUB_TOKEN` with the minimum permissions needed to dispatch and
  download the `resume-core` workflow artifact.
- Resume Core: `RESUME_DATA_PAT` and the existing workflow secrets required by
  the PDF renderer. The tailored workflow creates a private copy and does not
  overwrite `resume-data` or the canonical Drive PDF.

The browser never receives the shared secret or GitHub token. See
[`docs/devresume-tailored-cv.md`](./docs/devresume-tailored-cv.md) for the
request lifecycle, limits, and rollback considerations.

### Releases

Push a semantic version tag to create a GitHub Release:

```bash
git tag v1.5.3
git push origin v1.5.3
```

The release workflow generates release notes. Vercel deployment is handled independently by the GitHub integration.

## Post-deploy checks

```bash
curl -I https://www.jobemail.me
gh run list --branch main --limit 3
```

Confirm HTTP 200, a successful Vercel deployment, and a passing `main CI` run. Then perform the manual smoke checks in [TESTING.md](./TESTING.md).

## Rollback

Use the Vercel deployment history to promote the last known-good deployment, then investigate and fix the source branch. Do not rewrite `main` history or delete production data as a first response.
