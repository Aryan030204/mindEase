# Frontend Setup Guide

## Install

```bash
cd frontend
npm install
```

## Environment

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080
```

Use your deployed API URL in production.

## Run

```bash
npm run dev
```

Default dev URL:
- `http://localhost:5173`

## Build

```bash
npm run build
```

## Frontend Architecture

### Core folders

- `src/components/` reusable UI, layout, onboarding, and chat components
- `src/contexts/` auth and theme context
- `src/features/` Redux Toolkit slices
- `src/lib/` API client and utilities
- `src/pages/` route-level screens
- `src/store/` Redux store

### Intelligence-aware pages

- `Dashboard` shows adaptive and collective summaries
- `MoodTracker` logs contextual wellness data
- `Recommendations` supports accept/complete/ignore actions
- `Chat` uses reconstructed emotional context
- `MoodAnalytics` shows patterns, forecast, and collective learning indicators

## State and Data Flow

1. `AuthContext` manages token-backed user session.
2. `App.jsx` loads onboarding profile and adaptive dashboard state after login.
3. `adaptiveSlice` fetches:
   - latest mood
   - recommendations
   - recommendation history
   - patterns
   - forecast
   - insight profile
   - collective summary
4. Chat history and chat context are updated through the same slice.

## Theme

- Theme is controlled by `ThemeContext`.
- Global tokens are defined in [index.css](</e:/FULL STACK/sem7/Final year Project/app/frontend/src/index.css>).
- Panels should prefer semantic Tailwind token classes such as `bg-card`, `text-foreground`, `text-muted-foreground`, and `border-border`.

## Troubleshooting

API issues:
- verify `VITE_API_URL`
- verify backend CORS config
- verify JWT token is present after login

Theme issues:
- verify `ThemeProvider` wraps the app
- avoid hardcoded light-only classes in page panels

Build issues:
- remove `node_modules`
- reinstall dependencies
- rerun `npm run build`
