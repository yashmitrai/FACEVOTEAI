from flask import Flask, Blueprint
from flask_cors import CORS
from database import init_db
import os
from pymongo import MongoClient
import certifi
import ssl
from routes.auth_routes import auth_bp
from routes.vote_routes import vote_bp
from routes.admin_routes import admin_bp

app = Flask(__name__)

# Use local MongoDB (Atlas requires OpenSSL which macOS LibreSSL doesn't support)
MONGO_URI = "mongodb://127.0.0.1:27017/facevoteDB"
client = MongoClient(MONGO_URI)
db = client["facevoteDB"]

# connection test
try:
    client.admin.command('ping')
    print("✅ MongoDB Connected Successfully")
except Exception as e:
    print("❌ MongoDB Connection Failed:", e)

# PHASE 7: CORS FIX - Explicitly allow localhost:5173/5174 and all Headers
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"]}}, supports_credentials=True, allow_headers=["Content-Type", "Authorization"])


app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'super_secure_admin_jwt_key_2026')
app.config['MONGO_URI'] = MONGO_URI

# Initialize DB connection dynamically
init_db(app)

# Register central route prefixes
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(vote_bp, url_prefix='/api/vote')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

@app.route('/')
def home():
    return "FaceVote AI Backend Operational."

if __name__ == '__main__':
    app.run(debug=True, port=8000, host="0.0.0.0")
