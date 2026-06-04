# dot-vote

DotVote is a lightweight feature prioritization tool built on the dot-voting project management pattern. Team members propose ideas, cast a single vote per item, and sort by popularity or recency — producing a visual consensus that helps teams align on what to build next.

## Tech Stack

- **Backend:** Python 3.9, Django 4.2, Django REST Framework, SimpleJWT
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4
- **Database:** SQLite (default) or PostgreSQL

## Prerequisites

- Python 3.9+
- Node.js 20+
- PostgreSQL _(optional — only if using `DB_ENGINE=postgresql`)_

## Local Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd dot-vote
```

### 2. Backend

```bash
# Create and activate a virtual environment
python3 -m venv env
source env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and set your SECRET_KEY (see below for generation command)

# Run migrations (uses SQLite by default — no database setup needed)
python3 manage.py migrate

# Seed demo users and sample ideas
python3 manage.py seed

# Start the development server (runs on http://localhost:8000)
python3 manage.py runserver
```

### 3. Frontend

```bash
cd dot-vote-ui

# Install dependencies
npm install

# Start the dev server (runs on http://localhost:5173)
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:8000` automatically. `django-cors-headers` is also configured as a fallback for `http://localhost:5173`.

## Seeded Users

The `seed` management command creates demo users and sample ideas:

| Username | Password |
|---|---|
| `demo_user` | `demo1234` |
| `team_lead` | `lead1234` |
| `alice` | `pass1234` |
| `bob` | `pass1234` |

## Environment Variables

Copy `.env.example` to `.env` and set the following:

| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | Django secret key | — (required) |
| `DB_ENGINE` | `sqlite` or `postgresql` | `sqlite` |
| `DB_NAME` | PostgreSQL database name | `dot_vote` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | _(empty)_ |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |

> The `DB_*` variables (other than `DB_ENGINE`) are only used when `DB_ENGINE=postgresql`.

Generate a secret key:
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login/` | No | Sign in, returns JWT tokens + username |
| `GET` | `/api/ideas/?sort=popular\|newest` | No | List ideas with vote counts |
| `POST` | `/api/ideas/` | Yes | Create a new idea |
| `POST` | `/api/ideas/<id>/vote/` | Yes | Cast a vote |
| `DELETE` | `/api/ideas/<id>/vote/` | Yes | Remove a vote |

## Running Tests

```bash
source env/bin/activate
python3 manage.py test board
```
