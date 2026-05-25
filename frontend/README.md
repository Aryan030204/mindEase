# MindEase Frontend

Frontend for the MindEase mental wellness platform.

Tech stack:
- React 18
- Vite
- TailwindCSS
- Redux Toolkit
- React Router
- React Query
- Framer Motion
- Recharts

## Current Scope

The frontend supports the full implemented product flow:

- authentication
- adaptive onboarding
- personalized dashboard
- mood logging
- recommendation feedback loop
- adaptive chatbot
- emotional insights
- collective learning summaries
- resources
- profile management

## Main State Layers

Context:
- `AuthContext`
- `ThemeContext`

Redux:
- onboarding slice
- adaptive slice

The adaptive slice stores:
- current emotional state
- recommendations
- recommendation history
- patterns
- forecast
- chatbot context
- collective summaries

## Main Routes

- `/login`
- `/signup`
- `/onboarding/welcome`
- `/onboarding/question/:id`
- `/onboarding/complete`
- `/dashboard`
- `/mood-tracker`
- `/analytics`
- `/recommendations`
- `/chat`
- `/resources`
- `/profile`

## Setup

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:8080
```

Run:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Important Files

- [App.jsx](</e:/FULL STACK/sem7/Final year Project/app/frontend/src/App.jsx>)
- [api.js](</e:/FULL STACK/sem7/Final year Project/app/frontend/src/lib/api.js>)
- [adaptiveSlice.js](</e:/FULL STACK/sem7/Final year Project/app/frontend/src/features/adaptive/adaptiveSlice.js>)
- [onboardingSlice.js](</e:/FULL STACK/sem7/Final year Project/app/frontend/src/features/onboarding/onboardingSlice.js>)
- [Dashboard.jsx](</e:/FULL STACK/sem7/Final year Project/app/frontend/src/pages/Dashboard.jsx>)
- [MoodTracker.jsx](</e:/FULL STACK/sem7/Final year Project/app/frontend/src/pages/MoodTracker.jsx>)
- [MoodAnalytics.jsx](</e:/FULL STACK/sem7/Final year Project/app/frontend/src/pages/MoodAnalytics.jsx>)
- [Recommendations.jsx](</e:/FULL STACK/sem7/Final year Project/app/frontend/src/pages/Recommendations.jsx>)
- [ChatWindow.jsx](</e:/FULL STACK/sem7/Final year Project/app/frontend/src/components/chat/ChatWindow.jsx>)

## Notes

- Theme support is implemented with CSS variables and `ThemeContext`.
- The frontend assumes the backend API is already running.
- Chat, recommendations, patterns, and collective summaries depend on authenticated access.
