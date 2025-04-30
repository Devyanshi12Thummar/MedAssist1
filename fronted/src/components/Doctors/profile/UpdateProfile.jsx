import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    email: '',
    registrationNumber: '',
    specialization: '',
    experience: '',
    consultationFees: '',
    clinicName: '',
    clinicAddress: '',
    clinicCity: '',
    clinicState: '',
    clinicPostalCode: '',
    clinicCountry: '',
    telemedicineSupport: false,
    profile_photo: null,
    clinic: {
      openingTime: '',
      closingTime: '',
      workingDays: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
      }
    },
    documents: {
      medicalLicense: null,
      degreeCertificate: null,
      idProof: null  // Add this line
    }
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child, grandchild] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: grandchild 
            ? {
                ...prev[parent][child],
                [grandchild]: type === 'checkbox' ? checked : value
              }
            : value
        }
      }));
    } else {
      // Handle top-level properties
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('File size should be less than 2MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setFormData(prev => ({ 
        ...prev, 
        profile_photo: file,
        profile_photoPath: URL.createObjectURL(file)
      }));
      setPreview(URL.createObjectURL(file));
    }
  };
  // Handle document file changes
  const handleDocumentChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }

      // Update the formData with the new document
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [name.split('.')[1]]: file
        }
      }));
    }
  };
  // Update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    const formDataToSend = new FormData();
  
    // Convert camelCase to snake_case for backend compatibility
    formDataToSend.append('first_name', formData.firstName);
    formDataToSend.append('last_name', formData.lastName);
    formDataToSend.append('date_of_birth', formData.dateOfBirth);
    formDataToSend.append('gender', formData.gender);
    formDataToSend.append('contact_number', formData.contactNumber);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('registration_number', formData.registrationNumber);
    formDataToSend.append('specialization', formData.specialization);
    formDataToSend.append('experience', formData.experience);
    formDataToSend.append('consultation_fees', formData.consultationFees);
    formDataToSend.append('clinic_name', formData.clinicName);
    formDataToSend.append('clinic_address', formData.clinicAddress);
    formDataToSend.append('clinic_city', formData.clinicCity);
    formDataToSend.append('clinic_state', formData.clinicState);
    formDataToSend.append('clinic_postal_code', formData.clinicPostalCode);
    formDataToSend.append('clinic_country', formData.clinicCountry);
    formDataToSend.append('telemedicine_support', formData.telemedicineSupport ? 1 : 0);

    // Only append profile_photo if it's a new file
    if (formData.profile_photo instanceof File) {
      formDataToSend.append('profile_photo', formData.profile_photo);
    }
      // Append documents if they exist
      if (formData.documents.medicalLicense instanceof File) {
        formDataToSend.append('medical_license', formData.documents.medicalLicense);
      }
      if (formData.documents.degreeCertificate instanceof File) {
        formDataToSend.append('degree_certificate', formData.documents.degreeCertificate);
      }
      if (formData.documents.idProof instanceof File) {
        formDataToSend.append('id_proof', formData.documents.idProof);
      }
  
      // Append clinic data
      formDataToSend.append('clinic_opening_time', formData.clinic.openingTime);
      formDataToSend.append('clinic_closing_time', formData.clinic.closingTime);
      formDataToSend.append('working_days', JSON.stringify(formData.clinic.workingDays));

    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(
        `https://medassist1.onrender.com/api/doctors/${userId}`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'X-HTTP-Method-Override': 'PATCH'
          }
        }
      );

      // In handleSubmit function, update the success handler
      if (response.data.status === 'success') {
        const updatedData = response.data.data;
        
        // Update form data with the response
        setFormData(prev => {
          // Parse working days from the response
          let workingDays = prev.clinic.workingDays;
          try {
            if (updatedData.working_days) {
              workingDays = JSON.parse(updatedData.working_days);
            }
          } catch (e) {
            console.error('Error parsing working days:', e);
          }

          return {
            ...prev,
            firstName: updatedData.first_name || prev.firstName,
            lastName: updatedData.last_name || prev.lastName,
            clinic: {
              ...prev.clinic,
              openingTime: updatedData.clinic_opening_time || prev.clinic.openingTime,
              closingTime: updatedData.clinic_closing_time || prev.clinic.closingTime,
              workingDays: {
                monday: workingDays.monday || false,
                tuesday: workingDays.tuesday || false,
                wednesday: workingDays.wednesday || false,
                thursday: workingDays.thursday || false,
                friday: workingDays.friday || false,
                saturday: workingDays.saturday || false,
                sunday: workingDays.sunday || false,
                ...workingDays
              }
            }
          };
        });

        // Update preview if profile photo was updated
        if (updatedData.profile_photo) {
          setPreview(`https://medassist1.onrender.com/storage/${updatedData.profile_photo}`);
        }

        alert('Profile updated successfully!');
        // Add a small delay before navigation to ensure state updates
        setTimeout(() => {
          navigate('/doctor/dashboard');
        }, 1000);
      }

      // In fetchProfile function, update the working days parsing
      if (response.data.status === 'success' && response.data.data) {
        const profileData = response.data.data;
        setUserId(profileData.id);
        
        // Parse working days with detailed error handling
        let workingDays = {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false
        };

        try {
          if (profileData.working_days) {
            const parsedDays = JSON.parse(profileData.working_days);
            workingDays = {
              ...workingDays,
              ...parsedDays
            };
          }
        } catch (e) {
          console.error('Error parsing working days:', e);
        }

        setFormData({
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          dateOfBirth: profileData.date_of_birth?.split('T')[0] || '',
          gender: profileData.gender || '',
          contactNumber: profileData.contact_number || '',
          email: profileData.email || '',
          registrationNumber: profileData.registration_number || '',
          specialization: profileData.specialization || '',
          experience: profileData.experience || '',
          consultationFees: profileData.consultation_fees || '',
          clinicName: profileData.clinic_name || '',
          clinicAddress: profileData.clinic_address || '',
          clinicCity: profileData.clinic_city || '',
          clinicState: profileData.clinic_state || '',
          clinicPostalCode: profileData.clinic_postal_code || '',
          clinicCountry: profileData.clinic_country || '',
          telemedicineSupport: Boolean(profileData.telemedicine_support),
          profile_photo: null,
          clinic: {
            openingTime: profileData.clinic_opening_time || '',
            closingTime: profileData.clinic_closing_time || '',
            workingDays: workingDays
          },
          documents: {
            medicalLicense: null,
            degreeCertificate: null,
            idProof: null,
            medicalLicenseUrl: profileData.medical_license ? `${process.env.REACT_APP_API_URL}/storage/${profileData.medical_license}` : null,
            degreeCertificateUrl: profileData.degree_certificate ? `${process.env.REACT_APP_API_URL}/storage/${profileData.degree_certificate}` : null,
            idProofUrl: profileData.id_proof ? `${process.env.REACT_APP_API_URL}/storage/${profileData.id_proof}` : null
          }
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(
          err.response?.data?.message || 
          'Unable to load profile data. Please try again later.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctor profile
  // Update the fetchProfile function
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          navigate('/login'); // Redirect to login if no token
          return;
        }

        const response = await axios.get('https://medassist1.onrender.com/api/doctors/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.data.status === 'success' && response.data.data) {
          const profileData = response.data.data;
          setUserId(profileData.id);
          
          // Safely parse working days
          let workingDays;
          try {
            workingDays = profileData.working_days ? JSON.parse(profileData.working_days) : {};
          } catch (e) {
            workingDays = {};
          }

          // Set default working days if not present
          const defaultWorkingDays = {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false,
            ...workingDays
          };

          setFormData({
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            dateOfBirth: profileData.date_of_birth?.split('T')[0] || '',
            gender: profileData.gender || '',
            contactNumber: profileData.contact_number || '',
            email: profileData.email || '',
            registrationNumber: profileData.registration_number || '',
            specialization: profileData.specialization || '',
            experience: profileData.experience || '',
            consultationFees: profileData.consultation_fees || '',
            clinicName: profileData.clinic_name || '',
            clinicAddress: profileData.clinic_address || '',
            clinicCity: profileData.clinic_city || '',
            clinicState: profileData.clinic_state || '',
            clinicPostalCode: profileData.clinic_postal_code || '',
            clinicCountry: profileData.clinic_country || '',
            telemedicineSupport: Boolean(profileData.telemedicine_support),
            profile_photo: null,
            clinic: {
              openingTime: profileData.clinic_opening_time || '',
              closingTime: profileData.clinic_closing_time || '',
              workingDays: defaultWorkingDays
            },
            documents: {
              medicalLicense: null,
              degreeCertificate: null,
              idProof: null,
              medicalLicenseUrl: profileData.medical_license ? `${process.env.REACT_APP_API_URL}/storage/${profileData.medical_license}` : null,
              degreeCertificateUrl: profileData.degree_certificate ? `${process.env.REACT_APP_API_URL}/storage/${profileData.degree_certificate}` : null,
              idProofUrl: profileData.id_proof ? `${process.env.REACT_APP_API_URL}/storage/${profileData.id_proof}` : null
            }
          });

          if (profileData.profile_photo) {
            setPreview(`https://medassist1.onrender.com/storage/${profileData.profile_photo}`);
          }
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError(
            err.response?.data?.message || 
            'Unable to load profile data. Please try again later.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Add this console log to debug
  useEffect(() => {
    console.log('Current formData:', formData);
    console.log('Loading state:', loading);
  }, [formData, loading]);

  // Modify the loading check to be more specific
  if (loading || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Update Profile</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">

        {/* Profile Photo */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Photo
          </label>
          <div className="flex items-center space-x-6">
            <div className="shrink-0 relative group">
              <input
                type="file"
                id="profile_photo"
                name="profile_photo"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
              />
              {/* Camera icon positioned at top */}
              <div 
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-6 right-5 z-10 bg-blue-500 rounded-full p-1.5 cursor-pointer hover:bg-blue-600 transition-colors shadow-lg"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 relative">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg className="h-full w-full text-gray-300 p-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">
                Click to change photo
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
              </div>
            </div>

       { /* Professional Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialization</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  >
                    <option value="">Select Specialization</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="neurology">Neurology</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="psychiatry">Psychiatry</option>
                    <option value="gynecology">Gynecology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    min="0"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Consultation Fees</label>
                  <input
                    type="number"
                    name="consultationFees"
                    value={formData.consultationFees}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
              </div>
            </div>

        {/* Clinic Information */}
        <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Clinic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Clinic Name</label>
                  <input
                    type="text"
                    name="clinicName"
                    value={formData.clinicName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Clinic Address</label>
                  <input
                    type="text"
                    name="clinicAddress"
                    value={formData.clinicAddress}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="clinicCity"
                    value={formData.clinicCity}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State/Province</label>
                  <input
                    type="text"
                    name="clinicState"
                    value={formData.clinicState}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input
                    type="text"
                    name="clinicPostalCode"
                    value={formData.clinicPostalCode}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    maxLength="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <select
                    name="clinicCountry"
                    value={formData.clinicCountry}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="USA">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
                
              </div>
            </div>
            

        {/* Clinic Hours and Working Days */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Clinic Hours & Working Days</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Opening Time</label>
                  <input
                    type="time"
                    name="clinic.openingTime"
                    value={formData.clinic.openingTime}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Closing Time</label>
                  <input
                    type="time"
                    name="clinic.closingTime"
                    value={formData.clinic.closingTime}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                <div className="flex flex-wrap gap-3">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        name={`clinic.workingDays.${day.toLowerCase()}`}
                        checked={formData.clinic.workingDays[day.toLowerCase()]}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-2"
                      />
                      <span className="text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
              <div className="space-y-6">
                {/* Medical License */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical License <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      name="documents.medicalLicense"
                      onChange={handleDocumentChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      id="medicalLicense"
                    />
                    <label
                      htmlFor="medicalLicense"
                      className="cursor-pointer bg-white border border-gray-300 rounded px-4 py-2 hover:bg-gray-50"
                    >
                      Choose File
                    </label>
                    <span className="text-sm text-gray-500">
                      {formData.documents.medicalLicense
                        ? formData.documents.medicalLicense.name
                        : 'No file chosen'}
                    </span>
                  </div>
                  {/* Document preview */}
                    {(formData.documents.medicalLicense || formData.documents.medicalLicenseUrl) && (
                      <div className="mt-2">
                        <a 
                          href={formData.documents.medicalLicense 
                            ? URL.createObjectURL(formData.documents.medicalLicense)
                            : formData.documents.medicalLicenseUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Document
                        </a>
                      </div>
                    )}
                </div>

                {/* Degree Certificate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Degree Certificate <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      name="documents.degreeCertificate"
                      onChange={handleDocumentChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      id="degreeCertificate"
                    />
                    <label
                      htmlFor="degreeCertificate"
                      className="cursor-pointer bg-white border border-gray-300 rounded px-4 py-2 hover:bg-gray-50"
                    >
                      Choose File
                    </label>
                    <span className="text-sm text-gray-500">
                      {formData.documents.degreeCertificate
                        ? formData.documents.degreeCertificate.name
                        : 'No file chosen'}
                    </span>
                  </div>
                  {formData.documents.degreeCertificate && (
                    <div className="mt-2">
                      <a href={URL.createObjectURL(formData.documents.degreeCertificate)} 
                         target="_blank" 
                         className="text-blue-600 hover:underline text-sm">
                        Preview Document
                      </a>
                    </div>
                  )}
                </div>

                {/* ID Proof */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Proof <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      name="documents.idProof"
                      onChange={handleDocumentChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      id="idProof"
                    />
                    <label
                      htmlFor="idProof"
                      className="cursor-pointer bg-white border border-gray-300 rounded px-4 py-2 hover:bg-gray-50"
                    >
                      Choose File
                    </label>
                    <span className="text-sm text-gray-500">
                      {formData.documents.idProof
                        ? formData.documents.idProof.name
                        : 'No file chosen'}
                    </span>
                  </div>
                  {formData.documents.idProof && (
                    <div className="mt-2">
                      <a href={URL.createObjectURL(formData.documents.idProof)} 
                         target="_blank" 
                         className="text-blue-600 hover:underline text-sm">
                        Preview Document
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Telemedicine Support */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Telemedicine Services</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="telemedicineSupport"
                  checked={formData.telemedicineSupport}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  id="telemedicineSupport"
                />
                <label htmlFor="telemedicineSupport" className="ml-2 block text-sm text-gray-700">
                  I offer telemedicine consultations
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={loading}
            >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
    </>
  );
};

export default UpdateProfile;
