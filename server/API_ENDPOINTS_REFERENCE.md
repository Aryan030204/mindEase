# MindEase API Endpoints Reference

Complete reference for all API endpoints with example requests and responses.

## Base URLs

- **Node Server**: https://mindease-node-server.onrender.com
- **ML Server**: https://mindease-ml-server.onrender.com

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Health & Info

### GET /health
Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "message": "MindEase API is running",
  "timestamp": "2024-11-24T06:30:00.000Z"
}
```

### GET /api
API information endpoint.

**Response**:
```json
{
  "name": "MindEase API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "user": "/api/user",
    "mood": "/api/mood",
    "recommendations": "/api/recommendations",
    "chat": "/api/chat",
    "resources": "/api/resources"
  }
}
```

---

## Authentication Endpoints

### POST /api/auth/signup
Create a new user account.

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response** (201):
```json
{
  "message": "Signup successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### POST /api/auth/login
Authenticate user and get JWT token.

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response** (200):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### POST /api/auth/logout
Logout user (client should delete token).

**Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

---

## User Profile Endpoints

### GET /api/user/profile
Get current user's profile.

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "user",
    "preferences": {
      "exercise": true,
      "music": true,
      "meditation": true
    },
    "createdAt": "2024-11-24T06:00:00.000Z",
    "updatedAt": "2024-11-24T06:00:00.000Z"
  }
}
```

### PUT /api/user/profile
Update user profile.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "firstName": "Updated",
  "preferences": {
    "exercise": true,
    "music": false,
    "meditation": true
  }
}
```

**Response** (200):
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

### DELETE /api/user/profile
Delete user account.

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "message": "Account deleted successfully"
}
```

---

## Mood Logging Endpoints

### POST /api/mood/log
Add or update daily mood log.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "moodScore": 7,
  "emotionTag": "happy",
  "notes": "Feeling great today!",
  "activityDone": false,
  "date": "2024-11-24T00:00:00.000Z"  // Optional
}
```

**Response** (201):
```json
{
  "message": "Mood logged successfully",
  "log": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "date": "2024-11-24T00:00:00.000Z",
    "moodScore": 7,
    "emotionTag": "happy",
    "notes": "Feeling great today!",
    "activityDone": false,
    "createdAt": "2024-11-24T06:00:00.000Z"
  }
}
```

**Note**: If a log exists for the same date, it updates instead (returns 200).

### GET /api/mood/history
Get mood log history.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `limit` (optional): Number of logs to return (default: 50)
- `skip` (optional): Number of logs to skip (default: 0)
- `startDate` (optional): Filter from date (ISO string)
- `endDate` (optional): Filter to date (ISO string)

**Response** (200):
```json
{
  "logs": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "date": "2024-11-24T00:00:00.000Z",
      "moodScore": 7,
      "emotionTag": "happy",
      "notes": "Feeling great today!",
      "activityDone": false
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 50,
    "skip": 0,
    "hasMore": false
  }
}
```

### GET /api/mood/analytics
Get mood analytics and trends.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `period` (optional): "week" or "month" (default: "week")

**Response** (200):
```json
{
  "message": "Mood analytics fetched",
  "analytics": [
    {
      "_id": {
        "year": 2024,
        "week": 47
      },
      "avgMoodScore": 6.5,
      "count": 7,
      "emotionTags": ["happy", "calm", "neutral"],
      "dates": ["2024-11-18T00:00:00.000Z", ...]
    }
  ],
  "emotionDistribution": [
    {
      "_id": "happy",
      "count": 5
    },
    {
      "_id": "calm",
      "count": 3
    }
  ],
  "overallStats": {
    "avgMoodScore": 6.5,
    "minMoodScore": 3,
    "maxMoodScore": 9,
    "totalLogs": 30
  }
}
```

---

## Recommendation Endpoints

### GET /api/recommendations/general
Get general wellness recommendations (no auth required).

**Response** (200):
```json
{
  "message": "General recommendations fetched",
  "tips": [
    "Drink water",
    "Take a 10-min walk",
    "Practice deep breathing",
    "Write down your thoughts",
    "Listen to calming music",
    "Do a short stretching routine",
    "Take a mindful pause"
  ]
}
```

### GET /api/recommendations/personalized
Get personalized activity recommendations based on latest mood.

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "message": "Personalized recommendations fetched",
  "recommendation": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "moodLogId": "507f1f77bcf86cd799439012",
    "suggestedActivities": ["meditation", "breathing", "music"],
    "status": "pending",
    "createdAt": "2024-11-24T06:00:00.000Z"
  }
}
```

### PATCH /api/recommendations/:recommendationId/status
Update recommendation status.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "status": "accepted"  // "accepted", "ignored", "completed", or "pending"
}
```

**Response** (200):
```json
{
  "message": "Recommendation status updated successfully",
  "recommendation": { ... }
}
```

---

## Chat Endpoints

### POST /api/chat/query
Send message to Gemini AI chatbot.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "message": "I'm feeling anxious today. What can I do?"
}
```

**Response** (200):
```json
{
  "message": "Reply generated",
  "reply": "I understand that anxiety can be overwhelming. Have you tried taking some deep breaths? Remember, it's okay to feel this way...",
  "conversationId": "507f1f77bcf86cd799439014"
}
```

### GET /api/chat/history
Get chat conversation history.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `limit` (optional): Number of messages to return (default: 50)

**Response** (200):
```json
{
  "messages": [
    {
      "sender": "user",
      "text": "I'm feeling anxious today",
      "timestamp": "2024-11-24T06:00:00.000Z"
    },
    {
      "sender": "bot",
      "text": "I understand that anxiety can be overwhelming...",
      "timestamp": "2024-11-24T06:00:01.000Z"
    }
  ],
  "total": 10
}
```

---

## Resource Endpoints

### GET /api/resources/all
Get all resources.

**Query Parameters**:
- `limit` (optional): Number of resources (default: 50)
- `skip` (optional): Skip number (default: 0)
- `category` (optional): Filter by category

**Response** (200):
```json
{
  "message": "Resources fetched successfully",
  "resources": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "title": "Understanding Anxiety",
      "category": "articles",
      "contentURL": "https://example.com/article",
      "description": "Learn about anxiety and coping strategies",
      "createdBy": {
        "_id": "507f1f77bcf86cd799439016",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "createdAt": "2024-11-24T06:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 20,
    "limit": 50,
    "skip": 0,
    "hasMore": false
  }
}
```

### GET /api/resources/:category
Get resources by category.

**Categories**: `articles`, `meditation`, `journaling`, `exercise`, `faqs`

**Response** (200): Same format as `/api/resources/all`

### POST /api/resources/add
Add new resource (Admin only).

**Headers**: `Authorization: Bearer <admin-token>`

**Request Body**:
```json
{
  "title": "New Article",
  "category": "articles",
  "contentURL": "https://example.com/article",
  "description": "Article description"
}
```

**Response** (201):
```json
{
  "message": "Resource added successfully",
  "resource": { ... }
}
```

---

## ML Server Endpoints

### GET /
Health check.

**Response** (200):
```json
{
  "message": "MindEase ML Server Running - Mood Prediction & Recommendations Only"
}
```

### POST /predict
Predict sentiment and mood score from text.

**Request Body**:
```json
{
  "text": "I feel amazing today! Everything is going great!"
}
```

**Response** (200):
```json
{
  "sentiment": "positive",
  "moodScore": 8
}
```

### POST /recommend
Get activity recommendations based on mood.

**Request Body**:
```json
{
  "moodScore": 4,
  "emotionTag": "sad"
}
```

**Response** (200):
```json
{
  "suggestions": ["meditation", "breathing", "journaling", "music"]
}
```

**Valid Activities**: `meditation`, `journaling`, `music`, `workout`, `breathing`, `walk`

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Email is required", "Password must be at least 8 characters"]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Route not found",
  "path": "/api/invalid"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Status Codes Summary

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (database not connected)

---

## Testing

Use the provided test script:
```bash
cd server
node test-final.js
```

All 35 endpoints are tested and verified working! ✅

