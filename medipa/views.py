import os
import urllib2
import cStringIO
import json

from flask import Flask, request, make_response, render_template, json, redirect

from flask.ext.celery import Celery

from libmedipa import image_handler

def create_app():
    return Flask("medipa.views")

app = create_app()
app.config.from_pyfile(os.environ['MEDIPA_CELERY_CONFIG'])
celery = Celery(app)


@celery.task(name="medipa_app.process_upload")
def process_file(filename):
    print("Starting to process file")
    image_handler.process_file(filename)

def process_upload(file, upload=True):
    if file and upload:
        success, filename = image_handler.save(file, upload)

        if success:
            process_file.apply_async([filename])
    elif file and not upload:
        file = urllib2.urlopen(request.form['scan_url'])
        success, filename = image_handler.save(file, upload)

        if success:
            process_file.apply_async([filename])
    else:
        return False

@app.route('/', methods=['GET'])
@app.route('/image/', methods=['GET'])
def show_images():
    if request.method == 'GET':
        images = image_handler.get_images()
        
        if 'Http-Accept' in request.headers:
            if request.headers['Http-Accept'] == 'application/json':
                return json.dumps(images)
        else:
            return render_template('images.html', images=images)

@app.route('/image/upload/', methods=['GET', 'POST'])
def upload_image():
    if request.method == 'GET':
        return render_template('upload.html')
    elif request.method == 'POST':
        file = request.files['file']
     
        if file and request.form['scan_url']:
            return render_template('upload.html', warning=True)
        elif file:
            pass
            process_upload(file)
        elif request.form['scan_url']:
            file = urllib2.urlopen(request.form['scan_url'])
            process_upload(file, False)

    return render_template('upload.html', success=True)

@app.route('/image/<image_id>/', methods=['GET'])
def image(image_id):
    size = request.args.get('size', 'x512')
    dimensions = image_handler.get_dimensions(image_id, size)
    rows,cols = image_handler.get_rows_cols(image_id, size)
    to_return = get_image_obj(image_id, size, dimensions, rows, cols)

    response = make_response()
    response.data = json.dumps(to_return)
    response.mimetype = 'application/json'

    return response

@app.route('/image/<image_id>/png/', methods=['GET'])
def image_png(image_id):
    size = request.args.get('size', 'x512')

    response = make_response()
    response.data = image_handler.get_image(image_id, size)
    response.mimetype = 'image/png'

    return response

@app.route('/image/<image_id>/render/', methods=['GET'])
def render(image_id):
    size = request.args.get('size', 'x512')
    dimensions = image_handler.get_dimensions(image_id, size)
    configurations = image_handler.get_configurations(image_id)
    manifest = convert_manifest(image_id, image_handler.load_manifest(image_id))
    return render_template('render.html',
                            manifest=json.dumps(manifest), 
                            dimensions=dimensions, 
                            image_name=image_id, 
                            size=size,
                            configurations=configurations)

@app.route('/image/<image_id>/configuration/<config_id>/', methods=['GET', 'POST'])
def configuration(image_id, config_id):
    if request.method == 'GET':
        to_return = image_handler.get_configuration(image_id, config_id)
    elif request.method == 'POST':
        configuration = request.args.get('config')
        if image_handler.save_configuration(image_id, configuration):
            to_return = { "saved" : True }
        else:
            to_return = { "saved" : False }

    response = make_response()
    response.data = json.dumps(to_return)
    response.mimetype = 'application/json'

    return response


def convert_manifest(image_id, manifest):
    to_ret = []
    for size in ["x512", "x64", "x8", "complete"]:
        obj = manifest["json"][size]
        to_ret.append(get_image_obj(image_id, size, obj['dimensions'], obj['rows'], obj['cols']))
    return to_ret

def get_image_obj(image_id, size, dimensions, rows, cols):
    return { "url" : "/image/" + image_id + "/png/?size=" + size,
            "dimensions" : dimensions, "rows":rows, "cols":cols }
    
