from django.urls import path
from . import views

urlpatterns = [
    path('auth/login/', views.login, name='login'),
    path('ideas/', views.ideas, name='ideas'),
    path('ideas/<int:idea_id>/vote/', views.vote, name='vote'),
]
