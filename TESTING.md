# Testing Guide

## Automated validation

Run the same checks used by CI:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`next build` should run before the standalone TypeScript command because it generates Next.js ambient types in a clean checkout.

For focused lint feedback:

```bash
npm run lint
```

The repository does not currently define a Jest, Vitest, or Playwright script. Feature validation therefore combines the production build/type check with the manual smoke checks below.

## Manual smoke checklist

### Authentication and profile

- Sign in and sign out successfully.
- Load `Your Information` and confirm profile data persists after refresh.
- Create, rename, switch, and delete a non-default resume profile.
- Upload a CV and confirm the tagged file appears for the selected profile.

### Email generation

- Enter company, role, and recipient details.
- Select a standard and a role-targeted template.
- Preview with resume data and confirm all selected template skills are present.
- Add/remove template skills and confirm the change does not modify `Your Information` skills.
- Use **Reset to Profile Skills** and confirm only that template falls back to the profile skills.
- Open the send preview, verify the larger viewport, and check the attachment notice.
- Toggle light/dark mode and confirm the color change is immediate.

### Sending and scheduling

- Send a test message through Gmail with a non-sensitive recipient.
- Verify attachment names and the generated subject/body.
- Test Outlook mailto fallback without sending real personal data.
- Schedule a test message, confirm it appears as pending, and cancel it before delivery.

### History and integrations

- Confirm a sent message appears in History and can update application status.
- Confirm open tracking updates when enabled.
- Test DevResume connect/disconnect with a test account or mocked code.
- Verify job URL parsing rejects private/loopback destinations.

## Regression evidence

For UI changes, include the affected route and a screenshot or short manual verification note in the pull request. For API changes, include request method, required fields, expected status, and a safe example response.
