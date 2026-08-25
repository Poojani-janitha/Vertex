import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Standard instant routes
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Lazy-loaded heavy pages for optimal bundle performance & fast initial load
const Jobs = lazy(() => import('./pages/Jobs'));
const Users = lazy(() => import('./pages/Users'));
const Contact = lazy(() => import('./pages/Contact'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/admin'));
const CommunityDashboard = lazy(() => import('./pages/community/com'));

// Sleek fallback loader
const PageFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-fade-in">
    <div className="w-10 h-10 border-4 border-emerald-200 border-t-[#06402B] rounded-full animate-spin"></div>
    <span className="text-xs font-bold text-[#06402B] uppercase tracking-wider">Loading WorkOra...</span>
  </div>
);

function App() {
  return (
    <Layout>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/users" element={<Users />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
          
          {/* Protected Dashboard Routes */}
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/community/*" 
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <CommunityDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;