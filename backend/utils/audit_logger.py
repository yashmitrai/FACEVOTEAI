import datetime
from database import mongo
from flask import request

def log_audit(action, user_id=None, aadhaar_id=None, confidence_score=None, reason=None):
    """
    Logs critical actions to the 'logs' collection securely.
    """
    ip_address = request.remote_addr if request else "0.0.0.0"
    
    log_entry = {
        'action': action, # e.g., 'login_success', 'login_failed', 'vote_cast', 'suspicious_activity'
        'ip_address': ip_address,
        'timestamp': datetime.datetime.utcnow(),
    }
    
    if user_id:
        log_entry['user_id'] = user_id
    if aadhaar_id:
        log_entry['aadhaar_id'] = aadhaar_id
    if confidence_score is not None:
        log_entry['confidence_score'] = confidence_score
    if reason:
        log_entry['reason'] = reason
        
    mongo.db.logs.insert_one(log_entry)

def evaluate_fraud_risk(user, ip_address):
    """
    Evaluates dynamic risk score based on failed attempts and IP mismatches.
    Returns (blocked: bool, reason: str, new_risk_score: int)
    """
    if not user:
        return False, None, 0
        
    risk_score = user.get('risk_score', 0)
    failed_attempts = user.get('failed_attempts', 0)
    last_failed_time = user.get('last_failed_time')
    
    # 1. Rapid repeated attempts blocked
    if last_failed_time and failed_attempts >= 3:
        time_diff = (datetime.datetime.utcnow() - last_failed_time).total_seconds()
        if time_diff < 300: # Blocked for 5 minutes
            return True, "Account temporarily locked due to rapid failed attempts.", risk_score
            
    # 2. IP Mismatch (Suspicious)
    last_ip = user.get('last_ip_address')
    if last_ip and last_ip != ip_address:
        risk_score += 20
        
    return False, None, risk_score
