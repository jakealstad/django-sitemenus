from django.conf.urls import patterns, include, url
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    (r'^admin/', include(admin.site.urls)),
    url(r'^$', 'sitemenus.views.index', name='sitemenus_index'),
    url(r'^([\w\.]+)/$', 'sitemenus.views.edit', name='sitemenus_menu_edit'),
)
