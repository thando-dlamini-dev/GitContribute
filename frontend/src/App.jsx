import React from 'react'
import { AnimatePresence } from "framer-motion";
import { redirect, Route, Routes, useLocation } from "react-router-dom";
import LandingPage from './pages/LandingPage';
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
  <div className='min-h-screen text-white relative overflow-hidden'>
      <div className='relative'>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path='/' element={<LandingPage />} />
          </Routes>
        </AnimatePresence>
      </div>
      <Toaster />
    </div>
  );
}

export default App
