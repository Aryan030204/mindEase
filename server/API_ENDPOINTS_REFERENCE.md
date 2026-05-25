# MindEase API Endpoints Reference

This file reflects the current Express API mounted from [app.js](</e:/FULL STACK/sem7/Final year Project/app/server/src/app.js>).

Base path:
- local: `http://localhost:8080`
- production: depends on deployment

Protected endpoints require:

```http
Authorization: Bearer <jwt-token>
```

## Health

### GET /health

Response:
```json
{
  "status": "ok",
  "message": "MindEase API is running",
  "timestamp": "2026-05-25T10:00:00.000Z"
}
```

### GET /api

Response:
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
    "resources": "/api/resources",
    "patterns": "/api/patterns"
  }
}
```

## Auth

### POST /api/auth/signup

Body:
```json
{
  "firstName": "Raj",
  "lastName": "Sharma",
  "email": "raj@example.com",
  "password": "Raj@123456"
}
```

Response:
```json
{
  "message": "Signup successful",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "firstName": "Raj",
    "lastName": "Sharma",
    "email": "raj@example.com",
    "role": "user"
  }
}
```

### POST /api/auth/login

Body:
```json
{
  "email": "raj@example.com",
  "password": "Raj@123456"
}
```

### POST /api/auth/logout

### POST /api/auth/forgot-password/send-code

Body:
```json
{
  "email": "raj@example.com"
}
```

### POST /api/auth/forgot-password/reset

Body:
```json
{
  "email": "raj@example.com",
  "otp": "123456",
  "newPassword": "Raj@654321"
}
```

## User

### GET /api/user/profile

Returns current profile and preferences.

### PUT /api/user/profile

Body supports partial update:
```json
{
  "firstName": "Raj",
  "lastName": "S",
  "preferences": {
    "exercise": true,
    "music": true,
    "meditation": false
  }
}
```

### DELETE /api/user/profile

Deletes the authenticated user account.

## Onboarding

### GET /api/onboarding/start

Starts or resumes onboarding.

### POST /api/onboarding/answer

Body:
```json
{
  "questionId": "question-id",
  "selectedOptionId": "option-id"
}
```

### GET /api/onboarding/next

Returns next adaptive question.

### POST /api/onboarding/complete

Body:
```json
{
  "confirm": true
}
```

### GET /api/onboarding/profile

Returns onboarding / trait profile.

### GET /api/onboarding/questions

Admin only.

### POST /api/onboarding/questions

Admin only. Creates onboarding question.

### PUT /api/onboarding/questions/:id

Admin only. Updates onboarding question.

## Mood

### POST /api/mood/log

Stores or updates mood data for a day and triggers:
- pattern refresh
- recommendation recalculation
- recent emotional state cache update

Body:
```json
{
  "moodScore": 4,
  "emotionTag": "stressed",
  "notes": "Work felt heavy today.",
  "activityDone": true,
  "sleepHours": 5.5,
  "screenTime": 7.5,
  "socialInteractionLevel": "low",
  "stressLevel": 8,
  "timestamp": "2026-05-25T19:00:00.000Z"
}
```

Response includes:
- `log`
- `patterns`
- `recommendation`

### GET /api/mood/history

Query params:
- `limit`
- `skip`
- `startDate`
- `endDate`

### GET /api/mood/analytics

Query:
- `period=week|month`

Returns:
- grouped analytics
- emotion distribution
- overall stats

## Recommendations

### GET /api/recommendations/personalized

Returns the current deterministic recommendation set:

```json
{
  "message": "Personalized recommendations fetched",
  "recommendation": {
    "_id": "recommendation-id",
    "activities": [
      {
        "_id": "activity-id",
        "activityType": "breathing_reset",
        "recommendationScore": 132.4,
        "personalizedTitle": "Breathing reset",
        "personalizedDescription": "Take a short pranayama-style breathing pause to steady your body.",
        "relevanceContext": "matched to your stressed mood state, works well during the night",
        "accepted": false,
        "completed": false,
        "ignored": false
      }
    ],
    "recommendationContext": {
      "moodScore": 4,
      "emotionTag": "stressed",
      "dominantPatterns": ["night_anxiety"],
      "daySegment": "night"
    },
    "status": "pending"
  }
}
```

### GET /api/recommendations/general

Returns low-friction curated wellness suggestions.

### GET /api/recommendations/history

Returns recent recommendation cycles for the user.

### PATCH /api/recommendations/:recommendationId/activities/:activityId/status

Body:
```json
{
  "action": "accepted"
}
```

Allowed actions:
- `accepted`
- `completed`
- `ignored`

This updates:
- activity flags
- recommendation status
- user-specific recommendation effectiveness

## Chat

### POST /api/chat/query

Protected and rate-limited.

Body:
```json
{
  "message": "I feel restless tonight."
}
```

Response includes:
- `reply`
- `conversationId`
- reconstructed `context`

The chatbot context is rebuilt from:
- traits
- recent mood history
- detected patterns
- successful interventions
- recent emotional state
- collective adaptation metadata

### GET /api/chat/history

Query:
- `limit`

Returns stored conversation messages for the authenticated user.

## Resources

### GET /api/resources/all

Public endpoint.

Query:
- `limit`
- `skip`
- `category`

### GET /api/resources/:category

Public endpoint.

Allowed categories:
- `articles`
- `meditation`
- `journaling`
- `exercise`
- `faqs`

### POST /api/resources/add

Protected, admin only.

Body:
```json
{
  "title": "Evening breathing routine",
  "category": "meditation",
  "contentURL": "https://example.com/breathing",
  "description": "A short routine for calming late-night tension."
}
```

## Insights

### GET /api/insights/profile

Returns computed insight profile such as:
- emotional baseline
- stress level
- recovery rate
- dominant emotion

### GET /api/insights/patterns

Returns detected user patterns from the insight route group.

### GET /api/insights/forecast

Returns short-term forecast from the insight route group.

### GET /api/insights/collective-summary

Returns privacy-safe collective learning summaries for frontend cards.

Example shape:
```json
{
  "success": true,
  "summary": {
    "insightCards": [
      {
        "title": "What tends to help",
        "summary": "People with a similar emotional rhythm often do well with breathing reset."
      }
    ],
    "behavioralTrendSummaries": [
      {
        "activityType": "terrace_walk",
        "summary": "terrace walk has shown steady value in similar situations."
      }
    ],
    "recommendationEvolutionIndicators": [
      {
        "activityType": "grounding_music",
        "label": "grounding music is being prioritized more intelligently over time."
      }
    ]
  }
}
```

## Patterns

### GET /api/patterns

Returns stored user pattern state.

### POST /api/patterns/refresh

Forces pattern recalculation for the authenticated user.

### GET /api/patterns/forecast

Returns forecast from the dedicated pattern route group.

## Error Shape

Typical error response:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "\"emotionTag\" is required"
  ]
}
```

Other common statuses:
- `400` validation or bad input
- `401` unauthenticated
- `403` forbidden
- `404` not found
- `429` chat rate limit
- `500` internal server error
