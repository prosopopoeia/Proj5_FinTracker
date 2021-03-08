from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import datetime


class User(AbstractUser):
    amount=models.IntegerField(default=0)
    
class FileStorage(models.Model):
    financial_doc = models.FileField()
     
class BankTransaction(models.Model):
    trans_date = models.DateField()
    trans_amt = models.DecimalField(default=0, max_digits=11, decimal_places=2)
    trans_msg = models.CharField(default='unknown', max_length=200)    
    trans_category = models.CharField(default='unknown', max_length=100)
    trans_owner = models.ForeignKey(User, on_delete=models.CASCADE)
    trans_group = models.CharField(default=None, blank=True, null=True, max_length=100)
        
    def serialize(self):
        return {
            "id": self.id,
            "trans_date": self.trans_date,
            "trans_amt": self.trans_amt,
            "trans_msg": self.trans_msg,
            #"trans_owner": self.trans_owner.username,            
            "trans_group": self.trans_group,
            "trans_category": self.trans_category        
        }