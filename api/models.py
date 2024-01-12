from django.db import models

import string
import random


# function for generating the unique code : 
def generate_unique_code():
    length = 6

    while True:
        
        # this line of code will generate a random string consisiting of all upper case characters with length = length(6).
        code = ''.join(random.choices(string.ascii_uppercase, k=length))
        
        # the folowing part will assure that the new code generated for a particular room doesn't match with the code
        # of any other room
        if Room.objects.filter(code=code).count() == 0:
            break

    return code

# Create your models here.

class Room(models.Model):
    code = models.CharField(max_length = 8, default = generate_unique_code, unique=True)
    host = models.CharField(max_length = 50, unique=True)
    guest_can_pause = models.BooleanField(null=False, default=False)
    votes_to_skip = models.IntegerField(null=False, default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    current_song = models.CharField(max_length = 50, null=True)
