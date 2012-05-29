from django import template
from sitemenus.models import Menu
from sitemenus.utils import render_menu
from sitemenus.views import edit
from django.contrib.sites.models import Site
import json

register = template.Library()


class CurrentMenuNode(template.Node):
    def render(self, context):
        current_site = Site.objects.get_current()
        menu = json.loads(Menu.objects.get(site=current_site).json_tree)

        return render_menu(menu)


@register.tag(name="get_menu")
def get_menu(self, menu):
    return CurrentMenuNode()
