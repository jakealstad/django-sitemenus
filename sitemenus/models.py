from django.db import models
from django.contrib.sites.models import Site
from django.forms import ModelForm


class Menu(models.Model):
    site = models.OneToOneField(Site)
    
    class Meta:
        ordering = ['site']
    
    def __unicode__(self):
        return self.site.name


class MenuItem(models.Model):
    menu = models.ForeignKey(Menu)
    order = models.IntegerField()
    text = models.CharField(max_length=50)
    link = models.URLField(max_length=100)
    parent_item = models.ForeignKey('self', null=True, blank=True)
    description = models.CharField(max_length=200)
    
    class Meta:
        ordering = ['order']
        
    def __unicode__(self):
        return self.text
        

class MenuForm(ModelForm):
    class Meta:
        model = Menu
        

class MenuItemForm(ModelForm):
    class Meta:
        model = MenuItem
