# FaceVote AI – Biometric Voting System

A full-stack AI-based secure voting system built with the MERN stack and a Python AI microservice.

This project simulates an Election Commission of India voting interface for academic/demo purposes.

## System Architecture

The project is structured into three main services:

1. **`frontend/` (React + Vite)**: The user interface where voters register, authenticate, and cast their votes. It also includes an admin dashboard. Uses `react-webcam` for face capture.
2. **`backend/` (Node.js + Express + MongoDB)**: The core API that handles user data, securely stores votes, checks for duplicates, and logs fraud attempts.
3. **`ai-service/` (Python + Flask)**: A microservice utilizing `face_recognition` to compute facial encodings during registration and compare them for verification during voting.

## Core Features

* **Biometric Registration**: Captures voter faces and securely saves face embeddings.
* **Identity Verification**: Live face scan verified against stored encodings (matching > 70% confidence required).
* **Secure Voting**: Prevents duplicate voting with database locks and IP tracking.
* **Fraud Prevention Logging**: Records any suspicious activity (e.g., failed face match) as a fraud attempt.
* **Admin Dashboard**: Live visualization of election results and fraud alerts utilizing `Chart.js`.

---

## Instructions to Run Locally

### Prerequisites
* **Node.js**: v18+ recommended
* **Python**: v3.8+ recommended
* **MongoDB**: Make sure you have a local MongoDB instance running on `mongodb://127.0.0.1:27017` or update the connection string in `backend/server.js`.
* CMake and C++ Build Tools (Required to install Python `dlib`, which `face_recognition` depends on).

### 1. Setup the AI Microservice (Python)
Open a new terminal:
```bash
cd ai-service
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask server (runs on port 8000)
python app.py
```

### 2. Setup the Backend (Node.js)
Open a new terminal:
```bash
cd backend

# Install dependencies
npm install

# Start the server (runs on port 5000)
npm run dev
```

### 3. Setup the Frontend (React)
Open a new terminal:
```bash
cd frontend

# Install dependencies (already executed if following setup but good practice)
npm install

# Start the Vite development server (runs on port 5173)
npm run dev
```

## Using the Demo

1. Open your browser and navigate to the frontend URL (usually `http://localhost:5173`).
2. **Register**: Go to the Registration page, enter a dummy Name and Aadhaar ID, and allow webcam access. Click 'Capture & Register'.
3. **Authenticate**: Navigate to the Auth page, enter your Aadhaar ID and verify your identity via the webcam.
4. **Vote**: If authentication is successful, you will be directed to the EVM dashboard to vote for a party.
5. **Admin**: Navigate to `http://localhost:5173/admin` to view live voting statistics and logged fraud attempts.

## Deployment Notes
- **Frontend**: Can be easily deployed to Vercel or Netlify. Make sure to update the hardcoded API URLs from `localhost` to the deployed backend domains.
- **Backend**: Can be deployed on Render or Railway. Set the `PORT` and MongoDB URL via environment variables.
- **AI Service**: Render's Docker environments are ideal since `dlib` requires system-level C++ compilers. Provide a `Dockerfile` that installs `cmake` and builds the service.
