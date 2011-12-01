#!/usr/bin/env python
from __future__ import absolute_import

import os
import sys

from flask.ext.script import Manager
from flask.ext.celery import install_commands as install_celery_commands

BASE_DIR = os.path.dirname(os.path.abspath(__file__)) + '/../'

sys.path.append(BASE_DIR)
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/../lib/')

os.environ['MEDIPA_CELERY_CONFIG'] = "celeryconfig.py"

from medipa.views import create_app

app = create_app()
manager = Manager(app)
install_celery_commands(manager)

if __name__ == "__main__":
    manager.run()
