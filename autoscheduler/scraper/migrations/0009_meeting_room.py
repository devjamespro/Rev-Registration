# Generated by Django 2.2.17 on 2021-05-09 18:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('scraper', '0008_term'),
    ]

    operations = [
        migrations.AddField(
            model_name='meeting',
            name='room',
            field=models.CharField(max_length=6, null=True),
        ),
    ]