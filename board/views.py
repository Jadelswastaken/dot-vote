from django.db import IntegrityError
from django.db.models import F
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
    })


def _user_voted_ids(user):
    if user.is_authenticated:
        return set(Vote.objects.filter(user=user).values_list('idea_id', flat=True))
    return set()


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def ideas(request):
    if request.method == 'GET':
        sort = request.query_params.get('sort', 'popular')
        qs = Idea.objects.all()
        if sort == 'newest':
            qs = qs.order_by('-created_at')
        else:
            qs = qs.order_by('-vote_count', '-created_at')
        ctx = {'user_voted_ids': _user_voted_ids(request.user)}
        return Response(IdeaSerializer(qs, many=True, context=ctx).data)

    if not request.user or not request.user.is_authenticated:
        return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
    serializer = IdeaSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    idea = serializer.save(created_by=request.user)
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
            _, created = Vote.objects.get_or_create(idea=idea, user=request.user)
        except IntegrityError:
            # Concurrent duplicate vote that slipped past get_or_create's check
            # and was rejected by the DB-level UniqueConstraint. The vote already
            # exists, so report the current state rather than 500-ing.
            idea.refresh_from_db()
            return Response(
                {'vote_count': idea.vote_count, 'user_has_voted': True},
                status=status.HTTP_409_CONFLICT,
            )
        if created:
            Idea.objects.filter(pk=idea.pk).update(vote_count=F('vote_count') + 1)
            idea.refresh_from_db()
        return Response(
            {'vote_count': idea.vote_count, 'user_has_voted': True},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    deleted, _ = Vote.objects.filter(idea=idea, user=request.user).delete()
    if deleted:
        Idea.objects.filter(pk=idea.pk).update(vote_count=F('vote_count') - 1)
        idea.refresh_from_db()
    return Response({'vote_count': idea.vote_count, 'user_has_voted': False})
