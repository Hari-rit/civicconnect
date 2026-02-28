from flask import Flask, request, jsonify
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import torch
import os

# -------------------------------
# Flask App Initialization
# -------------------------------
app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -------------------------------
# Load Pretrained BLIP Model
# -------------------------------
print("🔄 Loading BLIP caption model...")

device = "cuda" if torch.cuda.is_available() else "cpu"

processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained(
    "Salesforce/blip-image-captioning-base"
).to(device)

print("✅ BLIP model loaded successfully")

# -------------------------------
# Caption Generation Endpoint
# -------------------------------
@app.route("/generate-caption", methods=["POST"])
def generate_caption():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        image = Image.open(file_path).convert("RGB")

        inputs = processor(image, return_tensors="pt").to(device)
        output = model.generate(**inputs)

        caption = processor.decode(output[0], skip_special_tokens=True)

        return jsonify({
            "caption": caption
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------------
# Run Server
# -------------------------------
if __name__ == "__main__":
    app.run(port=5001, debug=False)