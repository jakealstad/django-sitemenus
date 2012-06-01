from django.test import TestCase
from django.db import models
from django.contrib.sites.models import Site
from sitemenus.models import Menu
from django.core.urlresolvers import reverse


class SitemenusViewsTestCase(TestCase):       
    def test_edit(self):
        menu_1 = Menu.objects.create(
            site = Site.objects.get_current(),
            json_tree = '[{"title": "", "description": "", "url": ""}]'
        )        
        
        resp = self.client.get(reverse('sitemenus_menu_edit'))
        self.assertEqual(resp.status_code, 200)
        
        menu_data = '[{"title":"Derp","description":"local, state, national","url":"","sub_items":[{"title":"All News","description":"","url":"","sub_items":[{"title":"Local","description":"","url":"","sub_items":[]},{"title":"State","description":"","url":"","sub_items":[]},{"title":"National","description":"","url":"","sub_items":[]}]}]}]'
        post = self.client.post(reverse('sitemenus_menu_edit'), {'menudata': menu_data})
        self.assertEqual(post.status_code, 302)
