# Solution Notes

## Architecture

**Backend:** Django + Django REST Framework with JWT authentication via `djangorestframework-simplejwt`. Function-based views (`board/views.py`) with explicit permission decorators per endpoint — chosen over ViewSets/routers because there are only three endpoints and explicit `@permission_classes` reads more clearly at this scale.

**Frontend:** React 19 + TypeScript SPA (Vite) using functional components and hooks (`useState`, `useEffect`, `useMemo`). A single `view` state in `App.tsx` drives what renders, so React Router is omitted for what is effectively a single screen. Components are split per file (`Board`, `IdeaCard`, `NewIdeaForm`, `LoginForm`, `Header`).

**Database:** SQLite by default for zero-setup local dev. PostgreSQL is supported by setting `DB_ENGINE=postgresql` and the `DB_*` variables in `.env`.

## Key Design Decisions

### Authentication

JWT (token-based). Login returns an access and a refresh token; the frontend stores the access token in `localStorage` and attaches it as a `Bearer` header. A shared `request()` wrapper in `api.ts` detects 401 responses, clears the stored session, and reloads so the user is prompted to sign in again.

CSRF middleware stays in the stack to protect the Django admin, but it isn't needed for the token-authenticated API (no cookies are used for API auth).

### Single Vote Enforcement

Enforced at two layers:

1. **Database constraint:** `UniqueConstraint(fields=['idea', 'user'])` on the `Vote` model (`board/models.py`) — duplicates are impossible even under concurrent requests.
2. **Application logic:** the vote endpoint uses `Vote.objects.get_or_create(idea, user)`, which makes voting **idempotent** — voting an already-voted idea returns `200` with the unchanged count rather than an error or a double-count. To stay race-safe, the `get_or_create` call is wrapped in `try/except IntegrityError`: if two concurrent requests slip past the existence check, the DB constraint rejects the second insert and we return `409 Conflict` with the current state instead of a 500.

This rule is the subject of the single automated test (`board/tests.py`), which asserts both that two POSTs leave exactly one vote and that a raw second `Vote.objects.create` raises `IntegrityError`.

### Vote Counts

Stored as a **denormalized `vote_count` integer** on `Idea`, updated atomically with an `F()` expression on each vote/unvote (`Idea.objects.filter(pk=...).update(vote_count=F('vote_count') ± 1)`). 

Trade-off: this keeps list queries cheap (no per-row aggregation) at the cost of having to keep the counter in sync with the `Vote` rows. The `F()` update is atomic at the DB level so it won't lose increments under concurrency. The alternative — computing counts via `annotate(Count('votes'))` on every list query — avoids any drift risk but adds an aggregation to every read. For a board of this size either is fine; I chose the denormalized counter for read performance and accept the small added responsibility of updating it in the one place votes change.

### API Design

RESTful, resource-oriented routes. `GET /api/ideas/` is public so the board loads without sign-in; all writes (create, vote, unvote) require authentication. `POST` and `DELETE` on `/api/ideas/<id>/vote/` share one path with different verbs, avoiding separate `/vote` and `/unvote` endpoints. Sorting is a `?sort=popular|newest` query param.

### Input Validation

- **Title:** trimmed, minimum 3 characters, maximum 255
- **Description:** trimmed, required, maximum 5,000 characters
- Handled in the DRF serializer (`board/serializers.py`) with clear per-field error messages surfaced in the UI.

### Design System

A custom Tailwind v4 theme with a cohesive palette (ink, plum, dusty-blue, viridian, dusty-lavender, hopbush) and hard offset block shadows for a brutalist feel. Votes are visualised as coloured "dots" on each card, matching the product's name.

## Bonus Enhancement: Optimistic Voting UX

The chosen bonus. Clicking vote/unvote updates `vote_count` and `user_has_voted` in React state immediately, then fires the request in the background. The handlers (`Board.tsx`) snapshot the previous state before the optimistic update so they have a clean revert target; on success the server's authoritative count is reconciled, and on failure the snapshot is restored and the error shown inline. The vote button is disabled while a request is in flight to prevent double-submission.

## A Note on Scope (Honest Disclosure)

The brief asks for **exactly one** bonus. Optimistic voting is that bonus. Two additional touches grew out of building the UI and are *not* claimed as bonuses:

- a small **"Shipped" status** display (the `status` field exists on `Idea` and shipped ideas render in a separate section), and
- a **light/dark theme toggle**.

Neither is a fully-featured enhancement (there is no UI to *change* an idea's status, for instance). I'm flagging them openly rather than presenting them as additional bonuses. If a strict single-bonus submission is preferred, the `status` field and theme toggle can be removed without touching the core flow.

## Trade-offs and Limitations

- **Denormalized vote count:** fast reads, but the counter must be kept in sync with `Vote` rows (done in the vote endpoint). A reconciliation job or switching to `annotate(Count(...))` would remove that responsibility.
- **No pagination:** the full idea list is fetched per load. Large datasets would need cursor-based pagination.
- **No refresh-token rotation:** a refresh token is issued but only the access token is used client-side; production would silently refresh before expiry.
- **localStorage tokens:** simple and sufficient here; an httpOnly cookie would harden against XSS in production.
- **SQLite:** great for local dev; not for high-concurrency writes at scale.
- **No real-time updates:** other users' votes appear after a reload; WebSockets or polling would enable live collaboration.
