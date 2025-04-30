import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageAvailability = () => {
  const [availabilityData, setAvailabilityData] = useState({
    date: '',
    timeSlots: [{ startTime: '', endTime: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addTimeSlot = () => {
    setAvailabilityData(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { startTime: '', endTime: '' }]
    }));
  };

  const removeTimeSlot = (index) => {
    setAvailabilityData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }));
  };

  const handleChange = (index, field, value) => {
    const newTimeSlots = [...availabilityData.timeSlots];
    newTimeSlots[index][field] = value;
    setAvailabilityData(prev => ({
      ...prev,
      timeSlots: newTimeSlots
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.patch(
        'http://127.0.0.1:8000/api/doctors/set-availability',
        {
          date: availabilityData.date,
          time_slots: availabilityData.timeSlots.map(slot => ({
            start_time: slot.startTime,
            end_time: slot.endTime
          }))
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          withCredentials: true  // Add this line
        }
      );

      if (response.data.status === 'success') {
        alert('Availability set successfully!');
        // Reset form
        setAvailabilityData({
          date: '',
          timeSlots: [{ startTime: '', endTime: '' }]
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set availability');
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Availability</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={availabilityData.date}
            onChange={(e) => setAvailabilityData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Time Slots</label>
          {availabilityData.timeSlots.map((slot, index) => (
            <div key={index} className="flex items-center space-x-4">
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => handleChange(index, 'startTime', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <span>to</span>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => handleChange(index, 'endTime', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeTimeSlot(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addTimeSlot}
            className="text-blue-500 hover:text-blue-700"
          >
            + Add Another Time Slot
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Setting Availability...' : 'Set Availability'}
        </button>
      </form>
    </div>
  );
};

export default ManageAvailability;