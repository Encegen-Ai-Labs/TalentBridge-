// services/api.js
const API_URL = 'http://localhost:5000/api/auth';
const BASE_URL = 'http://localhost:5000/api';

// ============================================
// AUTHENTICATION SERVICES
// ============================================

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Login failed');
  return data;
};

export const register = async (userData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Registration failed');
  return data;
};

export const registerCompany = async (companyData) => {
  const response = await fetch(`${API_URL}/register-company`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(companyData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Company registration failed');
  return data;
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_URL}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to send reset link');
  return data;
};

// ============================================
// COMPANY SERVICES
// ============================================

export const getCompanyProfileStatus = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/company/profile-status`, {
    method: 'GET',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch profile status');
  return data;
};

// ADD THIS FUNCTION - It's missing in your current api.js
export const getCompanyProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/company/profile`, {
    method: 'GET',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch company profile');
  return data;
};

export const updateCompanyProfile = async (profileData) => {
  const token = localStorage.getItem('token');
  const isForm = profileData instanceof FormData;
  const response = await fetch(`${BASE_URL}/company/profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    },
    body: isForm ? profileData : JSON.stringify(profileData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update company profile');
  return data;
};

export const getDashboardStats = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/company/dashboard-stats`, {
    method: 'GET',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch dashboard stats');
  return data;
};

export const getCompanyApplicants = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/company/applicants`, {
    method: 'GET',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch applicants');
  return data.data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/company/applications/${applicationId}/status`, {
    method: 'PUT',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update status');
  return data;
};

// ============================================
// JOB SERVICES
// ============================================

export const createJob = async (jobData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/jobs/create`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(jobData),
  });
  const data = await response.json();
  if (!response.ok) {
    console.error('Create job error:', data);
    throw new Error(data.message || data.error || 'Failed to create job posting');
  }
  return data;
};

export const getAllJobs = async () => {
  const response = await fetch(`${BASE_URL}/jobs`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch jobs');
  return data.jobs;
};

export const getJobById = async (jobId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/jobs/${jobId}`, {
    method: 'GET',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch job details');
  return data;
};

export const getCompanyInternships = async () => {
  const response = await fetch(`${BASE_URL}/jobs/internships`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch internships');
  return data.jobs;
};

export const searchJobs = async (query, type = 'all') => {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (type && type !== 'all') params.set('type', type);
  const response = await fetch(`${BASE_URL}/jobs/search?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Search failed');
  return data.jobs || [];
};

// ============================================
// APPLICATION SERVICES
// ============================================

export const applyJob = async (jobId, details = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/applications/apply`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      job_id: jobId,
      availability: details.availability,
      resume_option: details.resume_option,
      manual_resume_name: details.manual_resume_name,
      manual_resume_data: details.manual_resume_data,
      cover_letter: details.cover_letter,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    const err = data.error ? ` (${data.error})` : '';
    throw new Error((data.message || 'Failed to submit application') + err);
  }
  return data;
};

// services/api.js - Add this function

export const getMyApplications = async () => {
  const token = localStorage.getItem('token');
  console.log('Getting applications with token:', token);
  
  const response = await fetch('http://localhost:5000/api/applications/my', {
    method: 'GET',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
  });
  
  console.log('Response status:', response.status);
  const data = await response.json();
  console.log('Response data:', data);
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch applications');
  }
  
  return data;
};
// ============================================
// STUDENT SERVICES
// ============================================

export const getStudentProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/student/profile`, {
    method: 'GET',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch student profile');
  return data;
};

export const updateStudentProfile = async (profileData) => {
  const token = localStorage.getItem('token');
  const isForm = profileData instanceof FormData;
  const response = await fetch(`${BASE_URL}/student/profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    },
    body: isForm ? profileData : JSON.stringify(profileData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update student profile');
  return data;
};

export const getPreferences = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/student/preferences`, {
    method: 'GET',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch preferences');
  return data.preferences;
};

export const updatePreferences = async (preferences) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/student/preferences`, {
    method: 'PUT',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ preferences }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update preferences');
  return data;
};

export const saveJob = async (jobId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/student/saved/${jobId}`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to save job');
  return data.savedJobs;
};

export const hideJob = async (jobId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/student/hidden/${jobId}`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to hide job');
  return data.hiddenJobs;
};

export const getSavedJobs = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/student/saved`, {
    method: 'GET',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch saved jobs');
  return data.savedJobs;
};

export const getHiddenJobs = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/student/hidden`, {
    method: 'GET',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch hidden jobs');
  return data.hiddenJobs;
};

export const removeSavedJob = async (jobId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/student/saved/${jobId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to remove saved job');
  return data.savedJobs;
};

// ============================================
// NOTIFICATION SERVICES
// ============================================

export const getNotifications = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/notifications`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch notifications');
  return data;
};

export const markNotificationAsRead = async (notificationId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to mark notification as read');
  return data;
};

export const markAllNotificationsAsRead = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/notifications/read-all`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to mark all notifications as read');
  return data;
};