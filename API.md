# API Reference

All paths are relative to the deployed application URL. User-owned resume and CV routes require the signed-in Google access token and scope database queries to the token's subject; `userId` is retained only as a matching request field for compatibility. The cron route uses a bearer secret. DevResume connection status uses the server-side signed-in user context.

## Authentication

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/auth/google/exchange` | POST | Exchange a Google authorization code, store the encrypted refresh token, and return an access token. Body: `{ code }`. |
| `/api/auth/google/status?userId=...` | GET | Check whether a user has a stored refresh token. |
| `/api/auth/google/refresh` | POST | Mint a valid access token from stored credentials. Body: `{ userId }`. |

## Resume and CV

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/resume` | GET | Load the default profile, a profile by `profileId`, or all profiles with `?list=true`; requires Google bearer authentication. |
| `/api/resume` | POST | Create or update an authenticated user's profile. Body includes profile data, optional `profileId`, `profileName`, and `isDefault`. |
| `/api/resume` | DELETE | Delete one authenticated user's profile with `profileId`, or all profiles when no `profileId` is supplied. Tagged CV files are deleted with the profile. |
| `/api/resume/cv` | GET | Load CV metadata or data for the authenticated user's `profileId`; use `meta=true` to omit the base64 file data. |
| `/api/resume/cv` | POST | Store or replace a tagged CV for the authenticated user. Body: `profileId`, `fileName`, `mimeType`, and base64 `data`. |
| `/api/resume/cv` | DELETE | Delete a tagged CV for the authenticated user's `profileId`. |
| `/api/resume/parse` | POST | Parse a PDF, DOC, or DOCX resume. Body: `fileName`, `mimeType`, and base64 `data`. Returns `{ success, resumeData }`. |

## Email generation and delivery

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/email/generate` | POST | Generate an AI email from a stored resume profile. Body: `userId`, `profileId`, `companyName`, `position`, `jobDescription`, optional `tone`, and `length`. |
| `/api/send-email` | POST | Send through Gmail. Body includes `to`, `subject`, `body`, optional HTML/attachments, and a valid `accessToken`. |
| `/api/job-url/parse` | POST | Safely fetch and parse a job page. Body: `{ url }`. Returns extracted company, position, description, and source details when available. |
| `/api/track/[trackingId]` | GET | Record an email open and return a 1×1 tracking response. The response is intentionally non-enumerating. |

## Scheduled email delivery

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/scheduled-emails` | GET | List a user's scheduled messages or load one with `id`; requires `userId`. |
| `/api/scheduled-emails` | POST | Create a pending message. Required fields: `userId`, `to`, `subject`, `bodyHtml`, and `scheduledFor`; optional attachments and tracking metadata are supported. |
| `/api/scheduled-emails` | PATCH | Update a pending message by `id` + `userId`, including scheduled time or cancellation state. |
| `/api/scheduled-emails` | DELETE | Delete a scheduled message by `id` + `userId`. |
| `/api/cron/process-scheduled-emails` | GET | Process due messages. Requires `Authorization: Bearer <CRON_SECRET>`. |

## Email history and cover letters

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/email-history` | GET | List history, return stats with `stats=true`, or load full HTML with `bodyFor=<emailId>`. Supports `limit` and `offset`. |
| `/api/email-history` | POST | Save a sent/pending/failed email history entry. Body contains `userId` and the email metadata. |
| `/api/email-history` | PATCH | Update `applicationStatus` for an `emailId`; the current handler accepts `emailId` and the status payload. |
| `/api/email-history` | DELETE | Delete one history entry with `userId` + `emailId`, or multiple entries with a JSON body containing `userId` and `emailIds`. The response includes `deletedCount`. |
| `/api/cover-letter` | GET | List saved cover letters for `userId`, optionally filtered by `profileId` or `query`. |
| `/api/cover-letter` | POST | Save a cover letter. Requires `userId`, `profileId`, `companyName`, `position`, and `content`. |
| `/api/cover-letter` | DELETE | Delete a saved cover letter by `userId` + `id`. |
| `/api/cover-letter/generate` | POST | Generate a cover letter from a stored profile and job details. |

## Integrations and lookups

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/integrations/devresume/connect` | POST | Verify a DevResume connection code and create a one-to-one link for the signed-in user. |
| `/api/integrations/devresume/status?devresumeAccountId=...` | GET | Read the current DevResume connection status. |
| `/api/integrations/devresume/status?devresumeAccountId=...` | DELETE | Disconnect the linked DevResume account. |
| `/api/integrations/devresume/resume` | GET | Proxy the latest DevResume PDF for the authenticated, linked JobMail account. |
| `/api/integrations/devresume/generate` | POST | Start a one-off tailored DevResume PDF generation from `{ targetRole, targetCompany, jobDescription }`. |
| `/api/integrations/devresume/generate?requestId=...` | GET | Poll a tailored PDF job; returns progress or the validated base64 PDF when ready. |
| `/api/github/repos?username=...` | GET | Load public GitHub repositories for project import. |
| `/api/universities/search?name=...&country=...` | GET | Proxy university lookup results. `name` is required; `country` is optional. |

## Error conventions

Errors are JSON objects with an `error` string and an HTTP status. Common statuses are `400` for invalid input, `401` for missing identity/credentials, `404` for missing records, `409` for integration conflicts, `502` for upstream integration failures, and `500` for unexpected server errors.

## Limits and notes

- AI job descriptions are limited to 30,000 characters by the email-generation route.
- Cover-letter text is bounded by the route's maximum text size.
- CV data is stored separately from the resume profile to avoid loading large base64 blobs with normal profile reads.
- DevResume generation is server-to-server only: the linked account, shared secret, request ID, input lengths, PDF MIME type, and 5MB artifact limit are validated on both sides. Tailored artifacts are short-lived and do not overwrite the canonical DevResume resume.
- The browser calls the external skills service through `lib/skillsApiClient.ts`; JobMail does not expose a local skills route.
