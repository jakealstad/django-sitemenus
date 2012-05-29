from django.conf.urls import patterns, include, url


urlpatterns = patterns('',
    url(r'^$', 'sitemenus.views.index', name='sitemenus_index'),
    url(r'^([\w\.]+)/$', 'sitemenus.views.edit', name='sitemenus_menu_edit'),
)
