from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('board', '0002_idea_vote_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='idea',
            name='status',
            field=models.CharField(
                choices=[('open', 'Open'), ('shipped', 'Shipped')],
                default='open',
                max_length=10,
            ),
        ),
    ]
