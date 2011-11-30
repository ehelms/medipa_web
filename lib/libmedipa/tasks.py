from celery.task import task

from libmedipa import image_handler


@task(name="libmedipa.process_file")
def process_file(filename):
    image_handler.process_file(filename)
