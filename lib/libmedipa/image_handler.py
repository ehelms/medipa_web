import os

from werkzeug import secure_filename

from .image import Image


UPLOAD_FOLDER = os.path.dirname(os.path.abspath(__file__)) + '/../../medipa/media/'
ALLOWED_EXTENSIONS = set(['mha'])

def allowed_files(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

def save(file, upload=True):
    if not upload:
        if allowed_files(file.url):
            filename = file.url.split('/')
            filename = filename[len(filename) - 1]
            local_file = open(os.path.join(UPLOAD_FOLDER, filename), "w")
            local_file.write(file.read())
            local_file.close()
            #add process code
            return true
    else:
        if file and allowed_files(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            #add process code
            return True
    return False

def get_images():
    tmp = os.listdir(UPLOAD_FOLDER)
    images = []
    for image in tmp:
        if allowed_files(image):
            images.append(image)
    return images
