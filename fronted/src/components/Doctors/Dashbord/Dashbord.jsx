import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleProfileClick = (path) => {
    setShowProfileDropdown(false);
    navigate(path);
  };

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('https://medassist1.onrender.com/api/doctors/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.data.status === 'success') {
          setDoctorData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
        setError('Failed to load doctor information');
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [navigate]);

 

  // Show error state
  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  // Function to get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Navigation Bar */}
        <div className="m-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              {/* Toggle Button
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 mr-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button> */}

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search patients, appointments..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Right Side Items */}
              <div className="flex items-center space-x-8">
                {/* Notifications */}
                <div className="flex items-center">
                  <span className="relative mr-2">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      2
                    </span>
                  </span>
                  <div>
                    <p className="text-sm font-medium">Notifications</p>
                    <p className="text-xs text-gray-500">1 unread</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex items-center">
                  <span className="relative mr-2">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      3
                    </span>
                  </span>
                  <div>
                    <p className="text-sm font-medium">Messages</p>
                    <p className="text-xs text-gray-500">3 unread</p>
                  </div>
                </div>

                {/* Profile */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-3"
                  >
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-100 overflow-hidden">
                        {doctorData?.profile_photo ? (
                          <img 
                            src={`https://medassist1.onrender.com/storage/${doctorData.profile_photo}`}
                            alt={`Dr. ${doctorData?.first_name} ${doctorData?.last_name}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/150';
                            }}
                          />
                        ) : (
                          <span className="text-lg font-medium text-blue-600">
                            {doctorData && getInitials(doctorData.first_name + ' ' + doctorData.last_name)}
                          </span>
                        )}
                      </div>
                      {/* Online Status Indicator */}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Dr. {doctorData?.first_name} {doctorData?.last_name}
                        </h3>
                        <span className="ml-1 text-xs text-pink-500">
                          ({doctorData?.gender === 'female' ? 'Ms.' : 'Mr.'})
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{doctorData?.email}</p>
                    
                    </div>
                    <span className="text-gray-400 ml-2">▼</span>
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-50">
                      <div className="p-4 border-b">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-100">
                              <span className="text-lg font-medium text-blue-600">
                                {doctorData && getInitials(doctorData.first_name + ' ' + doctorData.last_name)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h3 className="text-sm font-semibold text-gray-900">
                                Dr. {doctorData?.first_name} {doctorData?.last_name}
                              </h3>
                              <span className="ml-1 text-xs text-pink-500">
                                ({doctorData?.gender === 'female' ? 'Ms.' : 'Mr.'})
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{doctorData?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Rest of the dropdown menu items */}
                      <div className="py-1">
                        <button
                          onClick={() => handleProfileClick('/doctor/update-profile')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile 
                        </button>

                        <button
                          onClick={() => handleProfileClick('/forgotpassword')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          Change Password
                        </button>

                        <button
                          onClick={() => handleProfileClick('/doctor/settings')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </button>

                        <hr className="my-1" />
                        
                        {/* <button
                          onClick={() => handleProfileClick('/login')}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button> */}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Total Patients Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center hover:shadow-md transition-shadow duration-300">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Patients</h3>
                <p className="text-2xl font-bold text-blue-600">150</p>
                <p className="text-sm text-gray-500">+12 this week</p>
              </div>
            </div>

            {/* Appointments Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center hover:shadow-md transition-shadow duration-300">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Appointments</h3>
                <p className="text-2xl font-bold text-green-600">8</p>
                <p className="text-sm text-gray-500">Today</p>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h2>
                <button className="text-blue-500 hover:text-blue-600">View All</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-100 mr-4">
                    <span className="text-sm font-medium text-blue-600">BS</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-800">Bhushan Satote</h4>
                    <p className="text-sm text-gray-500">General Checkup</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">09:00 AM</p>
                    <p className="text-xs text-gray-500">Today</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-100 mr-4">
                    <span className="text-sm font-medium text-blue-600">DT</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-800">Dhruv Trivedi</h4>
                    <p className="text-sm text-gray-500">Follow-up</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">11:30 AM</p>
                    <p className="text-xs text-gray-500">Today</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
                <button className="text-blue-500 hover:text-blue-600">View All</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">New appointment scheduled with John Doe</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">Medical report updated for Sarah Smith</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">New message from Mike Johnson</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



