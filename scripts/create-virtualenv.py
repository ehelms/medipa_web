#!/usr/bin/env python
import os
import simplejson
from subprocess import call

VIRTUAL_ENV = "virtenv"

ENV_DIR = os.path.dirname(os.path.abspath(__file__)) + '/../'
os.chdir(ENV_DIR)

print("Step 1: Removing old environment.")
call('rm -rf ' + VIRTUAL_ENV, shell=True)
print("Old environment successfully removed.")

print("Step 2: Creating virtual env.")
call('virtualenv --no-site-packages --distribute ' + VIRTUAL_ENV, shell=True)
print("Virutal environment successfully installed.")

print("Step 3: Loading requirements files.")
requirements = open('requirements.json').read()
requirements = simplejson.loads(requirements)
print("Requirements file loaded.")

print("Step 4: Installing pip requirements.")
if 'pip' in requirements:
    for req in requirements['pip']:
        call("pip install " + req + " -E " + VIRTUAL_ENV, shell=True)
    print("Pip packages successfully installed")
else:
    print("No pip packages specified.")

print("Step 5: Installing easy_install requirements.")
if 'easy_install' in requirements:
    for req in requirements['easy_install']:
        call(VIRTUAL_ENV + "/bin/easy_install " + req, shell=True)
    print("easy_install packages successfully installed.")
else:
    print("No easy_install packages specified")
print("Fin")
