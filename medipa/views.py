import os
import urllib2
import cStringIO

from flask import Flask, request, make_response, render_template, json, redirect

from flask.ext.celery import Celery

from libmedipa import image_handler


app = Flask(__name__)
app.config.from_pyfile('celeryconfig.py')
celery = Celery(app)

@celery.task(name="medipa.add")
def add(x, y):
    return x + y

@app.route('/', methods=['GET'])
def home():
    res = add.apply_async([4, 4])
    response = make_response()
    response.data = res.task_id
    return response

@app.route('/result/<task_id>/', methods=['GET'])
def result(task_id):
    retval = add.AsyncResult(task_id).get(timeout=1.0)
    response = make_response()
    response.data = str(retval)
    return response

@app.route('/image/upload/', methods=['GET', 'POST'])
def upload_image():
    if request.method == 'GET':
        return render_template('upload.html')
    elif request.method == 'POST':
        file = request.files['file']
     
        if file and request.form['scan_url']:
            return render_template('upload.html', warning=True)
        elif file:
            if image_handler.save(file):
                return render_template('upload.html', success=True)
        elif request.form['scan_url']:
            file = urllib2.urlopen(request.form['scan_url'])

            if image_handler.save(file, False):
                return render_template('upload.html', success=True)
        return render_template('upload.html', error=True)

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
    response.data = image_handler.get_json(image_id, size)
    response.headers['Content-Encoding'] = 'gzip'
    response.headers['Content-Length'] = str(len(response.data))
    response.mimetype = 'text/json'

    return response

@app.route('/image/<image_id>/render/', methods=['GET'])
def render(image_id):
    size = request.args.get('size', 'x512')
    dimensions = image_handler.get_dimensions(image_id, size)
    
    return render_template('render.html', dimensions=dimensions, image_name=image_id)
