import React, { useState, useEffect } from 'react';
import Sidebar from '../Dashbord/Sidebar';

const Prescription = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionData, setPrescriptionData] = useState({
    appointmentId: '',
    medicines: '',
    dosageInstructions: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Dummy appointment data (replace with actual data from your backend)
  const appointments = [
    { id: '1', patient: 'Dhruv Trivedi - 10:00 AM' },
    { id: '2', patient: 'Bhushan Satote - 11:30 AM' },
    { id: '3', patient: 'Tanvi Kanani - 2:00 PM' },
    { id: '4', patient: 'Devyanshi Thummar - 3:00 PM' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Create new prescription with current date and time
    const newPrescription = {
      id: Date.now(), // temporary ID (replace with backend ID)
      ...prescriptionData,
      patientName: appointments.find(apt => apt.id === prescriptionData.appointmentId)?.patient,
      createdAt: new Date().toLocaleString()
    };

    // Add to prescriptions list
    setPrescriptions([newPrescription, ...prescriptions]);

    // Reset form
    setPrescriptionData({
      appointmentId: '',
      medicines: '',
      dosageInstructions: '',
      date: new Date().toISOString().split('T')[0]
    });

    // Close form
    setShowForm(false);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const updatedPrescriptions = prescriptions.map(p => 
      p.id === selectedPrescription.id ? selectedPrescription : p
    );
    setPrescriptions(updatedPrescriptions);
    setShowUpdateModal(false);
    setSelectedPrescription(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      setPrescriptions(prescriptions.filter(p => p.id !== id));
    }
  };

  const handleView = (prescription) => {
    // Implement view functionality
    console.log('Viewing prescription:', prescription);
  };

  const handlePrint = (prescription) => {
    // Implement print functionality
    console.log('Printing prescription:', prescription);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} overflow-auto`}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-800">Prescriptions</h1>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Prescription
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-800">New Prescription</h2>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Select Appointment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Appointment *
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    value={prescriptionData.appointmentId}
                    onChange={(e) => setPrescriptionData({...prescriptionData, appointmentId: e.target.value})}
                    required
                  >
                    <option value="">Select an appointment</option>
                    {appointments.map((apt) => (
                      <option key={apt.id} value={apt.id}>
                        {apt.patient}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Medicines */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicines *
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    placeholder="Enter medicines list (one per line)"
                    value={prescriptionData.medicines}
                    onChange={(e) => setPrescriptionData({...prescriptionData, medicines: e.target.value})}
                    required
                  ></textarea>
                </div>

                {/* Dosage Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosage Instructions *
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    placeholder="Enter detailed dosage instructions"
                    value={prescriptionData.dosageInstructions}
                    onChange={(e) => setPrescriptionData({...prescriptionData, dosageInstructions: e.target.value})}
                    required
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Save Prescription
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Recent Prescriptions Table */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Prescriptions</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-200">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-200">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-200">
                      Medicines
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-200">
                      Dosage Instructions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {prescriptions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500 border-b border-gray-200">
                        No prescriptions found
                      </td>
                    </tr>
                  ) : (
                    prescriptions.map((prescription) => (
                      <tr key={prescription.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          {prescription.createdAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          {prescription.patientName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                          <div className="max-w-xs overflow-hidden">
                            {prescription.medicines}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                          <div className="max-w-xs overflow-hidden">
                            {prescription.dosageInstructions}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-3">
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => handleView(prescription)}
                              title="View"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              className="text-yellow-600 hover:text-yellow-800"
                              onClick={() => {
                                setSelectedPrescription(prescription);
                                setShowUpdateModal(true);
                              }}
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDelete(prescription.id)}
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            <button
                              className="text-green-600 hover:text-green-800"
                              onClick={() => handlePrint(prescription)}
                              title="Print"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedPrescription && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-500 opacity-50"></div>
          <div className="relative bg-white rounded-lg w-[500px] shadow-xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Update Prescription</h3>
                <button 
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedPrescription(null);
                  }}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <form onSubmit={handleUpdate} className="space-y-4">
                {/* Patient Info Section */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{selectedPrescription.patientName}</h4>
                    <p className="text-sm text-gray-500">{selectedPrescription.createdAt}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medicines (Ayurvedic)
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="4"
                      value={selectedPrescription.medicines}
                      onChange={(e) => setSelectedPrescription({
                        ...selectedPrescription,
                        medicines: e.target.value
                      })}
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dosage Instructions
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="4"
                      value={selectedPrescription.dosageInstructions}
                      onChange={(e) => setSelectedPrescription({
                        ...selectedPrescription,
                        dosageInstructions: e.target.value
                      })}
                      required
                    ></textarea>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedPrescription(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescription;
