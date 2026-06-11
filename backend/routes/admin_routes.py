from flask import Blueprint, jsonify, request
from database import mongo
from utils.jwt_utils import admin_required, generate_admin_token
from services.face_module import encode_face
from utils.audit_logger import log_audit
import datetime

admin_bp = Blueprint('admin', __name__)

# PHASE 2: Hardcode exact credentials
ADMIN_EMAIL = "admin@eci.com"
ADMIN_PASSWORD = "admin123"

@admin_bp.route('/login', methods=['POST'])
def admin_login():
    print("HEADERS:", request.headers)
    print("RAW DATA:", request.data)
    print("JSON:", request.json)

    data = request.json
    if not data:
        return jsonify({"error": "No JSON received"}), 400

    email = data.get("email")
    password = data.get("password")

    print("EMAIL:", email)
    print("PASSWORD:", password)

    if email == ADMIN_EMAIL and password == ADMIN_PASSWORD:
        token = generate_admin_token()
        try:
            log_audit('admin_login_success', reason=f'Authorized login for {email}')
        except:
            pass
        return jsonify({'token': token}), 200

    try:
        log_audit('admin_login_failed', reason=f'Invalid attempt on {email}')
    except:
        pass
    return jsonify({"error": "Invalid credentials"}), 401

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    total_votes = mongo.db.votes.count_documents({})
    
    pipeline = [{"$group": {"_id": "$party", "count": {"$sum": 1}}}]
    votes_by_party_raw = list(mongo.db.votes.aggregate(pipeline))
    
    parties = {"DMK": 0, "AIADMK": 0, "BJP": 0, "TVK": 0}
    
    for v in votes_by_party_raw:
        party_name = v['_id']
        if party_name in parties:
            parties[party_name] = v['count']
        elif party_name:
            if party_name == '1': parties['DMK'] += v['count']
            if party_name == '2': parties['AIADMK'] += v['count']
            if party_name == '3': parties['BJP'] += v['count']
            if party_name == '4': parties['TVK'] += v['count']

    fraud_attempts = mongo.db.logs.count_documents({"action": {"$in": ["login_failed", "duplicate_vote_attempt", "login_blocked", "login_suspicious"]}})

    users_raw = mongo.db.users.find({}).sort("created_at", -1)
    user_list = []
    for u in users_raw:
        user_list.append({
            'id': str(u['_id']),
            'name': u.get('name'),
            'aadhaar_id': u.get('aadhaar_id'),
            'has_voted': u.get('has_voted'),
            'risk_score': u.get('risk_score', 0)
        })

    return jsonify({
        'total_votes': total_votes,
        'parties': parties,
        'fraudAttempts': fraud_attempts,
        'users': user_list
    })

@admin_bp.route('/register-voter', methods=['POST'])
@admin_required
def register_voter():
    print("DEBUG: [Admin Register] Incoming request JSON:", request.json)
    data = request.json
    if not data:
        print("DEBUG: [Admin Register] No JSON received")
        return jsonify({"error": "No JSON received"}), 400

    name = data.get('name')
    aadhaar_id = data.get('aadhaar_id')
    image_data = data.get('image')

    print(f"DEBUG: [Admin Register] Fields: Name={name}, Aadhaar ID={aadhaar_id}, ImageExists={bool(image_data)}")

    if not name or not aadhaar_id or not image_data:
        return jsonify({'error': 'Missing required fields: name, aadhaar_id, or image'}), 400

    # PHASE 4: DUPLICATE AADHAAR CHECK
    existing_user = mongo.db.users.find_one({'aadhaar_id': aadhaar_id})
    if existing_user:
        print(f"DEBUG: [Admin Register] Duplicate Aadhaar found: {aadhaar_id}")
        return jsonify({'error': 'User already exists with this Aadhaar ID'}), 400

    # Ensure we get a single base64 string from what could be an array (multi-frame)
    image_b64 = image_data[0] if isinstance(image_data, list) else image_data

    # PHASE 2 & 3: FACE ENCODING (handled in face_module)
    encoding, error = encode_face(image_b64)
    if error:
        print(f"DEBUG: [Admin Register] Encoding failed: {error}")
        return jsonify({'error': error}), 400

    # PHASE 5: DATABASE INSERT
    new_user = {
        'name': name,
        'aadhaar_id': aadhaar_id,
        'face_encoding': encoding,
        'has_voted': False,
        'role': 'voter',
        'risk_score': 0,
        'failed_attempts': 0,
        'created_at': datetime.datetime.utcnow()
    }
    
    result = mongo.db.users.insert_one(new_user)
    print(f"DEBUG: [Admin Register] Success: User inserted with ID {result.inserted_id}")
    try:
        log_audit('admin_register_success', user_id=result.inserted_id, aadhaar_id=aadhaar_id)
    except:
        pass
    
    return jsonify({'message': 'Voter successfully registered.'}), 201

from bson.objectid import ObjectId

@admin_bp.route('/delete-user/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    try:
        obj_id = ObjectId(user_id)
    except:
        return jsonify({'error': 'Invalid User ID format'}), 400
        
    user = mongo.db.users.find_one({'_id': obj_id})
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    mongo.db.users.delete_one({'_id': obj_id})
    
    # We do not delete votes here logically since voting is anonymous and irreversible in typical blockchain concepts, but taking the prompt's recommendation:
    # Actually, votes.user_id is not stored. "Anonymous vote cast securely". We just delete the user.
    
    try:
        log_audit('admin_deleted_user', reason=f'Deleted voter {user.get("aadhaar_id")}')
    except:
        pass
        
    return jsonify({'message': 'User deleted successfully'}), 200
