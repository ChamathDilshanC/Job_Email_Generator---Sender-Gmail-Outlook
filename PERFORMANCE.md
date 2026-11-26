# Performance Guide

## Current design choices

- Next.js production builds split the application into route chunks.
- Resume CV blobs are stored in `resume_cv_files`, separate from the normal resume profile document.
- History list requests omit full HTML bodies; the body is loaded only when a user opens an entry.
- Scheduled-email list requests omit large body and attachment payloads.
- MongoDB indexes are created for common user, status, date, tracking, and profile lookups.
- Browser local storage keeps template-specific skill overrides out of the main profile request path.
- The theme provider disables CSS transitions during theme changes so light/dark switching is immediate.

## Measurement

Use a production build when measuring runtime performance:

```bash
npm run build
npm start
```

Measure the signed-out landing page and the signed-in Send Email, Resume Builder, and History routes separately. Include cold-load and warm-cache observations.

## Optimization guidance

- Keep large documents and base64 files out of list responses.
- Add pagination before increasing history or scheduled-email list limits.
- Avoid sending full resume/CV payloads through client components when a metadata-only request is sufficient.
- Keep template HTML generation deterministic and escape user-provided values before rendering into HTML.
- Prefer memoization or lazy loading for expensive editors, PDF generation, and large galleries.
- Re-check production bundle output after adding a large dependency.

## Performance budgets to introduce

The project does not yet enforce numeric budgets in CI. A future performance check should track JavaScript transfer size, landing-page LCP, Send Email preview render time, resume upload/parse time, and History list response size.
