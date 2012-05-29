from django.db import models
from django.contrib.sites.models import Site


class Menu(models.Model):
    site = models.OneToOneField(Site)
    json_tree = models.TextField(default='[{"title": "", "description": "", "url": ""}]')
    
    class Meta:
        ordering = ['site']
    
    def __unicode__(self):
        return self.site.name
