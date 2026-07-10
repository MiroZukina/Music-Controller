from django.shortcuts import render, redirect
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import update_or_create_user_tokens, is_spotify_authenticated, execute_spotify_api_call
from api.models import Room
from .models import Vote

# You will need to create this Vote model later for the skip logic
# from .models import Vote 

# --- AUTHENTICATION VIEWS (These are mostly fine) ---

class AuthURL(APIView):
    def get(self, request, fornat=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url
        return Response({'url': url}, status=status.HTTP_200_OK)

def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(
        request.session.session_key, access_token, token_type, expires_in, refresh_token)

    return redirect('frontend:') # This redirects to your main React app page

class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)

# --- PLAYBACK AND CONTROL VIEWS (These have been improved) ---

class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        host = room.host
        endpoint = "player/currently-playing"
        response = execute_spotify_api_call(host, endpoint)

        if 'error' in response or 'item' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        artist_string = ""

        for i, artist in enumerate(item.get('artists')):
            if i > 0:
                artist_string += ", "
            name = artist.get('name')
            artist_string += name

        votes = len(Vote.objects.filter(room=room, song_id=song_id))
        song = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': votes,
            'votes_required': room.votes_to_skip,
            'id': song_id
        }

        self.update_room_song(room, song_id)

        return Response(song, status=status.HTTP_200_OK)

    def update_room_song(self, room, song_id):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=['current_song'])
            votes = Vote.objects.filter(room=room).delete()
            
class PauseSong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room_queryset = Room.objects.filter(code=room_code)
        
        if room_queryset.exists():
            room = room_queryset[0]
            if self.request.session.session_key == room.host or room.guest_can_pause:
                execute_spotify_api_call(room.host, "player/pause", put_=True)
                return Response({}, status=status.HTTP_204_NO_CONTENT)
            return Response({'Error': 'User does not have permission.'}, status=status.HTTP_403_FORBIDDEN)
        
        return Response({'Error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

class PlaySong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room_queryset = Room.objects.filter(code=room_code)

        if room_queryset.exists():
            room = room_queryset[0]
            if self.request.session.session_key == room.host or room.guest_can_pause:
                execute_spotify_api_call(room.host, "player/play", put_=True)
                return Response({}, status=status.HTTP_204_NO_CONTENT)
            return Response({'Error': 'User does not have permission.'}, status=status.HTTP_403_FORBIDDEN)
            
        return Response({'Error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

class SkipSong(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room_queryset = Room.objects.filter(code=room_code)

        if not room_queryset.exists():
            return Response({'Error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
        
        room = room_queryset[0]
        user_id = self.request.session.session_key

        # Check if there's a song currently playing to vote on
        if not room.current_song:
            return Response({'Error': 'No song is currently playing to vote on.'}, status=status.HTTP_400_BAD_REQUEST)

        votes_needed = room.votes_to_skip
        
        # Check if the user is the host
        is_host = (user_id == room.host)

        # If the user is the host, they can skip immediately
        if is_host:
            # Clear all existing votes for the current song
            Vote.objects.filter(room=room).delete()
            execute_spotify_api_call(room.host, "player/next", post_=True)
            return Response({'Message': 'Song skipped by host.'}, status=status.HTTP_204_NO_CONTENT)
        
        # If the user is not the host, process their vote
        # First, check if they have already voted
        if Vote.objects.filter(user=user_id, room=room).exists():
            return Response({'Message': 'You have already voted to skip this song.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # If they haven't voted, create a new vote
        vote = Vote(user=user_id, room=room, song_id=room.current_song)
        vote.save()
        
        # Count the total number of votes for the current song
        current_votes = Vote.objects.filter(room=room, song_id=room.current_song).count()

        # If the number of votes meets or exceeds the required number, skip the song
        if current_votes >= votes_needed:
            # Clear all votes for this song before skipping
            Vote.objects.filter(room=room).delete()
            execute_spotify_api_call(room.host, "player/next", post_=True)
            return Response({'Message': 'Song skipped by vote.'}, status=status.HTTP_204_NO_CONTENT)

        return Response({'Message': 'Vote cast successfully.'}, status=status.HTTP_200_OK)