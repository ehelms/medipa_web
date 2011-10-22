import os
import json

from werkzeug import secure_filename

from .image import Image


UPLOAD_FOLDER = os.path.dirname(os.path.abspath(__file__)) + '/../../medipa/media/'
ALLOWED_EXTENSIONS = set(['mha'])

def allowed_files(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

def save(file, upload=True):
    filename = ''

    if not upload:
        if allowed_files(file.url):
            filename = file.url.split('/')
            filename = filename[len(filename) - 1]
            local_file = open(UPLOAD_FOLDER + filename, "w")
            local_file.write(file.read())
            local_file.close()
    else:
        if file and allowed_files(file.filename):
            filename = file.filename.split('/')
            filename = filename[len(filename) - 1]
            filename = secure_filename(filename)
            file.save(UPLOAD_FOLDER + filename)
            file.close()
    
    if process_file(filename):
        return True
    else:
        return False

def get_images():
    tmp = os.listdir(UPLOAD_FOLDER)
    images = []
    for image in tmp:
        if allowed_files(image):
            images.append(image)
    return images

def process_file(filename):
    image = Image(''.join([UPLOAD_FOLDER, filename]))
    image_array = image.get_image()
    image_json = json.dumps(image_array)
    print(''.join([UPLOAD_FOLDER, filename.split('.mha')[0], '.json']))
    json_file = open(''.join([UPLOAD_FOLDER, filename.split('.mha')[0], '.json']), "w")
    json_file.write(image_json)
    json_file.close()

    return True
