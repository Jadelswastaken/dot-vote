from django.db import IntegrityError, transaction
from django.db.models import Count
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import Idea, Vote
from .serializers import IdeaSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')
    if not username or not password:
        return Response({'error': 'Username and password required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if user is None:
        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'username': user.username,
        'is_staff': user.is_staff,
    })


def _idea_queryset():
    return Idea.objects.annotate(vote_count=Count('votes'))


def _user_voted_ids(user):
    if user.is_authenticated:
        return set(Vote.objects.filter(user=user).values_list('idea_id', flat=True))
    return set()


@api_view(['GET'])
@permission_classes([AllowAny])
def list_ideas(request):
    sort = request.query_params.get('sort', 'popular')
    qs = _idea_queryset()
    if sort == 'newest':
        qs = qs.order_by('-created_at')
    else:
        qs = qs.order_by('-vote_count', '-created_at')
    ctx = {'user_voted_ids': _user_voted_ids(request.user)}
    return Response(IdeaSerializer(qs, many=True, context=ctx).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_idea(request):
    serializer = IdeaSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    idea = serializer.save(created_by=request.user)
    idea.vote_count = 0
    return Response(
        IdeaSerializer(idea, context={'user_voted_ids': set()}).data,
        status=status.HTTP_201_CREATED,
    )



@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def vote(request, idea_id):
    try:
        idea = Idea.objects.get(pk=idea_id)
    except Idea.DoesNotExist:
        return Response({'error': 'Idea not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'POST':
        try:
            with transaction.atomic():
                Vote.objects.create(idea=idea, user=request.user)
        except IntegrityError:
            return Response({'error': 'Already voted for this idea.'}, status=status.HTTP_409_CONFLICT)
        return Response({'vote_count': idea.votes.count(), 'user_has_voted': True})

    deleted, _ = Vote.objects.filter(idea=idea, user=request.user).delete()
    if not deleted:
        return Response({'error': 'No vote to remove.'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'vote_count': idea.votes.count(), 'user_has_voted': False})
