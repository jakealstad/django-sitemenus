from sitemenus.models import Menu
from django.contrib.sites.models import Site
from django.shortcuts import render
from django.http import HttpResponseRedirect
import json
import ast

def index(request):
    menulist = Menu.objects.all()
    
    return render(request, 'sitemenus/index.html', { 'menulist': menulist })

def edit(request, domain):
    menu = ast.literal_eval(Menu.objects.get(site=Site.objects.get(domain=domain)).json_tree)
        
    return render(request, 'sitemenus/sitemenus_edit.html', { 'menu': menu, })
