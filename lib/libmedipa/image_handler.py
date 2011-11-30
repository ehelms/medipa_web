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
        'json' : {},
        'configurations' : []
    }

    manifest = reduce(filename, manifest, 3, image)

    save_manifest(filename, manifest)
    
    return True

def process_local_file(filename):
    image = Image(filename)
    reduced_image = image.reduce()
    
    manifest = { 
        'filename' : filename,
        'json' : {},
        'configurations' : []
    }

    manifest = reduce(filename, manifest, 3, image)

    save_manifest(filename, manifest)
    
    return True    


def reduce(filename, manifest, times, image):
    image_array, rows, cols = image.convert_image()
    complete_filename = ''.join([UPLOAD_FOLDER, filename.split('.mha')[0], '.png'])
    write(complete_filename, manifest, "complete", image_array, image.size, rows, cols)
    for i in  range(times):
        name = "x%s" % ( int(math.pow(8, i+1)) )
        out_filename = ''.join([UPLOAD_FOLDER, filename.split('.mha')[0], "_",  name, '.png'])
        print("Processing: " + out_filename)
        print("Reducing...")
        image = image.reduce()
        print("Converting...")
        image_array, rows, cols = image.convert_image()
        print("Writing to manifest...")
        manifest = write(out_filename, manifest, name, image_array, image.size, rows, cols)
        print("Finished: " + out_filename)
    return manifest     

def write(out_filename, manifest, name, array, size, rows, cols):

    img = PilImage.new("L", (size[0]*cols, size[1]*rows))
    img.putdata(array)
    img.save(out_filename)    

    dimensions = {
        'x' : size[0],
        'y' : size[1],
        'z' : size[2]
    }
    manifest['json'][name] = {
        'filename' : out_filename,
        'dimensions' : dimensions,
        'rows': rows,
        'cols': cols
    }

    return manifest

def save_manifest(filename, manifest):
    manifest_file = open(''.join([UPLOAD_FOLDER, filename.split('.mha')[0], '.manifest.json']), 'w')

    manifest_file.write(json.dumps(manifest))
    manifest_file.close()

def load_manifest(filename):
    manifest_file = open(''.join([UPLOAD_FOLDER, filename, '.manifest.json']), 'r')
    manifest = json.loads(manifest_file.read())
    return manifest

def get_image(filename, size):
    manifest_file = open(''.join([UPLOAD_FOLDER, filename, '.manifest.json']), 'r')
    manifest = json.loads(manifest_file.read())

    temp_file = open(manifest['json'][size]['filename'])

    return temp_file.read()

def get_dimensions(filename, size):
    manifest = load_manifest(filename)
    return manifest['json'][size]['dimensions']

def get_rows_cols(filename,size):
    manifest = load_manifest(filename)
    return (manifest['json'][size]['rows'], manifest['json'][size]['cols'])

def get_configurations(image_id):
    manifest = load_manifest(image_id)
    return manifest['configurations']

def get_configuration(image_id, config_id):
    manifest = load_manifest(image_id)
    return manifest['configurations'][config_id]

def save_configuration(image_id, configuration):
    manifest = load_manifest(image_id)
    manifest['configurations'].append(configuration)
    save_manifest(image_id, manifest)

    return True
