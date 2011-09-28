import unittest

from tests.view_tests import ViewTests


def run():
    suite = unittest.TestSuite()
    suite.addTest(unittest.makeSuite(ViewTests))
    unittest.TextTestRunner(verbosity=2).run(suite)
