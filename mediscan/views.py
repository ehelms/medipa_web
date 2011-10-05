import os

from flask import Flask, request, make_response, render_template

from werkzeug import secure_filename


UPLOAD_FOLDER = os.path.dirname(os.path.abspath(__file__)) + '/media/'
ALLOWED_EXTENSIONS = set(['txt'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_files(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/image/upload/', methods=['GET'])
def upload_image():
    if request.method == 'GET':
        return render_template('templates/upload.html')

@app.route('/image/', methods=['GET', 'PUT'])
def show_images():
    if request.method == 'GET':
        resp = make_response(200)
        resp.data = "Images!"
        return render_template('templates/images.html')
    elif request.method == 'PUT':
        file = request.files['file']
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return 'Sucessfully uploaded file'


@app.route('/image/<image_id>/')
def image(image_id):
    return image_id
