import os
import json
import gzip
import re
import StringIO

from werkzeug import secure_filename

from .image import Image


UPLOAD_FOLDER = os.path.dirname(os.path.abspath(__file__)) + '/../../data/'
ALLOWED_EXTENSIONS = set(['mha'])

def allowed_files(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

def save(file, upload=True):
    filename = ''

    if not upload:
        filename = file.url.split('/')
        filename = filename[len(filename) - 1]
        if not filename.endswith(".mha"):
            filename += ".mha"
        local_file = open(UPLOAD_FOLDER + filename, "wb")
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
        if image.endswith("manifest.json"):
            images.append(image.split('.manifest.json')[0])
    return images

def process_file(filename):
    image = Image(''.join([UPLOAD_FOLDER, filename]).encode('ascii'))
    reduced_image = image.reduce()

    image_array = image.get_image()
    image_json = json.dumps(image_array)
    gzip_file = open(''.join([UPLOAD_FOLDER, filename.split('.mha')[0], '.json']), 'wb')
    gzip_file.write(image_json)
    gzip_file.close()

    image_array = reduced_image.get_image()
    image_json = json.dumps(image_array)
    gzip_file = open(''.join([UPLOAD_FOLDER, filename.split('.mha')[0], '_x8', '.json']), 'wb')
    gzip_file.write(image_json)
    gzip_file.close()

    generate_manifest(filename)

    return True

def generate_manifest(filename):
    manifest_file = open(''.join([UPLOAD_FOLDER, filename.split('.mha')[0], '.manifest.json']), 'w')

    manifest = { 
        'filename' : filename, 
        'json' : { 
                'complete' : ''.join([UPLOAD_FOLDER, filename.split('.mha')[0], '.json']),
                'x8' : ''.join([UPLOAD_FOLDER, filename.split('.mha')[0], '_x8', '.json'])
                }
    }

    manifest_file.write(json.dumps(manifest))
    manifest_file.close()

def get_json(filename, size):
    manifest_file = open(''.join([UPLOAD_FOLDER, filename, '.manifest.json']), 'r')
    manifest = json.loads(manifest_file.read())

    temp_file = open(manifest['json'][size])

    gzip_buffer = StringIO.StringIO()
    gzip_file = gzip.GzipFile(mode='wb', fileobj=gzip_buffer, compresslevel=6)
    gzip_file.write(temp_file.read())
    gzip_file.close()

    return gzip_buffer.getvalue()
