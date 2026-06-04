from django.db import IntegrityError, transaction
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from .models import Idea, Vote


class SingleVotePerUserTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.idea = Idea.objects.create(title='Test Idea', description='A test idea', created_by=self.user)
        self.client.force_authenticate(user=self.user)

    def test_user_cannot_vote_twice_for_same_idea(self):
        url = f'/api/ideas/{self.idea.id}/vote/'

        res1 = self.client.post(url)
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res1.data['vote_count'], 1)
        self.assertTrue(res1.data['user_has_voted'])

        res2 = self.client.post(url)
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(res2.data['vote_count'], 1)
        self.assertTrue(res2.data['user_has_voted'])

        self.assertEqual(Vote.objects.filter(idea=self.idea, user=self.user).count(), 1)

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Vote.objects.create(idea=self.idea, user=self.user)
