# Music Controller - House Party

This is a full-stack web application that uses the Spotify API to create a collaborative music-playing experience. It features a Django REST Framework backend and a React frontend.

## Features

- Create and join music rooms with unique codes.
- The room host can control music playback (play, pause, skip).
- Guests can vote to skip the current song.
- Real-time updates of the currently playing song.

## Setup Instructions

### Backend (Django)

1.  Navigate to the project root and create a virtual environment:
    `python3 -m venv venv`
2.  Activate the environment:
    `source venv/bin/activate`
3.  Install dependencies:
    `pip install -r requirements.txt` (You will create this file in the next step)
4.  Run migrations:
    `python3 music_controler/manage.py migrate`
5.  Start the server:
    `python3 music_controler/manage.py runserver`

### Frontend (React)

1.  Navigate to the `frontend` directory:
    `cd frontend`
2.  Install dependencies:
    `npm install`
3.  Start the development server:
    `npm run dev`

## Required Credentials

To connect to the Spotify API, you must create a `credentials.py` file inside the `spotify` app directory (`spotify/credentials.py`). This file should contain the following variables:

```python
CLIENT_ID = "YOUR_SPOTIFY_CLIENT_ID"
CLIENT_SECRET = "YOUR_SPOTIFY_CLIENT_SECRET"
REDIRECT_URI = "http://127.0.0.1:8000/spotify/redirect"