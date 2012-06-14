from sitemenus.models import Menu
from django.core.cache import cache
from django import template
import json


def render_menu(site):
    try:
        menu = json.loads(Menu.objects.get(site=site).json_tree)
    except Menu.DoesNotExist:
        menu = []
    
    t = template.loader.get_template('sitemenus/top_menu.html')
    c = template.Context({"menu": menu})
    rendered_menu = t.render(c)
    
    return rendered_menu
