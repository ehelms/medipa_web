#!/usr/bin/python
import os
import sys
import shutil
import subprocess
import signal


sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/../lib/')
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/../')

BASE_DIR = os.path.dirname(os.path.abspath(__file__)) + '/../'

'''
if os.path.isdir(os.path.abspath(__file__).split('/application')[0] + "/static/javascript"):
    shutil.rmtree(os.path.abspath(__file__).split('/application')[0] + "/static/javascript", ignore_errors=True)
shutil.copytree(os.path.abspath(__file__).split('/application')[0] +  "/../medipa/static/javascript", os.path.abspath(__file__).split('/application')[0] + "/static/javascript") 

if os.path.isdir(os.path.abspath(__file__).split('/application')[0] + "/static/stylesheets"):
    shutil.rmtree(os.path.abspath(__file__).split('/application')[0] + "/static/stylesheets", ignore_errors=True)
shutil.copytree(os.path.abspath(__file__).split('/application')[0] +  "/../medipa/static/stylesheets", os.path.abspath(__file__).split('/application')[0] + "/static/stylesheets") 
'''

virtenv = BASE_DIR + '/virtenv/'
os.environ['MEDIPA_DATA_DIR'] = BASE_DIR + '/data/'
os.environ['PYTHON_EGG_CACHE'] = os.path.join(virtenv, 'lib/python2.6/site-packages')
virtualenv = os.path.join(virtenv, 'bin/activate_this.py')

try:
    execfile(virtualenv, dict(__file__=virtualenv))
except IOError:
    pass

from medipa.views import app as application
