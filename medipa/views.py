import os
import urllib2
import cStringIO

from flask import Flask, request, make_response, render_template, json, redirect

from flask.ext.celery import Celery

from libmedipa import image_handler


app = Flask(__name__)
app.config.from_pyfile('celeryconfig.py')
celery = Celery(app)

@celery.task(name="medipa.process_upload")
def process_file(filename):
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

@app.route('/image/', methods=['GET'])
def show_images():
    if request.method == 'GET':
        images = image_handler.get_images()
        
        if 'Http-Accept' in request.headers:
            if request.headers['Http-Accept'] == 'application/json':
                return json.dumps(images)
        else:
            return render_template('images.html', images=images)

@app.route('/image/<image_id>/', methods=['GET'])
def image(image_id):
    size = request.args.get('size', 'x512')

    response = make_response()
    response.data = image_handler.get_image(image_id, size)
    response.mimetype = 'image/png'

    return response

@app.route('/image/<image_id>/render/', methods=['GET'])
def render(image_id):
    size = request.args.get('size', 'x512')
    dimensions = image_handler.get_dimensions(image_id, size)
    
    return render_template('render.html', dimensions=dimensions, image_name=image_id)
