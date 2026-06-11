from flask_pymongo import PyMongo
import certifi

mongo = PyMongo()

def init_db(app):
    # Simple init for local MongoDB
    mongo.init_app(app)
    # Confirm connection on start
    with app.app_context():
        try:
            mongo.db.command('ping')
            print(" ✅ Successfully connected to MongoDB Atlas (facevoteDB)")
        except Exception as e:
            print(f" ❌ Failed to connect to MongoDB: {str(e)}")
