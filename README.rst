======
Requirements
======

The following are required to be installed on the system prior to the installation steps.

- Python 2.7
- Python Setuptools
- Python Pip
- Python Virtualenv
- libzip, libzip-devel, libjpeg-devel, libjpeg, gcc

======
Development Setup
======

1. Clone the MedIPA repository
2. From the base directory run: ./scripts/create-virtualenv.py
3. Activate the virtual environment: source /virtenv/bin/activate
4. Change to 'medipa' directory: cd medipa
5. Run: python manage.py runserver
