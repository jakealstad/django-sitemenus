from sitemenus.models import Menu
from sitemenus.utils import render_menu
from django.contrib.sites.models import Site
from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect, HttpRequest
from django.template.defaultfilters import striptags
from django.db import transaction
from django.core.cache import cache



def index(request):
    menulist = Menu.objects.all()
    
    return render(request, 'sitemenus/index.html', { 'menulist': menulist })


@transaction.commit_on_success
def edit(request, domain):
    current_site = Site.objects.get_current()
    menu = Menu.objects.get(site=current_site).json_tree
    cache_key = cache.get('sitemenus_' + current_site.domain)
    
    if request.method =='POST':
        Menu.objects.get(site=current_site).delete()
        menu = striptags(request.POST.get('menudata'))
        menu_obj = Menu(json_tree=menu, site_id=current_site.id)
        menu_obj.save()
        
        return redirect('/sitemenus/' + str(current_site))
    
    return render(request, 'sitemenus/sitemenus_edit.html', { 'menu': menu, })
