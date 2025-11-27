# MindEase Frontend

A modern, production-ready React frontend for the MindEase mental wellness application.

## Features

- 🎨 **Modern UI**: Built with TailwindCSS and shadcn/ui components
- 🌙 **Dark Mode**: Full theme support with smooth transitions
- 📱 **Responsive**: Works perfectly on all screen sizes
- ✨ **Animations**: Smooth animations with Framer Motion
- 🔐 **Authentication**: Secure JWT-based authentication
- 📊 **Charts**: Beautiful data visualization with Recharts
- 💬 **AI Chat**: Integrated Gemini AI chatbot
- 🎯 **Type Safe**: Form validation and error handling
- ⚡ **Fast**: Optimized with React Query for data fetching

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **React Query** - Data fetching
- **React Router** - Routing
- **Recharts** - Charts
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```
VITE_API_URL=https://mindease-node-server.onrender.com
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components (Button, Card, etc.)
│   │   └── layout/      # Layout components (Navbar, Sidebar)
│   ├── contexts/        # React contexts (Auth, Theme)
│   ├── lib/            # Utilities and API client
│   ├── pages/          # Page components
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Static assets
└── package.json        # Dependencies
```

## Available Pages

- `/login` - User login
- `/signup` - User registration
- `/dashboard` - Main dashboard
- `/mood-tracker` - Log and track moods
- `/analytics` - View mood analytics and charts
- `/recommendations` - Personalized recommendations
- `/chat` - AI wellness chatbot
- `/resources` - Mental health resources
- `/profile` - User profile management

## Features Overview

### Authentication
- Secure JWT-based authentication
- Protected routes
- Auto-logout on token expiration

### Mood Tracking
- Daily mood logging with score (1-10)
- Emotion tagging
- Notes and activity tracking
- Mood history with pagination

### Analytics
- Weekly and monthly mood trends
- Emotion distribution charts
- Overall statistics
- Interactive charts with Recharts

### Recommendations
- Personalized activity suggestions
- General wellness tips
- Status tracking (accepted, completed, ignored)

### AI Chat
- Gemini AI integration
- Conversation history
- Real-time messaging
- Mental health focused responses

### Resources
- Curated mental health content
- Category filtering
- External links
- Pagination

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: https://mindease-node-server.onrender.com)

## License

MIT

