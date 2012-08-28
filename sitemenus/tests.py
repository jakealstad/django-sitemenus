from django.test import TestCase
from django.test.client import RequestFactory
from django.db import models
from django.contrib.sites.models import Site
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User, Permission

from sitemenus.models import Menu
from sitemenus.views import menu_edit


class SitemenusViewsTestCase(TestCase):  

    def setUp(self):
        self.factory = RequestFactory()

    def test_edit(self):
        menu_1 = Menu.objects.create(
            site = Site.objects.get_current(),
            json_tree = '[{"title": "", "description": "", "url": ""}]'
        )

        url = reverse('sitemenus_menu_edit')
        req = self.factory.get(url)
        req.user = User(is_staff=True)
        req.user.save()
        req.session = {}

        resp = menu_edit(req)
        self.assertEqual(resp.status_code, 200)

        menu_data = '[{"title":"Derp","description":"local, state, national","url":"","sub_items":[{"title":"All News","description":"","url":"","sub_items":[{"title":"Local","description":"","url":"","sub_items":[]},{"title":"State","description":"","url":"","sub_items":[]},{"title":"National","description":"","url":"","sub_items":[]}]}]}]'
        req = self.factory.post(url, {'menudata': menu_data})
        req.session = {}

        resp = menu_edit(req)
        self.assertEqual(resp.status_code, 302)
        
    def test_edit_no_menu(self):
        url = reverse('sitemenus_menu_edit')
        req = self.factory.get(url)
        req.user = User(is_staff=True)
        req.user.save()
        req.session = {}

        resp = menu_edit(req)
        self.assertEqual(resp.status_code, 200)
