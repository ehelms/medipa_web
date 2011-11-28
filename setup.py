from setuptools import setup

setup(name='Medipa',
      version='1.0',
      description='Visualization of medical scans in WebGL.',
      author='Eric D Helms, David Gao, Justin Sherrill, Juhee Bae',
      url='http://www.python.org/sigs/distutils-sig/',
      install_requires=['Flask', 'SimpleITK', 'kombu-sqlalchemy', "Flask-Script", "Flask-Celery", "celery", "pypng"]
     )
