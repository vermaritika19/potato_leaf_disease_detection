
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import os
import io

app = Flask(__name__)

CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "potato_cnn_model.keras"
)

class_names = [
    "Potato___Early_blight",
    "Potato___healthy",
    "Potato___Late_blight"
]

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("CNN Model Loaded Successfully!")

except Exception as e:
    print("Model Loading Error:", str(e))
    raise


IMG_SIZE = (256, 256)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "success",
        "message": "Potato Leaf Disease Detection API is running"
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "success",
        "message": "Backend is working properly",
        "model_loaded": model is not None
    })


@app.route("/predict", methods=["POST"])
def predict():

    try:

        if "image" not in request.files:
            return jsonify({
                "status": "error",
                "message": "No image uploaded"
            }), 400

        file = request.files["image"]

        if file.filename == "":
            return jsonify({
                "status": "error",
                "message": "No file selected"
            }), 400

        image = Image.open(file.stream).convert("RGB")

        image = image.resize(IMG_SIZE)

        image_array = np.array(image)

        image_array = image_array.astype("float32")

        image_array = image_array / 255.0

        image_array = np.expand_dims(
            image_array,
            axis=0
        )

        predictions = model.predict(
            image_array,
            verbose=0
        )

        predicted_index = int(np.argmax(predictions[0]))

        predicted_class = class_names[predicted_index]

        confidence = float(
            predictions[0][predicted_index] * 100
        )

        probabilities = {
            class_names[i]: float(predictions[0][i] * 100)
            for i in range(len(class_names))
        }

        return jsonify({
            "status": "success",
            "prediction": predicted_class,
            "confidence": round(confidence, 2),
            "probabilities": probabilities
        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == "__main__":

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )
