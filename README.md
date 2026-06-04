# dot-vote

DotVote is a lightweight feature prioritization tool built on the dot-voting project management pattern. Team members propose ideas, cast a single vote per item, and sort by popularity or recency — producing a real-time visual consensus that helps teams align on what to build next.

## Tech Stack

- **Backend:** Python 3.9, Django 4.2, Django REST Framework
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Database:** PostgreSQL

## Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL (install via `brew install postgresql@16`)

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
# Edit .env and fill in your values (see Environment Variables below)

# Create the database
createdb dot_vote

# Run migrations
python manage.py migrate

# Seed a user
python manage.py seed_user

# Start the development server (runs on http://localhost:8000)
python manage.py runserver
```

### 3. Frontend

```bash
cd dot-vote-ui

# Install dependencies
npm install

# Start the dev server (runs on http://localhost:5173)
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and set the following:

| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | Django secret key | — (required) |
| `DB_NAME` | PostgreSQL database name | `dot_vote` |
| `DB_USER` | PostgreSQL username | your system username |
| `DB_PASSWORD` | PostgreSQL password | _(empty)_ |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |

Generate a secret key:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## Seeded User

The `seed_user` management command creates a default user for local development:

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `password` |

## API

The API runs at `http://localhost:8000/api/`. The frontend dev server proxies `/api` requests to it automatically.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login/` | No | Sign in, returns token |
| `GET` | `/api/ideas/` | No | List ideas (sort: `?ordering=votes\|newest`) |
| `POST` | `/api/ideas/` | Yes | Create a new idea |
| `POST` | `/api/ideas/{id}/vote/` | Yes | Cast a vote |
| `DELETE` | `/api/ideas/{id}/vote/` | Yes | Remove a vote |

## Running Tests

```bash
source env/bin/activate
python manage.py test
```
