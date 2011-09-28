import unittest

from mediscan.views import app


class ViewTests(unittest.TestCase):

    def setUp(self):
        app.config['TESTING'] = True
        self.app = app.test_client()

    def test_get(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
