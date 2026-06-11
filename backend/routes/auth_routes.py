from flask import Blueprint, request, jsonify
from database import mongo
from services.face_module import encode_face, verify_faces
from utils.jwt_utils import generate_token
from utils.audit_logger import log_audit, evaluate_fraud_risk
import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    name, aadhaar_id, image_b64 = data.get('name'), data.get('aadhaar_id'), data.get('image')

    if not name or not aadhaar_id or not image_b64:
        return jsonify({'error': 'Missing data'}), 400

    if mongo.db.users.find_one({'aadhaar_id': aadhaar_id}):
        return jsonify({'error': 'User already registered'}), 400

    encoding, error = encode_face(image_b64)
    if error:
        log_audit('register_failed', aadhaar_id=aadhaar_id, reason=error)
        return jsonify({'error': error}), 400

    new_user = {
        'name': name,
        'aadhaar_id': aadhaar_id,
        'face_encoding': encoding,
        'has_voted': False,
        'role': 'voter',
        'risk_score': 0,
        'failed_attempts': 0,
        'last_ip_address': request.remote_addr,
        'created_at': datetime.datetime.utcnow()
    }
    
    result = mongo.db.users.insert_one(new_user)
    log_audit('register_success', user_id=result.inserted_id, aadhaar_id=aadhaar_id)
    return jsonify({'message': 'Registration successful'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    aadhaar_id, image_b64 = data.get('aadhaar_id'), data.get('image')
    ip_address = request.remote_addr
    
    if not aadhaar_id or not image_b64:
        return jsonify({'error': 'Missing data'}), 400

    user = mongo.db.users.find_one({'aadhaar_id': aadhaar_id})
    if not user:
        log_audit('login_failed', aadhaar_id=aadhaar_id, reason='User not found')
        return jsonify({'error': 'User not found'}), 404
        
    # Evaluate Fraud Risk
    is_blocked, block_reason, updated_risk = evaluate_fraud_risk(user, ip_address)
    
    if is_blocked:
        log_audit('login_blocked', user_id=user['_id'], aadhaar_id=aadhaar_id, reason=block_reason)
        return jsonify({'error': block_reason}), 403

    if user['has_voted']:
        log_audit('duplicate_vote_attempt', user_id=user['_id'], aadhaar_id=aadhaar_id, reason="User tried logging in after voting")
        return jsonify({'error': 'User has already voted'}), 403

    # Update risk in db if it changed from evaluate_fraud_risk
    if updated_risk != user.get('risk_score', 0):
        mongo.db.users.update_one({'_id': user['_id']}, {'$set': {'risk_score': updated_risk}})

    # Verify Logic
    status, confidence, msg = verify_faces(image_b64, user['face_encoding'])
    
    if status == "REJECT":
        # Handle Failure
        new_risk = user.get('risk_score', 0) + 10
        new_fails = user.get('failed_attempts', 0) + 1
        
        mongo.db.users.update_one(
            {'_id': user['_id']},
            {'$set': {
                'failed_attempts': new_fails, 
                'risk_score': new_risk,
                'last_failed_time': datetime.datetime.utcnow(),
                'last_ip_address': ip_address
            }}
        )
        
        log_audit('login_failed', user_id=user['_id'], aadhaar_id=aadhaar_id, confidence_score=confidence, reason=msg)
        return jsonify({'error': f'{msg} (Score: {confidence:.2f}%)'}), 401
    
    # Success (Status == ACCEPT)
    # Reset fail counters
    mongo.db.users.update_one(
        {'_id': user['_id']},
        {'$set': {
            'failed_attempts': 0,
            'last_ip_address': ip_address
        }}
    )

    log_audit('login_success', user_id=user['_id'], aadhaar_id=aadhaar_id, confidence_score=confidence, reason=msg)
    token = generate_token(str(user['_id']))
    return jsonify({
        'message': f"{msg} (Score: {confidence:.2f}%)",
        'token': token,
        'user': {'name': user['name'], 'aadhaar_id': user['aadhaar_id']}
    }), 200
