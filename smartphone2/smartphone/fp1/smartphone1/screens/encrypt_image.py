from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, storage
from cryptography.fernet import Fernet
import os
import io

app = Flask(__name__)

# 🔹 Firebase Setup
cred = credentials.Certificate("flask-backend/final-94fec-firebase-adminsdk-iltua-d0b15e7c17.json")
firebase_admin.initialize_app(cred, {"storageBucket": "final-94fec.appspot.com"})
bucket = storage.bucket()

# 🔹 Encryption Key (Store securely in a file)
KEY_FILE = "encryption_key.txt"

if os.path.exists(KEY_FILE):
    with open(KEY_FILE, "rb") as f:
        key = f.read()
else:
    key = Fernet.generate_key()
    with open(KEY_FILE, "wb") as f:
        f.write(key)

cipher = Fernet(key)

@app.route('/encrypt', methods=['POST'])
def encrypt_image():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"}), 400

    file = request.files['file']
    file_name = file.filename

    # Read file into memory
    original_data = file.read()
    encrypted_data = cipher.encrypt(original_data)

    # Upload encrypted file to Firebase
    blob = bucket.blob(f"encrypted/{file_name}")
    blob.upload_from_string(encrypted_data)

    encrypted_url = blob.public_url

    return jsonify({"success": True, "encrypted_image_uri": encrypted_url})

@app.route('/decrypt', methods=['POST'])
def decrypt_image():
    if 'file_url' not in request.json:
        return jsonify({"success": False, "error": "No file URL provided"}), 400

    file_url = request.json['file_url']

    try:
        # Download the encrypted file from Firebase
        blob = bucket.blob(file_url)
        encrypted_data = blob.download_as_bytes()

        # Decrypt the data
        decrypted_data = cipher.decrypt(encrypted_data)

        # Save the decrypted image temporarily (optional)
        decrypted_image_path = f"temp_decrypted_{os.path.basename(file_url)}"
        with open(decrypted_image_path, "wb") as f:
            f.write(decrypted_data)

        return jsonify({"success": True, "decrypted_image_path": decrypted_image_path})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)