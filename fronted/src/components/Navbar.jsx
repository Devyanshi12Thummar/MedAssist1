import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/registration';

  return (
    <header className="bg-gradient-to-r from-blue-300 to-blue-500 text-white shadow-lg fixed w-full top-0 z-50">
      <div className="w-full px-0">
        <div className="flex items-center h-16">
          <div className="flex ml-20 items-center flex-1">
            <Link to="/" className="flex items-center">
              <svg className="h-8 w-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              <span className="font-bold text-xl">MedAssist</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8 flex-1 justify-center">
      
              <>
                <Link 
                  to="/about" 
                  className="hover:text-blue-200 font-semibold transition-colors duration-200"
                >
                  About Us
                </Link>
                <Link 
                  to="/contact" 
                  className="hover:text-blue-200 font-semibold transition-colors duration-200"
                >
                  Contact Us
                </Link>
                <Link 
                  to="/login" 
                  className="hover:text-blue-200 font-semibold transition-colors duration-200"
                >
                  Sign In / Sign Up
                </Link>
              </>
          
          
          </nav>

          {/* Commented out user profile section
          <div className="flex items-center">
            <button className="p-2 rounded-full hover:bg-blue-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </button>
            <div className="ml-4 relative">
              <button className="flex items-center space-x-2 hover:text-blue-200">
                <img className="h-8 w-8 rounded-full" src="https://ui-avatars.com/api/?name=User" alt="User avatar" />
                <span>User Name</span>
              </button>
            </div>
          </div>
          */}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
