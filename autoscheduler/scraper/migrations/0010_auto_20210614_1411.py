# Generated by Django 2.2.24 on 2021-06-14 19:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('scraper', '0009_meeting_room'),
    ]

    operations = [
        migrations.AlterField(
            model_name='meeting',
            name='room',
            field=models.CharField(max_length=7, null=True),
        ),
    ]
