# Solution Notes

## Architecture

**Backend:** Django + Django REST Framework with JWT authentication via `djangorestframework-simplejwt`. Function-based views with explicit permission decorators per endpoint.

**Frontend:** React 19 SPA using TypeScript, Vite, and Tailwind CSS v4. Functional components with hooks (`useState`, `useEffect`). State-based routing via a single `user` state in `App.tsx` — avoids React Router for what is a single-page interface. Components are split into `src/components/`.

**Database:** SQLite by default for zero-friction local setup. PostgreSQL supported via `DB_ENGINE=postgresql` in `.env`. No hardcoded fallback secrets in source.

## Key Design Decisions

### Authentication

JWT (token-based) with access and refresh tokens returned on login. The frontend stores the access token in `localStorage`. A shared `request()` wrapper in `api.ts` detects 401 responses and automatically clears the session, forcing re-login.

CSRF middleware is kept in the stack (protects Django admin) but not required for token-authenticated API requests.

### Single Vote Enforcement

Enforced at two levels:
1. **Database constraint:** `UniqueConstraint(fields=['idea', 'user'])` — rejects duplicates even under concurrent requests
2. **Application logic:** `Vote.objects.get_or_create()` makes the vote endpoint idempotent — a second POST returns `200 OK` with the current state instead of an error, while the DB constraint guarantees only one vote exists

This is the subject of the automated test (`board/tests.py`), which verifies both the API idempotency and the underlying DB constraint.

### Vote Counts

Stored as a denormalized `vote_count` field on the `Idea` model, updated atomically via Django's `F()` expressions on vote/unvote. This avoids a `COUNT` subquery on every list request while keeping the count accurate through atomic updates. The `UniqueConstraint` on Vote prevents double-counting.

### API Design

RESTful resource-based routes. `GET /api/ideas/` lists ideas (publicly accessible so the board loads without sign-in) and `POST /api/ideas/` creates one (authenticated). `POST` and `DELETE` to `/api/ideas/<id>/vote/` toggle a user's vote using the same path with different HTTP methods.

### Input Validation

- **Title:** minimum 3 characters, whitespace-trimmed, maximum 255
- **Description:** required, whitespace-trimmed, maximum 5,000 characters
- Handled in DRF serializer with clear per-field error messages

### Design System

The frontend uses a custom Tailwind v4 theme with a cohesive color palette (ink, plum, dusty-blue, viridian, dusty-lavender, hopbush). UI elements use hard offset block shadows (inspired by brutalist design) with static and dynamic variants. Dark mode is supported via a `ThemeProvider` context and Tailwind's `@custom-variant dark` directive — card text stays dark for readability on colorful backgrounds while the page chrome adapts.

### Guest Access

The ideas board is visible without signing in — unauthenticated users can browse and sort ideas. Vote/create actions prompt sign-in via a modal overlay. This matches the public `GET /api/ideas/` endpoint and lets reviewers see the board immediately.

## Trade-offs and Limitations

- **No pagination:** The full idea list is fetched on every load. For large datasets this would need cursor-based pagination.
- **No refresh token rotation:** Both tokens are returned on login but only the access token is used client-side. A production app would silently refresh before expiry.
- **No real-time updates:** Other users' votes appear only after a page reload or sort change. WebSockets or polling would enable live collaboration.
- **SQLite default:** The app defaults to SQLite for frictionless local setup. PostgreSQL is supported by setting `DB_ENGINE=postgresql` in `.env`, which better matches production reality and avoids masking concurrency issues.

## Bonus Enhancement: Optimistic Voting UX

Clicking vote or unvote instantly updates the count and toggles the button state — the UI does not wait for the server response.

**How it works:**
1. On click, the idea's `vote_count` and `user_has_voted` are updated in React state immediately
2. The API request fires in the background
3. When the server responds, the count is reconciled with the authoritative value (handles edge cases like concurrent votes)
4. If the request fails (network error), the UI reverts to the previous state and surfaces the error message inline

This is implemented in `Board.tsx` — the vote handlers snapshot the previous state before the optimistic update so they have a clean revert target if needed. The vote button is disabled while the request is in flight to prevent double-submission.
