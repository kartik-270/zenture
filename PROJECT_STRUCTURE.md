# Zenture Wellness - Frontend Application

A comprehensive Next.js-based mental wellness platform for college students with role-based dashboards, self-assessment tools, appointment booking, and AI chatbot support.

## Project Structure

### Pages

#### Public Pages (No Authentication Required)
- **`/`** - Home page with hero section, quick links, daily check-in, and platform features
- **`/about`** - About the platform and its mission
- **`/faq`** - Frequently asked questions
- **`/login`** - User login page
- **`/signup`** - User registration page

#### Protected Pages (Authentication Required)
- **`/dashboard`** - Student dashboard with quick access and progress tracking
- **`/resources`** - Psychoeducational hub with articles, videos, and audio content
- **`/appointments`** - Book counseling sessions with available counselors
- **`/self-assessment`** - Mental health self-assessment tests
  - `/self-assessment/phq9` - PHQ-9 depression screening
  - `/self-assessment/gad7` - GAD-7 anxiety screening
  - `/self-assessment/ghq12` - GHQ-12 general health screening
- **`/community`** - Peer support forum and discussion boards
- **`/chatbot`** - AI-powered chatbot (Mindy) for mental health support
- **`/messages`** - Direct messaging with counselors

#### Role-Based Dashboards
- **`/counselor/dashboard`** - Counselor dashboard for managing appointments and clients
- **`/admin/dashboard`** - Admin dashboard for platform management and analytics

### API Routes

#### Authentication
- `POST /api/auth/login` - User login endpoint
- `POST /api/auth/signup` - User registration endpoint
- `POST /api/auth/logout` - User logout endpoint

#### Proxy Routes
- `GET/POST/PUT/DELETE /api/proxy/[...path]` - Dynamic proxy to backend API with auth headers

### Components

#### Layout Components
- **`Navbar`** - Navigation bar with logo, menu, and user authentication controls
- **`Footer`** - Footer with links and company information
- **`HeroSection`** - Landing page hero with animated brain illustration
- **`QuickLinks`** - Quick access cards to main features
- **`DailyCheckIn`** - Mood tracking and emotional check-in widget
- **`PlatformFeatures`** - Feature showcase with analytics and AI chat preview

### Authentication & Security

#### Features
- Role-based access control (Student, Counselor, Admin)
- JWT token-based authentication
- HttpOnly cookie storage for auth tokens
- Middleware-based route protection
- Token validation and expiration handling

#### Auth Files
- **`lib/auth.ts`** - Authentication utilities and token management
- **`lib/config.ts`** - API configuration and base URLs
- **`middleware.ts`** - Route protection middleware

### Styling & Design

- **Tailwind CSS v4** for responsive design
- **Custom design tokens** in `globals.css` for theming
- **Shadcn/ui components** for UI consistency
- **Lucide icons** for visual elements

### State Management & Data Fetching

- **React hooks** for local state management
- **Browser localStorage** for client-side data persistence
- **Direct API calls** with Bearer token authentication
- **Error handling** and loading states on all pages

## Environment Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For production:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

## Backend Integration

All pages connect to a Flask/Express backend with the following endpoints:

### Authentication Endpoints
- `POST /login` - Returns `{token, username, role}`
- `POST /signup` - User registration with email verification
- `POST /logout` - Clears session

### Student Endpoints
- `GET /resources` - Fetch educational resources
- `GET /appointments` - List user's appointments
- `POST /appointments` - Book new appointment
- `GET /self-assessment` - Get assessment tests
- `POST /self-assessment/{test_id}` - Submit assessment results
- `GET /community/posts` - Fetch community posts
- `POST /community/posts` - Create new post
- `GET /messages/conversations` - Get user's conversations
- `POST /messages` - Send message to counselor

### Counselor Endpoints
- `GET /counselor/dashboard` - Dashboard stats and data
- `GET /counselor/appointments` - Upcoming appointments
- `PUT /appointments/{id}` - Update appointment status
- `GET /counselor/clients` - List assigned clients

### Admin Endpoints
- `GET /admin/dashboard` - Admin statistics and analytics
- `GET /admin/users` - List all users
- `PUT /admin/users/{id}` - Update user information
- `DELETE /admin/users/{id}` - Delete user
- `GET /admin/reports` - System reports

## Route Protection

Protected routes require a valid `auth_token` cookie. The middleware automatically redirects unauthorized users to the login page.

```typescript
// Protected routes in middleware.ts
const protectedRoutes = [
  '/dashboard',
  '/appointments',
  '/community',
  '/chatbot',
  '/self-assessment',
  '/resources',
  '/messages',
];
```

## User Roles & Permissions

### Student
- View resources and educational content
- Book appointments with counselors
- Take self-assessment tests
- Participate in community forums
- Chat with AI counselor
- Message assigned counselors

### Counselor
- View dashboard with assigned clients
- Manage appointment schedules
- View client profiles and assessments
- Communicate with students
- Track session notes

### Admin
- Manage all users (create, update, delete)
- View platform analytics
- Moderate community content
- Configure system settings
- Generate reports

## Key Features

1. **Mental Health Assessments** - PHQ-9, GAD-7, GHQ-12 screening tools
2. **Appointment Booking** - Multi-step booking with counselor selection
3. **Community Support** - Peer support forums and discussion boards
4. **AI Chatbot** - 24/7 mental health support with voice capability
5. **Resource Hub** - Articles, videos, and audio content
6. **Messaging System** - Direct communication with counselors
7. **Progress Tracking** - Dashboard with statistics and insights
8. **Responsive Design** - Mobile-first approach for all devices

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Considerations

1. Auth tokens stored in httpOnly cookies (prevents XSS attacks)
2. CSRF protection via SameSite cookie policy
3. Secure token validation on backend
4. Role-based access control enforcement
5. Input validation and sanitization
6. Sensitive data encryption in transit (HTTPS)

## Deployment

Deploy to Vercel with:
```bash
vercel deploy
```

Ensure environment variables are set in Vercel dashboard for production.
