from django.conf.urls import patterns, include, url


urlpatterns = patterns('',
    url(r'^$', 'sitemenus.views.menu_edit', name='sitemenus_menu_edit'),
)
