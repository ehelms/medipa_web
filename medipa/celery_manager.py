import os
import sys

virtenv = os.environ['APPDIR'] + '/virtenv/'
os.environ['PYTHON_EGG_CACHE'] = os.path.join(virtenv, 'lib/python2.6/site-packages')
virtualenv = os.path.join(virtenv, 'bin/activate_this.py')

try:
    execfile(virtualenv, dict(__file__=virtualenv))
except IOError:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__)) + '/../'

sys.path.append(BASE_DIR)
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/../lib/')

from flask.ext.script import Manager
from flask.ext.celery import install_commands as install_celery_commands

from medipa.views import app


manager = Manager(app)
install_celery_commands(manager)


if __name__ == '__main__':
    manager.run()
