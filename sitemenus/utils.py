from django.contrib.sites.models import Site
from django.core.cache import cache
from django import template


def render_menu(menu):
    current_site = Site.objects.get_current()    
    
    t = template.loader.get_template('sitemenus/top_menu.html')
    c = template.Context({"menu": menu})
    rendered_menu = t.render(c)
    
    return rendered_menu
