# Music Room Controller

Collaborative music rooms: create a room, share a 6-letter code, and let everyone queue songs and vote on what plays next.

**Live demo:** https://music-controller-production.up.railway.app

## Screenshots

![Home](docs/screenshots/home.png)
![Room](docs/screenshots/room.png)

## Features

- Room creation with configurable host/guest permissions
- Join an existing room by 6-letter code
- Song search backed by the Audius API
- Queue with an "Up next" list
- Vote-to-skip with a host-configurable vote threshold
- Host skip override (host skips instantly, no vote needed)
- Seekable player with current time / duration display
- Auto-advance to the next queued track when the current one ends
- Per-room toggle for whether guests can play/pause
- Dark "Night Forest" UI theme

## Tech Stack

- **Backend:** Django 5 + Django REST Framework
- **Frontend:** React 19, bundled with webpack, UI components from MUI
- **Database:** PostgreSQL (SQLite fallback for local development)
- **Music source:** Audius API
- **Deployment:** gunicorn + whitenoise on Railway

## Architecture

The React app is bundled by webpack into `frontend/static/frontend/` and served through a single Django template (`frontend/templates/frontend/index.html`), so the whole app is one Django deployment — no separate frontend host or API gateway.

Host/guest identity is session-based: joining or creating a room just needs a Django session, no user accounts or login. The session key doubles as the host identifier on `Room.host`.

The queue and vote state live in Postgres (`Room`, `QueueItem`, `Vote` models in `api/models.py`). Clients poll `/api/get-queue` and `/api/get-room` on an interval rather than using a websocket, which keeps the whole stack simple to deploy on a single web dyno.

## Why Audius Instead of Spotify

The project originally used the Spotify Web API. In practice this meant playback control (play/pause/seek) only worked for listeners with a Spotify Premium account and required each user to authenticate — which made the app impossible to demo to someone who didn't already have Premium.

Audius offers full-length track streaming and search over a public, keyless API. There's no OAuth flow and no subscription requirement, so anyone can open the demo link and have working playback immediately. The `spotify` Django app still exists in the repo as leftover code from that earlier version but is not wired into `INSTALLED_APPS` and is not used at runtime.

## Local Setup

```bash
# from the repo root
python3 -m venv venv
source venv/bin/activate
pip install -r music_controller/requirements.txt

# database
python music_controller/manage.py migrate

# frontend
cd music_controller/frontend
npm install
npm run build
cd ../..

# run the app
python music_controller/manage.py runserver
```

The app will be available at `http://127.0.0.1:8000`.

By default the app uses a local `db.sqlite3` file. To use Postgres locally, set a `DATABASE_URL` environment variable (read via `dj_database_url` in `music_controller/settings.py`).

## Deployment

The app is deployed on Railway using the root-level `Procfile`:

```
web: cd music_controller && python manage.py collectstatic --noinput && python manage.py migrate --noinput && gunicorn music_controller.wsgi --log-file -
```

On each deploy, Railway runs `collectstatic` (served via whitenoise) and `migrate` before starting gunicorn, so static assets and the database schema stay in sync with the deployed code without a manual release step.
