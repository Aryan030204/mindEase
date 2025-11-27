# MindEase Frontend - Setup Guide

## 🚀 Quick Start

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
Create a `.env` file in the frontend directory:
```
VITE_API_URL=https://mindease-node-server.onrender.com
```

4. **Start development server:**
```bash
npm run dev
```

5. **Open in browser:**
Visit `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Dialog.jsx
│   │   │   └── ...
│   │   └── layout/          # Layout components
│   │       ├── Layout.jsx
│   │       ├── Navbar.jsx
│   │       └── Sidebar.jsx
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── lib/                 # Utilities
│   │   ├── api.js          # API client
│   │   └── utils.js        # Helper functions
│   ├── pages/              # Page components
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── MoodTracker.jsx
│   │   ├── MoodAnalytics.jsx
│   │   ├── Recommendations.jsx
│   │   ├── Chat.jsx
│   │   ├── Resources.jsx
│   │   └── Profile.jsx
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎨 Features

### ✅ Implemented Features

1. **Authentication**
   - Login/Signup pages
   - JWT token management
   - Protected routes
   - Auto-logout on token expiration

2. **Dashboard**
   - Welcome message
   - Quick stats cards
   - Recent mood display
   - Quick action buttons
   - Recommendations preview

3. **Mood Tracking**
   - Daily mood logging (1-10 scale)
   - Emotion tagging
   - Notes support
   - Activity completion tracking
   - Visual mood indicator
   - Today's mood display

4. **Analytics**
   - Weekly/Monthly mood trends
   - Line charts for mood scores
   - Pie charts for emotion distribution
   - Bar charts for log frequency
   - Overall statistics cards
   - Period switching (week/month)

5. **Recommendations**
   - Personalized activity suggestions
   - General wellness tips
   - Activity status management
   - Beautiful activity cards with icons

6. **AI Chat**
   - Gemini AI integration
   - Real-time messaging
   - Conversation history
   - Message timestamps
   - Loading states

7. **Resources**
   - Resource listing
   - Category filtering
   - Pagination
   - External links
   - Resource cards

8. **Profile**
   - User information display
   - Profile editing
   - Preference management
   - Account deletion
   - Avatar with initials

9. **UI/UX**
   - Dark/Light theme toggle
   - Smooth animations (Framer Motion)
   - Responsive design
   - Loading states
   - Error handling
   - Toast notifications
   - Skeleton loaders

## 🎯 Key Components

### UI Components (shadcn/ui style)
- Button (with variants and sizes)
- Card (with Header, Content, Footer)
- Input, Textarea, Select
- Label
- Badge
- Dialog
- DropdownMenu
- LoadingSpinner
- Skeleton

### Layout Components
- Layout (main layout wrapper)
- Navbar (top navigation with theme toggle)
- Sidebar (navigation menu)

### Pages
- Login/Signup (authentication)
- Dashboard (overview)
- MoodTracker (log moods)
- MoodAnalytics (charts and stats)
- Recommendations (activities and tips)
- Chat (AI chatbot)
- Resources (content library)
- Profile (user settings)

## 🔧 Configuration

### Environment Variables
- `VITE_API_URL` - Backend API base URL

### Theme Configuration
The theme system uses CSS variables defined in `src/index.css`. The theme can be toggled between light and dark modes.

### API Configuration
All API calls are centralized in `src/lib/api.js` using Axios. The client automatically:
- Adds JWT tokens to requests
- Handles 401 errors (auto-logout)
- Provides error handling

## 📦 Dependencies

### Core
- React 18
- React Router 6
- Vite

### Styling
- TailwindCSS
- class-variance-authority
- tailwind-merge
- clsx

### UI/Animations
- Framer Motion
- Lucide React (icons)
- Recharts (charts)

### Data Fetching
- React Query (TanStack Query)
- Axios

### Forms/Validation
- React Hook Form
- Zod

### Utilities
- date-fns
- react-hot-toast

## 🚀 Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🎨 Design System

### Colors
- Primary: Purple/violet (mental wellness theme)
- Secondary: Muted grays
- Accent: Subtle highlights
- Destructive: Red for dangerous actions

### Typography
- Headings: Bold, clear hierarchy
- Body: Readable, comfortable line height
- Small text: Muted for secondary information

### Spacing
- Consistent spacing scale
- Responsive padding/margins
- Card spacing: 6 (24px)

### Animations
- Page transitions: Fade + slide
- Component animations: Stagger children
- Hover effects: Scale and color transitions
- Loading: Smooth spinners

## 🔐 Security

- JWT tokens stored in localStorage
- Automatic token refresh handling
- Protected routes
- Input validation
- XSS protection via React

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Mobile sidebar with overlay
- Responsive grid layouts
- Touch-friendly buttons

## 🐛 Troubleshooting

### Common Issues

1. **API connection errors**
   - Check `VITE_API_URL` in `.env`
   - Verify backend server is running
   - Check CORS settings

2. **Theme not working**
   - Clear browser cache
   - Check `ThemeContext` is wrapping app

3. **Build errors**
   - Delete `node_modules` and reinstall
   - Check Node.js version (18+)
   - Clear Vite cache

## 📝 Notes

- All API endpoints match the backend structure
- Error handling is comprehensive
- Loading states for all async operations
- Toast notifications for user feedback
- Accessible components (ARIA labels, keyboard navigation)

## 🎉 Ready to Use!

The frontend is fully functional and ready for development. All features from the backend are integrated and working. Just install dependencies and start coding!

