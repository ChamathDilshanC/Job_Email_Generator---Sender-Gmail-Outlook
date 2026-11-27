# Tailored DevResume CV flow

## User flow

1. Connect DevResume from **Profile → Connect DevResume**.
2. Open **Send Email** and provide **Company Name** and **Position**.
3. Click **Generate DevResume CV** in the CV source panel.
4. Follow the live progress slider while the isolated resume workflow runs.
5. JobMail attaches the returned PDF to the current email; the existing send,
   schedule, and history flow remains unchanged.

## Request lifecycle

```text
Browser
  -> JobMail POST /api/integrations/devresume/generate
  -> DevResume Admin POST /api/integrations/jobmail/resume/generate
  -> resume-core workflow_dispatch
  -> private resume-data copy + temporary role/company overlay
  -> Puppeteer PDF + one-day GitHub Actions artifact
  -> DevResume Admin validates and downloads the PDF
  -> JobMail polls and returns the PDF to the browser
  -> Send Email attaches it for this application
```

The workflow uses the connected DevResume account and the current application
context. It does not commit the target role, company, or job description to
`resume-data`, overwrite the canonical Drive PDF, or change the user's default
resume.

## Configuration

- **JobMail:** `DEVRESUME_APP_URL`, `DEVRESUME_RESUME_ENDPOINT`, and
  `JOBMAIL_INTEGRATION_SECRET`.
- **DevResume Admin:** the same `JOBMAIL_INTEGRATION_SECRET` plus a server-only
  `JOBMAIL_GITHUB_TOKEN` with minimum Actions/artifact permissions.
- **Resume Core:** the existing `RESUME_DATA_PAT` and PDF-rendering secrets.

Never place the shared secret, GitHub token, or private resume data in a
`NEXT_PUBLIC_*` variable or client-side bundle.

## Security and limits

- Google bearer authentication is required for JobMail resume/CV/integration
  routes, and client-supplied IDs must match the authenticated user.
- The DevResume link is one-to-one and is checked before every generation.
- Request IDs are UUIDs; role, company, and job-description inputs are bounded.
- The returned file must be a PDF and is capped at 5 MB before attachment.
- GitHub Actions artifacts are short-lived and the temporary overlay is
  discarded after the workflow run.
