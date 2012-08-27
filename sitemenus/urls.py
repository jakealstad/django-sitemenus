from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import permission_required

from sitemenus.views import menu_edit


urlpatterns = patterns('',
    url(r'^$', permission_required('sitemenus.change_menu')(menu_edit), name='sitemenus_menu_edit'),
)
