# Database Guide

## Connection

The application uses the MongoDB driver through `lib/mongodb.ts`. The database name is `job_email_generator`. `MONGODB_URI` can point to Azure Cosmos DB for MongoDB, MongoDB Atlas, or another compatible MongoDB deployment.

## Collections

### `resumes`

Stores one document per user/profile. Important fields include `userId`, `profileId`, `profileName`, `isDefault`, `personalInfo`, `socialLinks`, `workExperiences`, `education`, `projects`, `skills`, `createdAt`, and `lastUpdated`.

The API enforces one default profile per user when profile data is saved. Legacy profile migration is handled by the resume route for existing data.

### `resume_cv_files`

Stores the tagged uploaded CV separately from `resumes`:

```text
userId, profileId, fileName, mimeType, data (base64), size, uploadedAt
```

There is a unique compound index on `{ userId: 1, profileId: 1 }`.

### `google_auth_tokens`

Stores the server-side OAuth token record keyed by `userId`. Refresh tokens are encrypted before persistence. Do not read or export this collection as application data.

### `email_history`

Stores sent and failed email records, application status, recipient/company/position metadata, HTML body, tracking ID, open counts, and first/last-open timestamps.

Indexes created by the route:

```text
{ userId: 1, sentDate: -1 }
{ userId: 1, applicationStatus: 1 }
{ userId: 1, status: 1 }
{ trackingId: 1 }
```

### `scheduled_emails`

Stores pending, sent, failed, or cancelled scheduled messages, including `userId`, `scheduledFor`, message body, attachments, tracking metadata, and status.

Indexes:

```text
{ status: 1, scheduledFor: 1 }
{ userId: 1, status: 1 }
```

### `devresume_connections`

Stores the one-to-one link between a JobMail user and a DevResume account. Unique sparse indexing prevents one DevResume account or one JobMail account from being linked multiple times.

### `cover_letters`

Stores saved generated or edited cover letters by user/profile, company, position, content, optional job description, name, template, and timestamps.

## Ownership and deletion

Application queries should include `userId` in filters. Resume, CV, scheduled-email, cover-letter, and most history list queries already use ownership filters. The current email-history PATCH and DELETE handlers accept an email ID without a user filter; treat that as a security-hardening item before exposing those operations outside the trusted application flow. Resume profile deletion removes its tagged CV file. Account deletion removes all resume profiles, CV files, and email history for that user.

## Backups and migrations

No migration framework is currently checked into the repository. Before changing document shapes or indexes:

1. Export or snapshot the affected collections.
2. Make the API tolerant of old and new shapes where practical.
3. Test with a disposable database.
4. Deploy the code before running any destructive migration.
5. Verify counts and representative documents after migration.
