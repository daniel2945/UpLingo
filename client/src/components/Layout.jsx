import React from 'react';
import { Outlet, useNavigate, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// Navbar Component
export const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav className="bg-white border-b-2 border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10 w-full">
      <div 
        className="flex items-center space-x-2 cursor-pointer" 
        onClick={() => navigate('/dashboard')}
      >
        <div className="bg-primary p-2 rounded-xl text-white font-black px-2">
          PL
        </div>
        <span className="text-2xl font-black text-primary tracking-tight uppercase">PROMPTLINGUAL</span>
      </div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-2xl border-2 border-orange-100">
          <span className="font-bold text-orange-600 uppercase tracking-tighter">MISSION {user.currentMissionOrder || 1}</span>
        </div>
        <button 
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest text-sm"
        >
          LOGOUT
        </button>
      </div>
    </nav>
  );
};

// Footer Component
export const Footer = () => (
  <footer className="bg-white border-t-2 border-gray-100 mt-auto w-full">
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-gray-400 font-black tracking-tight uppercase">
        <div>PROMPTLINGUAL</div>
        <div className="text-sm font-medium">Made for language learners</div>
        <div className="text-xs">© 2026</div>
      </div>
    </div>
  </footer>
);

// Main Application Layout
export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col w-full">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 pb-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Authentication Layout (Login/Register)
export const AuthLayout = () => (
  <div className="min-h-screen flex flex-col bg-surface p-4 items-center justify-center">
    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border-b-4 border-gray-200 overflow-hidden mb-8">
      <Outlet />
    </div>
    <footer className="py-2 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
      PromptLingual 2026
    </footer>
  </div>
);

// Protected Route Logic
export const ProtectedRoute = () => {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
