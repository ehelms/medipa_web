import os
import urllib2

from flask import Flask, request, make_response, render_template, json

from libmedipa import image_handler


app = Flask(__name__)

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

            if image_handler.save(file, false):
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

@app.route('/image/<image_id>/')
def image(image_id):
    return image_id
