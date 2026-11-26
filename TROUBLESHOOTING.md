# Troubleshooting

## Google sign-in does not load

- Confirm `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is present in the environment used by the running app.
- Check that the current local or production origin is listed in the Google OAuth client settings.
- Confirm the Gmail API is enabled and the OAuth consent screen includes the required scopes.
- Restart the dev server after changing `.env.local`.

## Scheduled email fails or remains pending

- Confirm `GOOGLE_CLIENT_SECRET` and `TOKEN_ENCRYPTION_KEY` are configured in Vercel.
- Confirm `CRON_SECRET` is identical in Vercel and GitHub Actions repository secrets.
- Check the `scheduled-email-cron.yml` run history and the Vercel function logs.
- A user must have completed the Google auth-code flow so a refresh token is stored.
- GitHub scheduled workflows are best-effort and may be delayed.

## Resume data is missing

- Check that the correct Google user is signed in.
- Confirm the selected `profileId` and default-profile state.
- Check `MONGODB_URI` and database connectivity.
- Use the Profile export before deleting or clearing data.

## AI parsing or generation is unavailable

- Confirm `GEMINI_API_KEY` is configured server-side.
- Check the uploaded file type and size.
- Inspect the API response for upstream quota or model errors; do not expose the API key in client code or issue reports.

## Job URL auto-fill fails

- Use a publicly reachable HTTP/HTTPS job page.
- Greenhouse, Lever, Workday-style boards, and pages with JSON-LD metadata work best.
- Login-only, blocked, private-network, and JavaScript-only pages may not expose parseable details.
- The SSRF guard intentionally rejects loopback, private, and link-local destinations.

## Template skills look wrong

- Open Customize for the exact template and profile.
- Remember that template overrides are browser-local and isolated from `Your Information`.
- Use **Reset to Profile Skills** to remove that template's override.
- If testing with a fresh account/profile, clear the corresponding browser local-storage data and reload.

## Production deploy appears stale

- Check the Vercel deployment associated with the latest `main` commit.
- Confirm the `main CI` workflow passed.
- Reload without an old browser cache and check the response headers for the current deployment.
