from django.contrib import admin

from .models import User, BankTransaction, FileStorage

admin.site.register(User)
admin.site.register(BankTransaction)
admin.site.register(FileStorage)
