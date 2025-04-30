import React, { useState } from 'react';
import Sidebar from '../Dashbord/Sidebar';
import { useNavigate } from 'react-router-dom';

const Appointment = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentView, setCurrentView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    patientName: '',
    appointmentDate: '',
    appointmentTime: '',
    status: 'pending'
  });

  const handleStatusChange = (e) => {
    setFormData({ ...formData, status: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your submit logic here
    console.log('Form submitted:', formData);
    setShowForm(false); // Hide form after submission
  };

  const handleCancel = () => {
    setFormData({
      patientName: '',
      appointmentDate: '',
      appointmentTime: '',
      status: 'pending'
    });
    setShowForm(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-8">
          {/* Header with Always Visible Button */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-800">Appointments</h1>
            <div className="flex space-x-4">
              <button 
                className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center ${showForm ? 'ring-2 ring-red-300' : ''}`}
                onClick={() => setShowForm(!showForm)}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                New Appointment
              </button>
            </div>
          </div>

          {/* Form Section - Collapsible */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Schedule New Appointment</h2>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date & Time Group */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={formData.appointmentDate}
                      onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={formData.appointmentTime}
                      onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {/* Patient Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                    value={formData.patientName}
                    readOnly
                    placeholder="Patient name will be auto-populated"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={formData.status}
                    onChange={handleStatusChange}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Schedule Appointment
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Calendar Section - Always Visible */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="font-medium">OCTOBER</span>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="flex space-x-2">
                <button 
                  className={`px-4 py-1 rounded-md ${currentView === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                  onClick={() => setCurrentView('day')}
                >
                  DAY
                </button>
                <button 
                  className={`px-4 py-1 rounded-md ${currentView === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                  onClick={() => setCurrentView('week')}
                >
                  WEEK
                </button>
                <button 
                  className={`px-4 py-1 rounded-md ${currentView === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                  onClick={() => setCurrentView('month')}
                >
                  MONTH
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {/* Days of Week */}
              <div className="col-span-7 grid grid-cols-7 bg-white">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                  <div key={day} className="py-2 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="col-span-7 grid grid-cols-7 bg-white">
                {Array.from({ length: 24 }).map((_, hour) => (
                  <React.Fragment key={hour}>
                    {Array.from({ length: 7 }).map((_, day) => (
                      <div 
                        key={`${hour}-${day}`} 
                        className="h-12 border-t border-r border-gray-100 p-1"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            appointmentTime: `${String(hour).padStart(2, '0')}:00`,
                            appointmentDate: new Date(selectedDate.getTime() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                          });
                          setShowForm(true);
                        }}
                      >
                        <div className="text-xs text-gray-500">
                          {`${String(hour).padStart(2, '0')}:00`}
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                <span className="text-sm">EMERGENCY</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                <span className="text-sm">EXAMINATION</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                <span className="text-sm">CONSULTATION</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                <span className="text-sm">ROUTINE CHECKUP</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-cyan-500 mr-2"></span>
                <span className="text-sm">SICK VISIT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
