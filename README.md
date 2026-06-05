# Feature Voting Board

A full-stack feature voting board built with Django + Django REST Framework (backend) and React 19 + TypeScript (frontend). Team members can sign in, propose feature ideas, and vote on the ones they support.

## Prerequisites

- Python 3.9+
- Node.js 18+
- pip

## Backend Setup

From the project root:

```bash
# Create and activate a virtual environment
python3 -m venv env
source env/bin/activate          # Windows: env\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Create your .env (a SECRET_KEY is required; SQLite defaults work otherwise)
cp .env.example .env
# then set SECRET_KEY in .env to any non-empty value for local dev

# Run database migrations
python3 manage.py migrate

# Seed demo users and sample ideas
python3 manage.py seed

# Start the Django dev server (defaults to port 8000)
python3 manage.py runserver
```

**Seeded users:**

| Username    | Password   |
| ----------- | ---------- |
| `demo_user` | `demo1234` |
| `team_lead` | `lead1234` |
| `alice`     | `pass1234` |
| `bob`       | `pass1234` |

## Frontend Setup

In a second terminal:

```bash
cd dot-vote-ui

# Install Node dependencies
npm install

# Start the Vite dev server (http://localhost:5173)
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:8000` (see `dot-vote-ui/vite.config.ts`), so the frontend and backend share an origin in development. `django-cors-headers` is also configured to allow `http://localhost:5173` as a fallback.

## Running the App

1. Start the Django server (venv active, from the project root): `python3 manage.py runserver`
2. Start the Vite server (from `dot-vote-ui/`): `npm run dev`
3. Open [http://localhost:5173](http://localhost:5173)
4. Sign in with `demo_user` / `demo1234` (or any seeded user above)

> **Fresh start:** to reset, delete `db.sqlite3`, then re-run `migrate` and `seed`.

## Running Tests

```bash
python3 manage.py test board
```

This runs the single focused test that verifies the one-vote-per-user rule.

## Database

SQLite is used by default — no setup required. To use **PostgreSQL**, set the following in `.env` before running migrations:

```bash
DB_ENGINE=postgresql
DB_NAME=dot_vote
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
```

(`psycopg2-binary` is already in `requirements.txt`.)

## Environment Variables

Configured via `.env` (loaded by `python-dotenv`). See `.env.example`.

| Variable        | Default                 | Description                                    |
| --------------- | ----------------------- | ---------------------------------------------- |
| `SECRET_KEY`    | _(required)_            | Django secret key — must be set                |
| `DEBUG`         | `True`                  | Set to `False` in production                   |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1`   | Comma-separated allowed hosts                  |
| `DB_ENGINE`     | `sqlite`                | Set to `postgresql` to use Postgres            |
| `DB_NAME` … `DB_PORT` | see above         | Postgres connection settings (when applicable) |

## API Endpoints

| Method   | Path                                 | Auth | Description                              |
| -------- | ------------------------------------ | ---- | --------------------------------------- |
| `POST`   | `/api/auth/login/`                   | No   | Sign in; returns JWT access/refresh + username |
| `GET`    | `/api/ideas/?sort=popular\|newest`   | No   | List ideas with vote counts             |
| `POST`   | `/api/ideas/`                        | Yes  | Create a new idea (title + description)  |
| `POST`   | `/api/ideas/<id>/vote/`              | Yes  | Cast a vote (idempotent)                |
| `DELETE` | `/api/ideas/<id>/vote/`             | Yes  | Remove a vote                           |

## Features

### Core

- **Idea board:** view, create, and sort ideas by popularity or newest
- **Voting:** cast and remove votes — one vote per user per idea, enforced at the database and application levels
- **JWT authentication:** token-based auth; the board is publicly viewable while all write actions require sign-in. 401 responses clear the stored session client-side.

### Bonus: Optimistic Voting UX

Clicking vote/unvote updates the count and button state instantly, then reconciles with the authoritative server response. On failure the UI reverts to the previous state and surfaces the error inline.

> **Note on scope:** the brief asks for exactly one bonus; optimistic voting is that bonus. The UI also includes a small "Shipped" status display and a light/dark theme toggle that were built alongside the design system — see SOLUTION.md for an honest note on this.
