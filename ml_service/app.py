from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import cv2
import os

from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras import layers, models

# -------------------------------
# Flask app initialization
# -------------------------------
app = Flask(__name__)

# Create uploads folder if not exists
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -------------------------------
# Class names (same as training)
# -------------------------------
CLASS_NAMES = [
    "potholes_and_roadcracks",
    "damaged_roadsigns",
    "garbage",
    "damaged_electrical_poles",
    "water_leakage"
]

IMAGE_SIZE = (224, 224)

# -------------------------------
# Rebuild model architecture
# -------------------------------
base_model = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

base_model.trainable = False

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(128, activation="relu"),
    layers.Dropout(0.5),
    layers.Dense(len(CLASS_NAMES), activation="softmax")
])

# -------------------------------
# Load trained weights
# -------------------------------
model.load_weights(
    "model/civicconnect_mobilenetv2_model.keras"
)

print("✅ Model architecture rebuilt and weights loaded successfully")

# -------------------------------
# Image preprocessing function
# -------------------------------
def preprocess_image(image_path):
    image = cv2.imread(image_path)

    if image is None:
        raise ValueError("Invalid image file")

    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, IMAGE_SIZE)
    image = tf.keras.applications.mobilenet_v2.preprocess_input(image)
    image = np.expand_dims(image, axis=0)
    return image

# -------------------------------
# Prediction endpoint
# -------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        image = preprocess_image(file_path)
        predictions = model.predict(image)

        class_index = int(np.argmax(predictions))
        confidence = float(np.max(predictions))

        return jsonify({
            "issueType": CLASS_NAMES[class_index],
            "confidence": confidence
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------------------
# Run server
# -------------------------------
if __name__ == "__main__":
    app.run(port=5001, debug=True)
