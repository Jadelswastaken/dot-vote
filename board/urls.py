from django.urls import path
from . import views

urlpatterns = [
    path('auth/login/', views.login, name='login'),
    path('ideas/', views.list_ideas, name='list-ideas'),
    path('ideas/create/', views.create_idea, name='create-idea'),
    path('ideas/<int:idea_id>/vote/', views.vote, name='vote'),
]
