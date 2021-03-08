from django.test import RequestFactory, TestCase
import json
#import proj5FinTracker.views
from django.contrib.auth import authenticate, login, logout



class MostBasicTest(TestCase):
      
    def test_try_pass_assert(self):
        self.assertEqual(1 + 2, 3)
        
class inputStatementTests(TestCase):    
    
    def setUp(self):
        self.factory = RequestFactory()
        request = self.factory.
        login(self.client.post({'username': 'prosopopoeia', 
             'password': 'friendx'}), 'prosopopoeia')
        
    
    
    def test_check_template(self):
        response = self.client.get('/vinput')
        self.assertTemplateUsed(response, 'proj5FinTracker/input.html')    
        
    def test_check_status(self):
        response = self.client.post('/vupdateEntry', 
            data=json.dumps({"ddate": "02-02-2020",
                  "damt": "100.00",
                  "ddescription": "transnational transaction",
                  "dcat": "oaken-wood furniture butcher"}),
                  content_type="application/json")
        self.assertIs(response.status_code, 200)
        
    # def test_response_content(self):
        # response = self.client.get('/vupdateEntry')
        # msg = response.json()        
        # self.assertEqual(msg['msg'],"cecil 2")
        
    # def test_entry_is_returned(self):
        # testFile = open('proj5FinTracker/d9.pdf', 'r', encoding='utf-8', errors='ignore')
        # response = self.client.post('/vupload', data={'file_name': testFile})
        # self.assertContains(response,'CREDIT')
        # #self.assertIs(response.status_code, 300)
        
    
        