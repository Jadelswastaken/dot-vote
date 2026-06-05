from datetime import timedelta

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone

from board.models import Idea, Vote

USERS = [
    {'username': 'demo_user',  'password': 'Jadels@9876'},
    {'username': 'team_lead',  'password': 'lead1234'},
    {'username': 'alice', 'password': 'pass1234'},
    {'username': 'bob', 'password': 'pass1234'},
]

# days_ago staggers created_at so "Newest" sorts differently from "Popular".
# Among the open ideas the order is roughly reversed: the least-voted idea
# (Mobile app companion) is the newest, the most-voted (Export to CSV) the oldest.
IDEAS = [
    {
        'title': 'Dark mode support',
        'description': 'Add a dark mode toggle to the UI for better night-time usability.',
        'votes': ['demo_user', 'alice', 'bob'],
        'created_by': 'alice',
        'days_ago': 1,
        'status': 'shipped',
    },
    {
        'title': 'Export to CSV',
        'description': 'Allow users to export data tables to CSV format for offline analysis.',
        'votes': ['demo_user', 'team_lead', 'alice'],
        'created_by': 'bob',
        'days_ago': 1,
    },
    {
        'title': 'Keyboard shortcuts',
        'description': 'Add keyboard shortcuts for common actions to improve power-user productivity.',
        'votes': ['team_lead', 'bob'],
        'created_by': 'alice',
        'days_ago': 2,
    },
    {
        'title': 'Slack notifications',
        'description': 'Send Slack notifications when ideas change status or receive significant votes.',
        'votes': ['demo_user', 'team_lead'],
        'created_by': 'team_lead',
        'days_ago': 0
    },
    {
        'title': 'Mobile app companion',
        'description': 'Build a lightweight mobile app for on-the-go access to the voting board.',
        'votes': ['alice'],
        'days_ago': 3,
    },
    {
        'title': 'Guest View',
        'description': 'No login required to view ideas, but only registered users can vote or submit ideas.',
        'votes': ['bob', 'alice', 'demo_user', 'team_lead'],
        'days_ago': 7,
        'status': 'shipped',
    },
]


class Command(BaseCommand):
    help = 'Seed the database with demo users and sample ideas'

    def handle(self, *args, **options):
        users = {}
        for u in USERS:
            user, created = User.objects.get_or_create(username=u['username'])
            if created:
                user.set_password(u['password'])
                user.save()
                self.stdout.write(f"Created user: {u['username']} / {u['password']}")
            else:
                self.stdout.write(f"User already exists: {u['username']}")
            users[u['username']] = user

        if Idea.objects.exists():
            self.stdout.write('Ideas already exist — skipping idea seed')
            return

        now = timezone.now()
        for data in IDEAS:
            idea = Idea.objects.create(
                title=data['title'],
                description=data['description'],
                status=data.get('status', 'open'),
                created_by=users[data.get('created_by', 'demo_user')],
            )
            for username in data['votes']:
                Vote.objects.create(idea=idea, user=users[username])
            # created_at uses auto_now_add, which ignores any value passed to
            # create(). update() bypasses that, letting us backdate each idea so
            # the "Newest" sort is meaningful.
            Idea.objects.filter(pk=idea.pk).update(
                vote_count=len(data['votes']),
                created_at=now - timedelta(days=data['days_ago']),
            )

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {Idea.objects.count()} ideas and {Vote.objects.count()} votes'
        ))
