# AI Flashcards Project Rules

## What we are building
- Language-learning flashcards app.
- User enters a word/phrase in target language.
- AI returns translation + 2 short examples.
- User accepts/regenerates, saves card, then studies with spaced repetition ratings.

## Architecture (simple and strict)
- `src/routes`: route files only (routing, page composition, API handlers wiring).
- `src/features`: business/domain code, reusable across routes.
- `src/shared`: shared primitives/utilities, split by segment (`db`, `lib`, `ui-kit`, etc.).

## Folder conventions
- Feature shape (use only what is needed):
  - `ui/` for feature UI components.
  - `model/` for feature types/contracts.
  - `server/` for feature server logic.
- Shared shape:
  - `shared/db` for Drizzle schema/client.
  - `shared/lib` for generic helpers/env.
  - `shared/ui-kit` for generic reusable UI primitives.

## Dependency direction
- Allowed: `routes -> features -> shared`.
- Allowed: `routes -> shared`.
- Not allowed: `shared -> features` or `shared -> routes`.

## Coding patterns
- Keep routes thin: no business logic in route files.
- Do not overcomplicate feature structure.
- Keep code close to the page by default.
- Promote code into `features` only when it is reused by at least 2 pages/routes.
- Keep server-only code out of client components.
- Prefer typed data contracts for feature boundaries.
- Use Bun scripts for all local workflows.
