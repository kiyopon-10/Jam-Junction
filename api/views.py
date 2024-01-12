from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse



# Create your views here.


class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code' # defining lookup_url_kwarg as a class attribute to specify the name of the URL parameter
                              # used for the lookup.

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)   # the variable code will hold the parameter passed in url (roomCode)
        if code != None:
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'Bad Request': 'Code paramater not found in request'}, status=status.HTTP_400_BAD_REQUEST)
    

class JoinRoom(APIView):
    lookup_url_kwarg = 'code'
    
    def post(self, request, format=None):
        # checking if the user has an active session. If not we add a session for the user
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        # extracts the code that is sent to through the post request made.
        code = request.data.get(self.lookup_url_kwarg)
        
        if code != None:
            room_result = Room.objects.filter(code=code)
            if len(room_result) > 0:
                room = room_result[0]
                self.request.session['room_code'] = code  #keeping track that a particular user is in this room
                return Response({'message': 'Room Joined!'}, status=status.HTTP_200_OK)
            return Response({'Bad Request': 'Invalid Room Code'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'Bad Request': 'Invalid post data, did not find a code key'}, status=status.HTTP_400_BAD_REQUEST)

class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    #@csrf_protect
    def post(self, request, format=None):
        
        # if the current user doesn't already have an active session
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
            
        serializer = self.serializer_class(data=request.data)
        
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)
            
            # if the user already has a room we are gonna update the features of the room according to the new request.
            if queryset.exists():
                room = queryset[0]   # index 0 gives the actual room object we are concerned with.
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                self.request.session['room_code'] = room.code  #keeping track that a particular user is in this room
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            
            # if the user has no room from before we are gonna create a new Room object.
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause,
                            votes_to_skip=votes_to_skip)
                room.save()
                self.request.session['room_code'] = room.code  #keeping track that a particular user is in this room
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)
    

class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {
            'code': self.request.session.get('room_code'),
        }
        return JsonResponse(data, status=status.HTTP_200_OK)
    
    
class LeaveRoom(APIView):
    def post(self, request, format=None):
        
        # if there is a room code in the session of the current user
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')  # removes the room_code from the sesson object of the user
            host_id = self.request.session.session_key  #gets the session key of the current user
            room_results = Room.objects.filter(host=host_id)  #checks if the current user is the host of any room
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()   # if the user is a host, deletes the room

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
            
            #finding a room with the given code
            queryset = Room.objects.filter(code=code)
            if not queryset.exists():
                return Response({'msg': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)
            
            room = queryset[0]
            user_id = self.request.session.session_key
            #checking if the user is the host of the room
            if room.host != user_id:
                return Response({'msg': 'You are not the host of this room.'}, status=status.HTTP_403_FORBIDDEN)
            
            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
        
        return Response({'Bad Request': "Invalid Data..."}, status=status.HTTP_400_BAD_REQUEST)