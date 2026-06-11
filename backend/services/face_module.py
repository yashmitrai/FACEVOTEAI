import face_recognition
import base64
import numpy as np
import cv2

def b64_to_image(b64_string):
    if ',' in b64_string:
        b64_string = b64_string.split(',')[1]
    img_data = base64.b64decode(b64_string)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def check_liveness(bgr_img):
    gray = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2GRAY)
    variance_of_laplacian = cv2.Laplacian(gray, cv2.CV_64F).var()
    if variance_of_laplacian < 20.0: # relaxed to avoid false rejections
        return False, f"Spoof detected: Flat/blurry surface."
    return True, "Liveness passed"

def preprocess_image(bgr_img):
    # Resize image to reasonable limits to improve speed and standardization
    h, w = bgr_img.shape[:2]
    max_dim = 800
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        bgr_img = cv2.resize(bgr_img, (int(w * scale), int(h * scale)))
        
    # Convert to YUV to normalize lighting (histogram equalization on Y channel)
    yuv = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2YUV)
    yuv[:,:,0] = cv2.equalizeHist(yuv[:,:,0])
    bgr_img = cv2.cvtColor(yuv, cv2.COLOR_YUV2BGR)
    
    # Convert to RGB
    rgb_img = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2RGB)
    return rgb_img

def encode_face(image_b64):
    try:
        bgr_img = b64_to_image(image_b64)
        rgb_img = preprocess_image(bgr_img)
        
        # Check liveness structurally on register to prevent fake enrollment
        is_live, liveness_msg = check_liveness(bgr_img)
        if not is_live:
            return None, liveness_msg
            
        encodings = face_recognition.face_encodings(rgb_img)
        
        if len(encodings) == 0:
            return None, "No face detected"
        if len(encodings) > 1:
            return None, "Multiple faces detected. Please make sure only one face is visible."
            
        return encodings[0].tolist(), None
    except Exception as e:
        return None, f"Image processing error: {str(e)}"

def verify_faces(live_images_b64, stored_encoding_list):
    """
    Accepts a list of base-64 frames, preprocesses, captures encodings,
    and returns an average confidence mapping mapping the logic:
    >70 -> Accept
    60-70 -> Accept with warning
    <60 -> Reject
    """
    total_confidence = 0
    valid_frames = 0
    errors = []
    
    if not isinstance(live_images_b64, list):
        live_images_b64 = [live_images_b64]
        
    stored_encoding = np.array(stored_encoding_list)
    print(f"DEBUG: Processing {len(live_images_b64)} frames for verification.")
    
    for image_b64 in live_images_b64:
        try:
            bgr_img = b64_to_image(image_b64)
            rgb_img = preprocess_image(bgr_img)
            
            encodings = face_recognition.face_encodings(rgb_img)
            if len(encodings) == 0:
                errors.append("No face detected in live feed.")
                continue
            if len(encodings) > 1:
                errors.append("Multiple faces detected. Please make sure only one face is visible.")
                continue
                
            live_encoding = encodings[0]
            distance = face_recognition.face_distance([stored_encoding], live_encoding)[0]
            
            # Map distance (0.0 to 1.0) to confidence (100 to 0)
            confidence = max(0.0, 100.0 - (distance * 100.0))
            
            print(f"DEBUG [Frame]: Distance={distance:.4f}, Confidence={confidence:.2f}")
            
            total_confidence += confidence
            valid_frames += 1
        except Exception as e:
            errors.append(str(e))
            
    if valid_frames == 0:
        return "REJECT", 0, "Frames invalid: " + " | ".join(set(errors))
        
    avg_confidence = total_confidence / valid_frames
    print(f"DEBUG [Final]: Average Confidence across {valid_frames} valid frame(s): {avg_confidence:.2f}")
    
    if avg_confidence > 70:
        return "ACCEPT", avg_confidence, "Verified"
    elif 60 <= avg_confidence <= 70:
        return "ACCEPT", avg_confidence, "Low confidence – please improve lighting"
    else:
        return "REJECT", avg_confidence, "Face mismatch"
