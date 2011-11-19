import os
import json
import gzip
import re
import StringIO
import math
from PIL import Image as PilImage
from werkzeug import secure_filename

from .image import Image


UPLOAD_FOLDER = os.path.dirname(os.path.abspath(__file__)) + '/../../data/'
ALLOWED_EXTENSIONS = set(['mha', '.zip'])

def allowed_files(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

def save(file, upload=True):
    filename = ''
    
    try:
        if not upload:
            filename = file.url.split('/')
            filename = filename[len(filename) - 1]
            if not filename.endswith(".mha"):
                filename += ".mha"
            local_file = open(UPLOAD_FOLDER + filename, "wb")
            local_file.write(file.read())
            local_file.close()
            return True, filename
        else:
            if file and allowed_files(file.filename):
                filename = file.filename.split('/')
                filename = filename[len(filename) - 1]
                filename = secure_filename(filename)
                file.save(UPLOAD_FOLDER + filename)
                file.close()
                return True, filename
    except:
        return False, ''
   
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
    
    manifest = { 
        'filename' : filename,
        'json' : {}
    }

    manifest = reduce(filename, manifest, 3, image)

    save_manifest(filename, manifest)
    
    return True



def reduce(filename, manifest, times, image):
    complete_filename = ''.join([UPLOAD_FOLDER, filename.split('.mha')[0], '.png'])
    write(complete_filename, manifest, "complete", image.convert_image(), image.size)
    for i in  range(times):
        name = "x%s" % ( int(math.pow(8, i+1)) )
        out_filename = ''.join([UPLOAD_FOLDER, filename.split('.mha')[0], "_",  name, '.png'])
        image = image.reduce();
        manifest = write(out_filename, manifest, name, image.convert_image(), image.size)
    return manifest     

def write(out_filename, manifest, name, array, size):
    
#    image_json = json.dumps(array)
#    gzip_file = open(out_filename, 'wb')
#    gzip_file.write(image_json)
#    gzip_file.close()
    
    img = PilImage.new("L", (size[0]*size[2], size[1]))
    img.putdata(array)
    
    img.save(out_filename)    
    dimensions = {
        'x' : size[0],
        'y' : size[1],
        'z' : size[2]
    }
    manifest['json'][name] = {
        'filename' : out_filename,
        'dimensions' : dimensions
    }
    return manifest

def save_manifest(filename, manifest):
    manifest_file = open(''.join([UPLOAD_FOLDER, filename.split('.mha')[0], '.manifest.json']), 'w')

    manifest_file.write(json.dumps(manifest))
    manifest_file.close()

def get_image(filename, size):
    manifest_file = open(''.join([UPLOAD_FOLDER, filename, '.manifest.json']), 'r')
    manifest = json.loads(manifest_file.read())

    temp_file = open(manifest['json'][size]['filename'])

    return temp_file.read()

def get_dimensions(filename, size):
    manifest_file = open(''.join([UPLOAD_FOLDER, filename, '.manifest.json']), 'r')
    manifest = json.loads(manifest_file.read())

    return manifest['json'][size]['dimensions']
