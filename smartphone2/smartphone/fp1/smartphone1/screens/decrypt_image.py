import os
import base64
from flask import Flask, request, jsonify, send_file
from google.cloud import storage
from Crypto.Cipher import AES

app = Flask(__name__)

# 🔹 Firebase Storage Client
storage_client = storage.Client()
BUCKET_NAME = "final-94fec.appspot.com"  # Apni Firebase bucket ka naam likho
ENCRYPTION_KEY = b"your-32-byte-encryption-key"  # 🔑 Apna AES key yahan dalna

def decrypt_image(encrypted_data):
    """AES decryption"""
    cipher = AES.new(ENCRYPTION_KEY, AES.MODE_ECB)
    decrypted_data = cipher.decrypt(encrypted_data)
    return decrypted_data.rstrip(b"\0")  # Remove padding

import os
import base64
from flask import Flask, request, jsonify, send_file
from google.cloud import storage
from Crypto.Cipher import AES
import io

app = Flask(__name__)

# 🔹 Firebase Storage Client
storage_client = storage.Client()
BUCKET_NAME = "final-94fec.appspot.com"  # Apni Firebase bucket ka naam likho
ENCRYPTION_KEY = b"your-32-byte-encryption-key"  # 🔑 Apna AES key yahan dalna

def decrypt_image(encrypted_data):
    """AES decryption with padding handling"""
    cipher = AES.new(ENCRYPTION_KEY, AES.MODE_ECB)
    decrypted_data = cipher.decrypt(encrypted_data)
    return decrypted_data.rstrip(b"\0")  # Remove padding

@app.route("/decrypt", methods=["POST"])
def decrypt():
    try:
        data = request.json
        file_path = data.get("file_path")  # Firebase Storage ka path

        if not file_path:
            return jsonify({"success": False, "error": "File path is required"}), 400

        # 🔹 Firebase se encrypted image fetch karna
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(file_path)
        encrypted_data = blob.download_as_bytes()

        # 🔹 Image decrypt karna
        decrypted_data = decrypt_image(encrypted_data)

        # 🔹 Send decrypted image as byte stream (instead of saving as temp file)
        return send_file(io.BytesIO(decrypted_data), mimetype="image/jpeg")

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
