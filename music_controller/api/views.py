from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from .models import Room, QueueItem, Vote
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import status
import requests as http_requests

# --- View 1: List all rooms ---
# This view is for fetching a list of all rooms. Good for debugging.
class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class JoinRoom(APIView):
    lookup_url_kwarg = 'code'

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = Room.objects.filter(code=code)
            if len(room_result) > 0:
                room = room_result[0]
                self.request.session['room_code'] = code
                return Response({'message': 'Room Joined!'}, status=status.HTTP_200_OK)

            return Response({'Bad Request': 'Invalid Room Code'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'Bad Request': 'Invalid post data, did not find a code key'}, status=status.HTTP_400_BAD_REQUEST)



class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key
            
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                
                # --- ADD THIS LINE FOR UPDATES ---
                self.request.session['room_code'] = room.code
                
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()

                # --- ADD THIS LINE FOR CREATION ---
                self.request.session['room_code'] = room.code
                
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


# --- View 3: Get a single room's details ---
# This view handles GET requests to fetch details for a specific room using its code.
class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code' # The URL parameter to look for, e.g., /api/get-room?code=ABCD

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code is not None:
            room_queryset = Room.objects.filter(code=code)
            if room_queryset.exists():
                room = room_queryset.first()
                data = RoomSerializer(room).data
                # Add a custom 'is_host' field to the response
                data['is_host'] = self.request.session.session_key == room.host
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)
    
class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

    
        data = {
            'code': self.request.session.get('room_code')
        }
        return Response(data, status=status.HTTP_200_OK)
    
class LeaveRoom(APIView):
    def post(self, request, format=None):
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            host_id = self.request.session.session_key
            room_results = Room.objects.filter(host=host_id)
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()

        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)

class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')

            queryset = Room.objects.filter(code=code)
            if not queryset.exists():
                return Response({'msg': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

            room = queryset[0]
            user_id = self.request.session.session_key
            if room.host != user_id:
                return Response({'msg': 'You are not the host of this room.'}, status=status.HTTP_403_FORBIDDEN)

            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

        return Response({'Bad Request': "Invalid Data..."}, status=status.HTTP_400_BAD_REQUEST)
    
_audius_host = None


def _get_audius_host():
    global _audius_host
    if _audius_host:
        return _audius_host
    r = http_requests.get('https://api.audius.co', timeout=5)
    hosts = r.json().get('data', [])
    _audius_host = hosts[0]
    return _audius_host


class SearchSongs(APIView):
    def get(self, request, format=None):
        query = request.GET.get('q')
        if not query:
            return Response({'error': 'Missing q parameter'}, status=status.HTTP_400_BAD_REQUEST)
        host = _get_audius_host()
        r = http_requests.get(
            f'{host}/v1/tracks/search',
            params={'query': query, 'app_name': 'musiccontroller'},
            timeout=5,
        )
        tracks = r.json().get('data', [])[:12]
        results = [
            {
                'title': t['title'],
                'artist': t['user']['name'],
                'album': '',
                'artwork': (t.get('artwork') or {}).get('480x480', '') or '',
                'preview_url': f'{host}/v1/tracks/{t["id"]}/stream?app_name=musiccontroller',
                'duration': t.get('duration'),
            }
            for t in tracks
            if t.get('is_streamable') is not False
        ]
        return Response(results, status=status.HTTP_200_OK)
    

class AddToQueue(APIView):
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        code = request.data.get('code')
        room = Room.objects.filter(code=code).first()
        if not room:
            return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
        QueueItem.objects.create(
            room=room,
            title=request.data.get('title', ''),
            artist=request.data.get('artist', ''),
            artwork=request.data.get('artwork', ''),
            preview_url=request.data.get('preview_url', ''),
        )
        return Response({'message': 'Added'}, status=status.HTTP_201_CREATED)


class GetQueue(APIView):
    def get(self, request, format=None):
        code = request.GET.get('code')
        room = Room.objects.filter(code=code).first()
        if not room:
            return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
        items = room.queue.filter(played=False).order_by('added_at')
        data = [
            {
                'id': i.id,
                'title': i.title,
                'artist': i.artist,
                'artwork': i.artwork,
                'preview_url': i.preview_url,
                'votes': i.votes,
            }
            for i in items
        ]
        current = data[0] if data else None
        upcoming = data[1:] if len(data) > 1 else []
        return Response({
            'current': current,
            'upcoming': upcoming,
            'votes_to_skip': room.votes_to_skip,
        }, status=status.HTTP_200_OK)


class VoteSkip(APIView):
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        code = request.data.get('code')
        room = Room.objects.filter(code=code).first()
        if not room:
            return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
        current = room.queue.filter(played=False).order_by('added_at').first()
        if not current:
            return Response({'error': 'Nothing playing'}, status=status.HTTP_404_NOT_FOUND)

        session_key = self.request.session.session_key
        is_host = room.host == session_key

        if is_host:
            current.played = True
            current.save()
            return Response({'skipped': True}, status=status.HTTP_200_OK)

        _, created = Vote.objects.get_or_create(queue_item=current, session_key=session_key)
        if created:
            current.votes += 1
        if current.votes >= room.votes_to_skip:
            current.played = True
        current.save()
        return Response({'skipped': current.played, 'votes': current.votes}, status=status.HTTP_200_OK)