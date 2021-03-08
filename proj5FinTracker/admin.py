from django.contrib import admin

from .models import User, BankTransaction

admin.site.register(User)
admin.site.register(BankTransaction)
