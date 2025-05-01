import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar';
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear any previous errors when user starts typing
    setError('');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    // Validate required fields
    if (!formData.email || !formData.password || !formData.role) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }
    try {
      // Step 1: Attempt login
      const loginResponse = await axios.post('http://127.0.0.1:8000/api/login', 
        {
          email: formData.email,
          password: formData.password,
          role: formData.role
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      if (loginResponse.data.status === 'success') {
        const { token, user } = loginResponse.data.data;
        // Step 2: Role Validation
        if (user.role !== formData.role) {
          setError(`Access denied. You are registered as a ${user.role}`);
          setIsLoading(false);
          return;
        }
        // Step 3: Store Authentication Data
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_role', user.role);
        localStorage.setItem('user_data', JSON.stringify(user));
        // Step 4: Fetch Role-Specific Profile
        try {
          let profileEndpoint = '';
          switch (user.role) {
            case 'doctor':
              profileEndpoint = 'http://127.0.0.1:8000/api/doctors/profile';
              break;
            case 'patient':
              profileEndpoint = 'http://127.0.0.1:8000/api/patients/profile';
              break;
            // case 'admin':
            //   profileEndpoint = 'http://127.0.0.1:8000/api/admin/profile';
            //   break;
            default:
              throw new Error('Invalid role');
          }
          const profileResponse = await axios.get(profileEndpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          if (profileResponse.data.status === 'success') {
            // Store role-specific profile data
            localStorage.setItem(`${user.role}_data`, JSON.stringify(profileResponse.data.data));
            // Step 5: Role-Based Navigation
            switch (user.role) {
              case 'doctor':
                navigate('/doctor/dashboard', { replace: true });
                break;
              case 'patient':
                navigate('/patient/dashboard', { replace: true });
                break;
              case 'admin':
                navigate('/admin/dashboard', { replace: true });
                break;
              default:
                throw new Error('Invalid role for navigation');
            }
          }
        } catch (profileError) {
          console.error('Profile Error:', profileError);
          handleAuthError(profileError);
        }
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAuthError = (error) => {
    localStorage.clear(); // Clear any partial authentication data
    if (error.response) {
      switch (error.response.status) {
        case 401:
          setError('Invalid email or password');
          break;
        case 403:
          setError('Access denied. Please verify your role and credentials.');
          break;
        case 422:
          const validationErrors = error.response.data.errors;
          setError(Object.values(validationErrors).flat().join('\n'));
          break;
        case 429:
          setError('Too many login attempts. Please try again later.');
          break;
        default:
          setError(error.response.data.message || 'Authentication failed');
      }
    } else if (error.request) {
      setError('Network error. Please check your connection.');
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
  };
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 mt-16">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">MedAssist</h2>
          <h3 className="text-center text-xl text-gray-600">Sign in to your account</h3>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
            {/* Show error message if exists */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <form className="space-y-8 w-full max-w-2xl mx-auto p-6" onSubmit={handleSubmit}>
              {/* Role Selection */}
              <div className="mb-6">
                <label htmlFor="role" className="block text-sm font-semibold text-gray-800 mb-2">
                  Select Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 ease-in-out bg-white shadow-sm text-gray-700"
                  required
                >
                  <option value="">Select your role</option>
                  <option value="doctor">Doctor</option>
                  <option value="patient">Patient</option>
                </select>
              </div>
              {/* Email */}
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 ease-in-out shadow-sm"
                  placeholder="Enter your email"
                />
              </div>
              {/* Password */}
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 ease-in-out shadow-sm"
                  placeholder="Enter your password"
                />
              </div>
              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between mb-6 py-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition duration-150 ease-in-out"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-gray-700 hover:text-gray-900">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link 
                    to="/forgotpassword" 
                    className="font-semibold text-blue-600 hover:text-blue-700 transition duration-150 ease-in-out"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center px-6 py-3.5 border border-transparent rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-150 ease-in-out shadow-md ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg active:bg-blue-800'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-base">Signing in...</span>
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
            {/* Registration link section - Hide for admin role */}
            {formData.role !== 'admin' && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Don't have an account?
                    </span>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <Link
                    to="/registration"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Create a new account
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;