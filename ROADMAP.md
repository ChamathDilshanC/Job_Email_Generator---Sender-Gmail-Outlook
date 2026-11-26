# Roadmap

This is a planning document, not a promise of delivery dates. Priorities may change based on user feedback and operational needs.

## Near term

- Add focused unit tests for template generation, template-skill isolation, URL safety checks, and scheduled-email state transitions.
- Add browser-level smoke coverage for the send flow, theme toggle, preview modal, and resume-profile switching.
- Improve API identity handling so user ownership is derived consistently from a verified server-side session rather than client-supplied identifiers.
- Add a lightweight health/observability endpoint for database, OAuth, Gemini, and scheduled-email dependencies.

## Product improvements

- Add export/import of template-specific skill preferences across devices.
- Add richer template search, tags, and saved template filters.
- Support more outbound providers and transactional delivery options beyond Gmail and Outlook.
- Add user-configurable retention controls for email history, tracking data, CV files, and generated cover letters.

## Quality and operations

- Add accessibility audits and keyboard-navigation coverage to the CI pipeline.
- Add performance budgets for JavaScript bundle size, preview rendering, and resume upload/parse flows.
- Document and automate database index verification and backup/restore drills.
