import React, { useEffect, useState} from 'react'
import { AnimatePresence } from "framer-motion";
import { redirect, Route, Routes, useLocation } from "react-router-dom";
import LandingPage from './pages/LandingPage';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/navbar';
import LoginPage from './pages/LoginPage';
import useAuthStore from './stores/authStore';

const App = () => {

  // Use shallow comparison to prevent infinite loops with object selectors
  const initialize = useAuthStore(state => state.initialize);
  const setupTokenRefresh = useAuthStore(state => state.setupTokenRefresh);
  const loading = useAuthStore(state => state.loading);

  const { user } = useAuthStore();

  useEffect(() => {
    initialize();
    
    const cleanupRefresh = setupTokenRefresh();

    // Cleanup on unmount
    return () => {
      if (cleanupRefresh) cleanupRefresh();
    };
  }, [initialize, setupTokenRefresh])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
  <div className='relative min-h-screen overflow-hidden text-white'>
      <div className='relative'>
        <Navbar/>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path='/' element={<LandingPage />} />
            <Route path='/login' element={<LoginPage/>} />
          </Routes>
        </AnimatePresence>
      </div>
      <Toaster />
    </div>
  );
}

export default App
