import firebase_admin
from firebase_admin import credentials

print("📌 Firebase script started...")  # Debugging step

# Service account file ka path
cred = credentials.Certificate("flask-backend/final-94fec-firebase-adminsdk-iltua-d0b15e7c17.json")

print("✅ Credentials loaded successfully!")  # Debugging step

# Firebase initialize karein
firebase_admin.initialize_app(cred)

print("🔥 Firebase Initialized Successfully!")  # Debugging step
