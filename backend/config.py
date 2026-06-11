import os

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://127.0.0.1:27017/facevote")
SECRET_KEY = os.environ.get("SECRET_KEY", "super-secure-jwt-key")
