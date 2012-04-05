from sitemenus.models import Menu, MenuItem, MenuForm, MenuItemForm
from django.shortcuts import render
from django.contrib.sites.models import Site
from sitemenus.forms import MenuItemFormSet
from django.http import HttpResponseRedirect


def index(request):
    menulist = Menu.objects.filter()
    
    return render(request, 'sitemenus/index.html', { 'menulist': menulist })

def edit(request, domain):
    menu = Menu.objects.get(site=Site.objects.get(domain=domain))
    if request.method == 'POST':
        formset = MenuItemFormSet(request.POST)
        if formset.is_valid():
            MenuItem.objects.filter(menu=menu).delete()
            for form in formset:
                menu_item = MenuItem.objects.create(
                    menu = menu,
                    text = form.cleaned_data['text'],
                    order = form.cleaned_data['order'],
                    link = form.cleaned_data['link'],
                    description = form.cleaned_data['description'],
                    parent_item = form.cleaned_data['parent_item'],
                )
                
            return HttpResponseRedirect('.')
    
    else:
        formset = MenuItemFormSet(queryset=MenuItem.objects.filter(menu=menu).select_related('parent_item_set'))
        
    return render(request, 'sitemenus/sitemenus_edit.html', { 'formset': formset, 'menu': menu })
