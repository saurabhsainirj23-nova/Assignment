import React, { Suspense, lazy } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingState from './components/LoadingState';
import Chatbot from './components/Chatbot';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { AuthProvider } from './context/AuthContext';

const Home = lazy(() => import('./pages/Home'));
const Events = lazy(() => import('./Events'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const GetTicket = lazy(() => import('./pages/GetTicket'));
const TicketDetails = lazy(() => import('./pages/TicketDetails'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const TicketRegistration = lazy(() => import('./pages/TicketRegistration'));
const TicketConfirmation = lazy(() => import('./pages/TicketConfirmation'));
const CreateEvent = lazy(() => import('./pages/CreateEvent'));
const MakeAdmin = lazy(() => import('./pages/MakeAdmin'));
const EventRegistration = lazy(() => import('./pages/EventRegistration'));
const Settings = lazy(() => import('./pages/Settings'));

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main style={{ minHeight: '80vh' }}>
          <Suspense fallback={<LoadingState message="Loading..." />}>
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/register-event" element={<EventRegistration />} /> {/* ✅ FIXED */}
              <Route path="/events" element={<Events />} />
              <Route path="/events/:eventId" element={<EventDetails />} />
              <Route path="/get-ticket" element={<GetTicket />} />
              <Route
                path="/ticket-details"
                element={
                  <ProtectedRoute>
                    <TicketDetails />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/signup" element={<AuthPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/about" element={<AboutUs />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ticket-registration"
                element={
                  <ProtectedRoute>
                    <TicketRegistration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ticket-confirmation/:bookingId"
                element={
                  <ProtectedRoute>
                    <TicketConfirmation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-event"
                element={
                  <ProtectedRoute>
                    <CreateEvent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/make-admin"
                element={
                  <ProtectedRoute>
                    <MakeAdmin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <Chatbot />
      </Router>
    </AuthProvider>
  );
};

export default App;
