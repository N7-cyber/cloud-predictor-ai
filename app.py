from flask import Flask, render_template, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image

app = Flask(__name__)

model = tf.keras.models.load_model('model_awan_rafi_v3.h5')
kelas = ['Cumulonimbus','Cumulus','Stratus']

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['file']

    img = Image.open(file).convert('RGB').resize((150,150))
    img = np.array(img)/255.0
    img = np.expand_dims(img,0)

    pred = model.predict(img)
    idx = np.argmax(pred)
    persen = float(np.max(pred)*100)

    awan = kelas[idx]

    if awan == 'Cumulonimbus':
        cuaca = "Hujan Lebat / Badai ⛈️"
    elif awan == 'Stratus':
        cuaca = "Mendung ☁️"
    else:
        cuaca = "Cerah 🌤️"

    return jsonify({
        'awan': awan,
        'akurasi': f"{persen:.1f}",
        'prediksi': cuaca
    })

if __name__ == '__main__':
    app.run(debug=True)