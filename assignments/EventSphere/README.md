# EventSphere - AI-Ready Event Management Platform

EventSphere is a comprehensive full-stack event management application built with modern technologies, featuring AI-powered recommendations, fraud detection, and dynamic pricing capabilities.

## 🚀 Features

### Core Features
- **Event Browsing** - View all upcoming events with detailed information
- **User Authentication** - Secure login/signup with JWT tokens
- **Event Registration** - Register for events with multiple ticket types
- **Ticket Management** - View, download, and manage your event tickets
- **Admin Dashboard** - Create, edit, and manage events (admin only)
- **User Dashboard** - Track registered events and tickets

### AI-Powered Features 🤖
- **Personalized Recommendations** - AI suggests events based on user preferences and behavior
- **Demand Forecasting** - Predicts event popularity and ticket demand
- **Dynamic Pricing** - AI adjusts ticket prices based on demand
- **Fraud Detection** - Identifies suspicious booking patterns
- **AI Chatbot** - 24/7 customer support assistant

### Technical Features
- **RESTful API** - Well-structured backend API
- **MongoDB Database** - Flexible NoSQL data storage
- **CI/CD Pipeline** - GitHub Actions for automated testing and deployment
- **Responsive Design** - Mobile-friendly UI

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Chart.js** for analytics visualizations
- **React Icons** for iconography
- **React-Toastify** for notifications
- **CSS Modules** for styling

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing

### AI/ML Services
- Collaborative filtering for recommendations
- Demand prediction algorithms
- Dynamic pricing engine
- Anomaly detection for fraud prevention

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas cloud)
- npm or yarn

## 🧰 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/SAURABHSAINI13/Assignment.git
cd Assignment/EventSphere
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventsphere
JWT_SECRET=your_secure_jwt_secret_key
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Seed Database (Optional)
```bash
cd backend
npm run seed
```

## ▶️ Running the Application

### Start MongoDB (if local)
```bash
net start MongoDB
```

### Start Backend
```bash
cd backend
npm run dev
```
Server runs at: http://localhost:5000

### Start Frontend
```bash
cd frontend
npm run dev
```
App runs at: http://localhost:5173

## 🔐 Default Admin Account
After running the seed script:
- **Email:** admin@eventsphere.com
- **Password:** admin123

## 📁 Project Structure

```
EventSphere/
├── .github/
│   └── workflows/           # CI/CD pipelines
│       ├── ci-cd.yml        # Build & test workflow
│       └── deploy.yml       # Deployment workflow
├── backend/
│   ├── config/              # Database configuration
│   ├── controllers/          # Request handlers
│   ├── data/                # Seed data (events.json)
│   ├── middleware/           # Auth & error handling
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── services/ai/         # AI services
│   │   ├── chatbotService.js
│   │   ├── demandForecastService.js
│   │   ├── dynamicPricingService.js
│   │   ├── fraudDetectionService.js
│   │   └── recommendationService.js
│   ├── scripts/             # Admin scripts
│   └── server.js            # Entry point
├── frontend/
│   ├── public/              # Static assets
│   └── src/
│       ├── api/             # API clients
│       ├── components/      # Reusable components
│       ├── context/         # React contexts
│       ├── hooks/           # Custom hooks
│       ├── pages/           # Page components
│       └── App.jsx          # Main app
└── README.md
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/users` | Get all users (admin) |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| GET | `/api/events/:id` | Get event by ID |
| POST | `/api/events` | Create event (admin) |
| PUT | `/api/events/:id` | Update event (admin) |
| DELETE | `/api/events/:id` | Delete event (admin) |

### Registrations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/registrations` | Register for event |
| GET | `/api/registrations/check/:eventId` | Check registration status |

### AI Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/recommendations` | Get personalized recommendations |
| GET | `/api/ai/recommendations/ml` | ML-based recommendations |
| GET | `/api/ai/trending` | Get trending events |
| GET | `/api/ai/forecast/:eventId` | Demand forecast |
| GET | `/api/ai/pricing/:eventId` | Dynamic pricing |
| POST | `/api/ai/chatbot` | AI chatbot query |
| GET | `/api/ai/flagged-registrations` | Fraud alerts (admin) |

## 🤖 AI Features

### Recommendations
The AI analyzes user behavior and registration history to suggest events they might like. Uses collaborative filtering and similarity scoring.

### Demand Forecasting
Predicts how many tickets will be sold for an event based on historical data and current trends.

### Dynamic Pricing
Automatically adjusts ticket prices based on demand:
- High demand (>85% capacity): Price increases
- Low demand (<30% capacity): Discounted pricing
- Early bird / last-minute deals

### Fraud Detection
Analyzes registrations for suspicious patterns:
- Unusual registration frequency
- Large ticket quantities
- High-value transactions
- New accounts with multiple bookings

### Chatbot
AI-powered assistant that helps users:
- Find events
- Check registrations
- Answer event-related questions

## ⚙️ Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventsphere
JWT_SECRET=your_jwt_secret_key
```

## 🧪 Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend lint
cd frontend
npm run lint
```

## 🚢 Deployment

The project includes GitHub Actions CI/CD workflows:

1. **CI Pipeline** - Runs on every push/PR
   - Backend tests
   - Frontend build
   - Security audit

2. **CD Pipeline** - Deploys on push to main
   - Build application
   - Deploy to production server

Configure these secrets in GitHub:
- `MONGO_URI`
- `JWT_SECRET`
- `SERVER_HOST`, `SERVER_USER`, `DEPLOY_KEY`

## 📄 License

MIT License

## 👤 Author

**Saurabh Saini**
- GitHub: [@SAURABHSAINI13](https://github.com/SAURABHSAINI13)

## 🙏 Acknowledgments

- MongoDB for database
- React team for the frontend framework
- All contributors and testers
