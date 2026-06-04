from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Idea, Vote

USERS = [
    {'username': 'demo_user',  'password': 'demo1234'},
    {'username': 'team_lead',  'password': 'lead1234'},
    {'username': 'alice', 'password': 'pass1234'},
    {'username': 'bob', 'password': 'pass1234'},
]

IDEAS = [
    {
        'title': 'Dark mode support',
        'description': 'Add a dark mode toggle to the UI for better night-time usability.',
        'votes': ['demo_user', 'alice', 'bob'],
        'created_by': ['alice'],
    },
    {
        'title': 'Export to CSV',
        'description': 'Allow users to export data tables to CSV format for offline analysis.',
        'votes': ['demo_user', 'team_lead', 'alice'],
        'created_by': ['bob'],
    },
    {
        'title': 'Keyboard shortcuts',
        'description': 'Add keyboard shortcuts for common actions to improve power-user productivity.',
        'votes': ['team_lead', 'alice'],
        'created_by': ['alice'],
    },
    {
        'title': 'Slack notifications',
        'description': 'Send Slack notifications when ideas change status or receive significant votes.',
        'votes': ['demo_user', 'team_lead'],
        'created_by': ['team_lead'],

    },
    {
        'title': 'Mobile app companion',
        'description': 'Build a lightweight mobile app for on-the-go access to the voting board.',
        'votes': ['alice'],
        'created_by': ['demo_user'],
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

        for data in IDEAS:
            idea = Idea.objects.create(
                title=data['title'],
                description=data['description'],
                created_by=users[data['created_by'][0]] if 'created_by' in data else users['demo_user']
            )
            for username in data['votes']:
                Vote.objects.create(idea=idea, user=users[username])

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {Idea.objects.count()} ideas and {Vote.objects.count()} votes'
        ))
