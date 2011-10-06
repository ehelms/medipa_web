import unittest

from mediscan.views import app


class ViewTests(unittest.TestCase):

    def setUp(self):
        app.config['TESTING'] = True
        self.app = app.test_client()
    
    def test_get_image_upload(self):
        response = self.app.get('/image/upload/')
        self.assertEqual(response.status_code, 200)

    def test_get_images(self):
        response = self.app.get('/image/')
        self.assertEqual(response.status_code, 200)
    
    def test_get_images(self):
        response = self.app.get('/image/', 
                                headers={ 'HTTP_ACCEPT' : 'application/json' })
        self.assertEqual(response.status_code, 200)
    
    def test_post_image_upload(self):
        f = open('tests/test_file_upload.txt')
        response = self.app.post('/image/upload/', 
                                data=dict(file = f, scan_url = ''),
                                follow_redirects=True)
        self.assertEqual(response.status_code, 200)
    
    def test_post_image_url(self):
        response = self.app.post('/image/upload/', 
                   data=dict(scan_url = "http://www.google.com/robots.txt", file = ''),
                                follow_redirects=True)
        self.assertEqual(response.status_code, 200)
    
    def test_post_image_url_and_upload(self):
        f = open('tests/test_file_upload.txt')
        response = self.app.post('/image/upload/', 
                   data=dict(scan_url = "http://www.google.com/robots.txt", file = f),
                                follow_redirects=True)
        self.assertEqual(response.status_code, 200)
    
    def test_get_image(self):
        response = self.app.get('/image/376/')
        self.assertEqual(response.status_code, 200)
