from flask import Blueprint, request, jsonify
from database import mongo
from utils.jwt_utils import token_required
from utils.audit_logger import log_audit
from bson.objectid import ObjectId
import datetime
import hashlib

vote_bp = Blueprint('vote', __name__)

def generate_vote_hash(previous_hash, party, timestamp_str):
    block_data = f"{previous_hash}{party}{timestamp_str}".encode('utf-8')
    return hashlib.sha256(block_data).hexdigest()

@vote_bp.route('/', methods=['POST'])
@vote_bp.route('/cast', methods=['POST'])
@token_required
def cast_vote(current_user_id):
    data = request.json
    party = data.get('party')
    
    if not party:
        # Check fallback to 'party_id' since previous implementation used it
        party = data.get('party_id')
        if not party:
            return jsonify({'error': 'No party selected'}), 400
    
    user_obj_id = ObjectId(current_user_id)
    user = mongo.db.users.find_one({'_id': user_obj_id})
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    if user.get('has_voted'):
        log_audit('duplicate_vote_attempt', user_id=user_obj_id, aadhaar_id=user.get('aadhaar_id'))
        return jsonify({'error': 'You have already voted'}), 403
        
    last_vote = mongo.db.votes.find_one(sort=[('_id', -1)])
    previous_hash = last_vote['vote_hash'] if last_vote else "0" * 64
    
    timestamp = datetime.datetime.utcnow()
    current_hash = generate_vote_hash(previous_hash, party, timestamp.isoformat())

    # Store vote securely
    mongo.db.votes.insert_one({
        'party': party,
        'timestamp': timestamp,
        'previous_hash': previous_hash,
        'vote_hash': current_hash
    })
    
    mongo.db.users.update_one(
        {'_id': user_obj_id},
        {'$set': {'has_voted': True}}
    )

    log_audit('vote_cast', user_id=user_obj_id, aadhaar_id=user.get('aadhaar_id'), reason='Anonymous vote cast securely')
    return jsonify({'message': 'Vote recorded successfully!'}), 200
