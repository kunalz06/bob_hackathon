import React from 'react';
import Navbar from './Navbar';

/**
 * Layout Component
 * Wrapper component that provides consistent page structure across the app
 * Includes Navbar at top and main content area with proper spacing
 */
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
};

export default Layout;

// Made with Bob
