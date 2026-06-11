import jwt
from functools import wraps
from flask import request, jsonify, current_app
import datetime

# PHASE 2: Add JWT configuration with Expiry Times
def generate_token(user_id):
    payload = {
        "user_id": user_id, 
        "role": "voter",
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm="HS256")

def generate_admin_token():
    payload = {
        "user_id": "admin", 
        "role": "admin",
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8)
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm="HS256")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]
            
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired! Please log in again.'}), 401
        except Exception as e:
            return jsonify({'error': 'Token is invalid or corrupted!'}), 401
            
        return f(current_user_id, *args, **kwargs)
    return decorated

# PHASE 6: BACKEND ROUTE PROTECTION
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]
            
        if not token:
            return jsonify({'error': 'Authentication Token is strictly missing!'}), 401
            
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            if data.get('role') != 'admin':
                return jsonify({'error': 'Unauthorized: Admin privileges strictly required!'}), 403
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Admin Session Expired!'}), 401
        except Exception as e:
            return jsonify({'error': 'Token is strictly invalid!'}), 401
            
        return f(*args, **kwargs)
    return decorated
