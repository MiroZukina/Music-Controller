from django.urls import path
from .views import (RoomView, CreateRoomView, GetRoom, JoinRoom, UserInRoom,
                    LeaveRoom, UpdateRoom, SearchSongs, AddToQueue, GetQueue, VoteSkip)

urlpatterns = [
    path('room', RoomView.as_view()),
    path('create-room', CreateRoomView.as_view()),
    path('get-room', GetRoom.as_view()),
    path('join-room', JoinRoom.as_view()),
    path('user-in-room', UserInRoom.as_view()),
    path('leave-room', LeaveRoom.as_view()),
    path('update-room', UpdateRoom.as_view()),
    path('search-songs', SearchSongs.as_view()),
    path('add-to-queue', AddToQueue.as_view()),
    path('get-queue', GetQueue.as_view()),
    path('vote-skip', VoteSkip.as_view()),
]