from django.db import models
import string
import random


def generate_unique_code():
    length = 6

    while True:
        code = ''.join(random.choices(string.ascii_uppercase, k=length))
        if Room.objects.filter(code=code).count() == 0:
            break

    return code

# Create your models here.


class Room(models.Model):
    code = models.CharField(max_length=8, default=generate_unique_code, unique=True)
    host = models.CharField(max_length=50, unique=True)
    guest_can_pause = models.BooleanField(null=False, default=False)
    votes_to_skip = models.IntegerField(null=False, default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    current_song = models.CharField(max_length=50, null=True)


class QueueItem(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='queue')
    title = models.CharField(max_length=200)
    artist = models.CharField(max_length=200)
    artwork = models.URLField(blank=True)
    preview_url = models.URLField()
    votes = models.IntegerField(default=0)
    played = models.BooleanField(default=False)
    added_at = models.DateTimeField(auto_now_add=True)


class Vote(models.Model):
    queue_item = models.ForeignKey(QueueItem, on_delete=models.CASCADE)
    session_key = models.CharField(max_length=100)

    class Meta:
        unique_together = ('queue_item', 'session_key')
    
