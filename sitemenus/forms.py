from django import forms
from django.forms.models import BaseModelFormSet, modelformset_factory, ModelForm
from sitemenus.models import MenuItem

class MyModelFormSet(BaseModelFormSet):
        def __init__(self, *args, **kwargs):
            super(MyModelFormSet, self).__init__(*args, **kwargs)
            for form in self.forms:
                form.empty_permitted = False


MenuItemFormSet = modelformset_factory(MenuItem, formset=MyModelFormSet, exclude='menu')
