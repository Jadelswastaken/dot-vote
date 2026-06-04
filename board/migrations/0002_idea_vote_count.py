from django.db import migrations, models


def populate_vote_counts(apps, schema_editor):
    Idea = apps.get_model('board', 'Idea')
    Vote = apps.get_model('board', 'Vote')
    for idea in Idea.objects.all():
        idea.vote_count = Vote.objects.filter(idea=idea).count()
        idea.save(update_fields=['vote_count'])


class Migration(migrations.Migration):

    dependencies = [
        ('board', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='idea',
            name='vote_count',
            field=models.IntegerField(default=0),
        ),
        migrations.RunPython(populate_vote_counts, migrations.RunPython.noop),
    ]
