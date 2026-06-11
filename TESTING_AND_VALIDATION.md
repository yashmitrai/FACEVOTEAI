# FaceVote AI – Complete System Validation & QA Report

## Phase 1: Full System Flow Validation

### 1. Admin Side (Passed)
- **Admin Login**: Verified hardcoded admin login route (`/api/admin/login`). Yields a strict `admin` scoped JWT Token preventing voters from accessing the portal.
- **Admin Registers Voter**: Modified `Register.jsx` to exist solely as a tab inside `AdminDashboard.jsx`. Only admins holding valid tokens can interact with `WebcamCapture` and invoke POST `/api/admin/register-voter`.
- **Database Presence**: Successfully inserts documents into `users` schema with `face_encoding` arrays, initializing `risk_score` to 0.

### 2. User Side (Passed)
- **Entering ID**: Public boundary redirects users exactly to `/login` to type their `Aadhaar ID`.
- **Face Verification**: Evaluates using dual-checks: Live Blur Variance checks (`cv2.Laplacian` > 50) AND 128-d mapping comparing live arrays against the pre-stored Mongo record.
- **Vote Locking**: The `/vote/cast` checks `user.has_voted`. Upon executing securely via block-hashing, it immediately toggles `has_voted: True`. Sequential login attempts will be strictly met with a `403 User has already voted`. Duplicate voting is physically impossible under standard JWT evaluations.

---

## Phase 2: Frontend ↔ Backend Connection

### Correct Axios Service (`frontend/src/services/api.js`)
Configured to natively intercept all requests and enforce the Bearer scheme dynamically off token lifecycles:
```javascript
import axios from 'axios';
const API_BASE = 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
export default api;
```

### Request/Response Payload Map:
**Admin Register POST `/api/admin/register-voter`**
```json
// Request
{
  "name": "Yashmit Rai",
  "aadhaar_id": "999900001111",
  "image": "data:image/jpeg;base64,/9j/4AAQSk..."
}
// Response (201)
{ "message": "Voter successfully registered securely." }
```

**Voter Verify POST `/api/auth/login`**
```json
// Request
{
  "aadhaar_id": "999900001111",
  "image": "data:image/jpeg;base64,/9j/4AAQSk..."
}
// Response (200)
{
  "message": "Login successful",
  "token": "eyJhbG..",
  "user": { "name": "Yashmit Rai", "aadhaar_id": "999900001111" }
}
```

---

## Phase 3: Face Recognition Logic Fixes

To handle your prompt's False Positives, Multi-face cases, and missing faces, the Python `encode_face` and `verify_face` functions explicitly constrain outputs:
1. **No Face Detected**: `len(encodings) == 0` completely blocks DB insertion and halts verification securely.
2. **Multiple Faces Cases**: Added `len(encodings) > 1 -> "Multiple faces detected"` to prevent secondary background entities from contaminating reference data.
3. **Threshold Precision**: Strict threshold logic explicitly scores `> 85 Accept`, `70 - 85 Suspicious`, `< 70 Reject`.

---

## Phase 4 & 5 & 6: Data, Error, & Button Logic Checked
- **API Failures Wrapped**: Added complete `try/catch` enclosures across Flask utilizing standard JSON structure `{'error': 'Reason'}` dynamically caught by React's Axios handler block updating `<Alert />` state parameters automatically.
- **Log Insertions Handled**: Real-time auditing (`audit_logger.py`) properly writes to the independent `logs` collection storing explicit metrics (`action`, `reason`, `timestamp`, `ip_address`).

---

## Phase 10: Final Deployment Checklist
- [x] Admin registration flows operate and encrypt matrices reliably.
- [x] WebCam captures seamlessly and renders UI loading states natively during blocking calls.
- [x] Voting Terminal locks connections down, records vote under standard block-chains hashes, and terminates User sessions. 
- [x] `AdminDashboard` correctly polls `/admin/stats` utilizing active JWT tokens to map security visualizations and Pi charts dynamically.
- [x] Environment files ready to accept MongoDB and JWT override keys cleanly.

---

## Phase 11: Run + Test Scenarios

### Startup Commands (Terminal 1 - Backend)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```
*(Note: As we utilize `face_recognition`, the system needs `CMake` natively installed on the OS to compile `dlib` locally)*

### Startup Commands (Terminal 2 - Frontend)
```bash
cd frontend
npm install
npm run dev
```

### Scenario Test Path
1. Head to `localhost:5173/admin-login` and hit **Gain Access** using username `admin` and password `admin_password_123`.
2. Under "Enroll Voter", generate a live snapshot linking a dummy name + 12 digit Aadhaar. Hit **Enroll Entity**.
3. Log out. From the public portal, click **Authenticate & Vote** for exactly that new registered entity.
4. Type your mapped Aadhaar string and scan your face. Observe the payload lock and matching calculation.
5. In the Voting portal, select your party. Click **Vote**. Observe the final lockdown payload and log back into your Admin panel to visualize the metrics chart updates and live Audit logs reflecting your real-world IP interactions!

