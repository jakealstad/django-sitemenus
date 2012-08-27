import json
import sys

from sitemenus.models import Menu
from sitemenus.utils import render_menu
from django.contrib.sites.models import get_current_site
from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect, HttpRequest, HttpResponse
from django.template.defaultfilters import striptags
from django.db import transaction
from django.core.cache import cache


@transaction.commit_on_success
def menu_edit(request):
    current_site = get_current_site(request)
    try:
        menu = Menu.objects.get(site=current_site).json_tree
    except Menu.DoesNotExist:
        menu = '[{"title": "", "description": "", "url": ""}]'
        
    if request.method =='POST':
        try:
            Menu.objects.get(site=current_site).delete()
        except Menu.DoesNotExist:
            pass
        menu = striptags(request.POST.get('menudata'))
        menu_obj = Menu(json_tree=menu, site_id=current_site.id)
        menu_obj.save()
        request.session['success'] = True
        cache.set('sitemenus_' + current_site.domain, render_menu(current_site), sys.maxint)
        
        return redirect('sitemenus_menu_edit')

    success = request.session.get('success')
    if success:
        del request.session['success']
    
    return render(request, 'sitemenus/sitemenus_edit.html', { 'menu': menu, 'success': success })
