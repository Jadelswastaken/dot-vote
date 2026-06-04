from django.db import models
from django.contrib.auth.models import User


class Idea(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ideas')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Vote(models.Model):
    idea = models.ForeignKey(Idea, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='votes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['idea', 'user'], name='unique_vote_per_user_per_idea')
        ]

    def __str__(self):
        return f"{self.user.username} -> {self.idea.title}"
