from django import template
from sitemenus.models import Menu
from sitemenus.utils import render_menu
from sitemenus.views import edit
from django.contrib.sites.models import Site
from django.core.cache import cache
from django.http import HttpRequest
import json

register = template.Library()


class CurrentMenuNode(template.Node):
    def render(self, context):
        current_site = Site.objects.get_current()
        cached_menu = cache.get('sitemenus_' + current_site.domain)
        
        if cached_menu:
            print 'using cache'
            return cached_menu
        
        cache.set('sitemenus_' + current_site.domain, render_menu(current_site), 0)
        return render_menu(current_site)


@register.tag(name="get_menu")
def get_menu(self, menu):
    return CurrentMenuNode()
