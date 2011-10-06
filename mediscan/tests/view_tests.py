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
    
    def test_post_image(self):
        f = open('tests/test_file_upload.txt')
        response = self.app.post('/image/upload/', 
                                data=dict(file = f),
                                follow_redirects=True)
        self.assertEqual(response.status_code, 200)
    
    def test_get_image(self):
        response = self.app.get('/image/376/')
        self.assertEqual(response.status_code, 200)
