# Contributing to JobMail

Thank you for helping improve JobMail. Small, focused pull requests are easier to review and deploy safely.

## Development flow

1. Fork or clone the repository.
2. Create a focused branch from `main`:

   ```bash
   git switch -c feat/short-description
   ```

3. Make the smallest change that solves the problem.
4. Run the validation commands listed in [TESTING.md](./TESTING.md).
5. Commit using the required format.
6. Push the branch and open a pull request against `main`.

## Commit messages

Use an imperative subject of no more than approximately 72 characters:

```text
<type>: <short description in imperative mood>
```

Supported types are `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, and `security`.

Examples:

```text
feat: add role-targeted email templates
fix: protect scheduled email ownership checks
docs: update deployment instructions
```

The repository's expected commit author is `ChamathDilshanC`. Do not add AI attribution trailers.

## Pull requests

Please include:

- what changed and why;
- screenshots or a short manual test description for UI changes;
- migration or environment-variable notes, if applicable;
- confirmation that no secrets, `.env` files, keys, or tokens are staged.

CI runs `npm ci`, `npm run build`, and `npx tsc --noEmit`. Vercel creates a preview for pull requests and deploys `main` after merge.

## Security and sensitive data

Never commit `.env` files, OAuth secrets, encryption keys, database connection strings, access tokens, or real user data. Use `.env.local.example` as the safe configuration reference. For security issues, follow [SECURITY.md](./SECURITY.md) instead of opening a public issue.

## Submodules

If a submodule is ever introduced, push the submodule commit before bumping its pointer in this repository.
