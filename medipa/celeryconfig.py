BROKER_TRANSPORT = "sqlakombu.transport.Transport"
BROKER_HOST = "sqlite:///../data/db/celerydb.sqlite"

CELERY_RESULT_BACKEND = "database"
CELERY_RESULT_DBURI = "sqlite:///../data/db/celerydb.sqlite"

CELERY_IMPORTS = ("tasks", )
