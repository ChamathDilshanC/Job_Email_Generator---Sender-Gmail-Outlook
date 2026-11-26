# Development Guide

## Prerequisites

- Node.js 20 recommended (CI uses Node.js 20).
- npm.
- A MongoDB-compatible database for server routes.
- Google OAuth credentials with the Gmail API enabled.
- Gemini API access for resume parsing and AI generation.

## Setup

```bash
git clone https://github.com/ChamathDilshanC/Job_Email_Generator---Sender-Gmail-Outlook.git
cd Job_Email_Generator---Sender-Gmail-Outlook
npm ci
```

Copy the safe environment template:

```bash
# macOS/Linux
cp .env.local.example .env.local

# PowerShell
Copy-Item .env.local.example .env.local
```

Fill in local values without committing the file. See [README.md](./README.md) for the variable table.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The client application uses the Next.js rewrite/middleware shell, so feature paths such as `/send-email` and `/your-information` are handled by the root app entry point.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Compile, lint, type-check, and generate a production build. |
| `npm start` | Serve the last successful production build. |
| `npm run lint` | Run Next.js ESLint checks independently. |
| `npx tsc --noEmit` | Run the TypeScript compiler without emitting files. |

## Working on features

- Keep server-only secrets and Google/Gemini calls in API routes or server utilities.
- Use `ResumeData` and the service types instead of duplicating profile shapes.
- Keep template skill overrides in `templateSkillsService.ts`; do not write template customizations into the main resume profile.
- Generated email HTML must remain safe to render in the preview and compatible with Gmail/Outlook clients.
- Add or update documentation when a route, environment variable, data collection, or deployment behavior changes.

## Local data and cleanup

Browser-only preferences such as selected templates and template skill overrides are stored in local storage. Clear the relevant local-storage keys when testing a fresh profile. Do not clear shared MongoDB data from a production connection while debugging locally.
