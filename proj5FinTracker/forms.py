from django import forms
import datetime

class InputBankStatementForm(forms.Form):
    file_name = forms.FileField(label='File Name')
   
class FindByDateForm(forms.Form):
    month_year = forms.DateField(initial=datetime.date.today() - datetime.timedelta(-3),
                                          widget= forms.TextInput(attrs={'id':'bydate'}))

class TransactionForm(forms.Form):
    trans_date = forms.DateField(
        initial=datetime.date.today(),        
        widget = forms.TextInput(attrs={'id':'dte', 'type':'date'}))    
    trans_amt = forms.DecimalField(
        max_digits=11, 
        decimal_places=2,
        widget = forms.TextInput(attrs={'id':'amt'}))
    trans_msg = forms.CharField(
        max_length=200,
        widget = forms.TextInput(attrs={'id':'msg', "rows":14}))    
    trans_category = forms.CharField(
        max_length=100,
        widget = forms.TextInput(attrs={'id':'cat', "rows":14}))
    trans_group = forms.CharField(
        max_length=100,
        widget = forms.TextInput(attrs={'id':'grp', "rows":14}))   

