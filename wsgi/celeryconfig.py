import os

BROKER_TRANSPORT = "sqlakombu.transport.Transport"
BROKER_HOST = "sqlite:///" + os.environ['OPENSHIFT_DATA_DIR'] + "/db/celerydb.sqlite"

CELERY_RESULT_BACKEND = "database"
CELERY_RESULT_DBURI = "sqlite:///" + os.environ['OPENSHIFT_DATA_DIR'] + "/db/celerydb.sqlite"

CELERY_IMPORTS = ("medipa.tasks", )
