# MindEase API Testing Guide

## Prerequisites

1. **Backend Server (Node.js)**
   - MongoDB must be running
   - Environment variables configured in `.env`
   - Install dependencies: `cd server && npm install`

2. **ML Server (Python)**
   - Python 3.8+ installed
   - Install dependencies: `cd ML && pip install -r requirements.txt`
   - ML models should be in `ML/app/models/` (optional - fallback available)

## Starting the Servers

### Start Backend Server
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

### Start ML Server
```bash
cd ML
uvicorn app.main:app --reload --port 8000
# ML Server runs on http://localhost:8000
```

## Running Tests

### Test Backend APIs
```bash
cd server
node test-api.js
```

### Test ML Server Only
```bash
cd ML
python test-ml-server.py
```

## Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/mindease
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
ML_SERVER_URL=http://localhost:8000
AI_CHAT_API_URL=http://localhost:8000/chat
```

## API Endpoints

### Health & Info
- `GET /health` - Health check
- `GET /api` - API information

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Profile
- `GET /api/user/profile` - Get user profile (auth required)
- `PUT /api/user/profile` - Update user profile (auth required)
- `DELETE /api/user/profile` - Delete account (auth required)

### Mood Logging
- `POST /api/mood/log` - Add mood log (auth required)
- `GET /api/mood/history` - Get mood history (auth required)
- `GET /api/mood/analytics` - Get mood analytics (auth required)

### Recommendations
- `GET /api/recommendations/personalized` - Get personalized recommendations (auth required)
- `GET /api/recommendations/general` - Get general wellness tips
- `PATCH /api/recommendations/:id/status` - Update recommendation status (auth required)

### Chat
- `POST /api/chat/query` - Send chat message (auth required)
- `GET /api/chat/history` - Get chat history (auth required)

### Resources
- `GET /api/resources/all` - Get all resources
- `GET /api/resources/:category` - Get resources by category
- `POST /api/resources/add` - Add resource (admin only)

## ML Server Endpoints

- `GET /` - Health check
- `POST /predict` - Sentiment prediction
- `POST /recommend` - Activity recommendations

## Common Issues

1. **Connection Refused**: Make sure both servers are running
2. **MongoDB Connection Error**: Ensure MongoDB is running and MONGO_URI is correct
3. **ML Models Not Found**: The ML server will use fallback logic if models are missing
4. **CORS Errors**: Check CLIENT_URL in .env matches your frontend URL

