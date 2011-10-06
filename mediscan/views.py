import os

from flask import Flask, request, make_response, render_template, json

from werkzeug import secure_filename


UPLOAD_FOLDER = os.path.dirname(os.path.abspath(__file__)) + '/media/'
ALLOWED_EXTENSIONS = set(['txt'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_files(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/image/upload/', methods=['GET', 'POST'])
def upload_image():
    if request.method == 'GET':
        return render_template('upload.html')
    elif request.method == 'POST':
        file = request.files['file']
        
        if file and allowed_files(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return render_template('upload.html', success=True)
        else:
            return render_template('upload.html', error=True)

@app.route('/image/', methods=['GET'])
def show_images():
    if request.method == 'GET':
        images = os.listdir(UPLOAD_FOLDER)
        for image in images:
            if not allowed_files(image):
                images.remove(image)
        
        if 'Http-Accept' in request.headers:
            if request.headers['Http-Accept'] == 'application/json':
                return json.dumps(images)
        else:
            return render_template('images.html', images=images)

@app.route('/image/<image_id>/')
def image(image_id):
    return image_id
