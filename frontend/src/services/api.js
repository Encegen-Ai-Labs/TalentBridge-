const API_URL = 'http://localhost:5000/api/auth';

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

export const getDashboardStats = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/company/dashboard-stats', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch dashboard stats');
  return data;
};

export const createJob = async (jobData) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/jobs/create', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create job posting');
  return data;
};

export const getAllJobs = async () => {
  const response = await fetch('http://localhost:5000/api/jobs', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch jobs');
  return data.jobs;
};

// Fetch a single job by its ID
export const getJobById = async (jobId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch job details');
  return data;
};

// Fetch only internships posted by companies
export const getCompanyInternships = async () => {
  const response = await fetch('http://localhost:5000/api/jobs/internships', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch internships');
  return data.jobs;
};

export const applyJob = async (jobId, details = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/applications/apply', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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

export const getPreferences = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/student/preferences', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch preferences');
  return data.preferences;
};

export const updatePreferences = async (preferences) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/student/preferences', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferences }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update preferences');
  return data;
};

export const getStudentProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/student/profile', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch student profile');
  return data;
};

export const updateStudentProfile = async (profileData) => {
  const token = localStorage.getItem('token');
  const isForm = profileData instanceof FormData;
  const response = await fetch('http://localhost:5000/api/student/profile', {
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

export const getMyApplications = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/applications/my', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch applied applications.');
  return data;
};

export const getCompanyApplicants = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/company/applicants', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch applicants');
  return data.data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000/api/company/applications/${applicationId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update status');
  return data;
};

export const getCompanyProfileStatus = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/company/profile-status', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch profile status');
  return data;
};

export const updateCompanyProfile = async (profileData) => {
  const token = localStorage.getItem('token');
  const isForm = profileData instanceof FormData;
  const response = await fetch('http://localhost:5000/api/company/profile', {
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

export const saveJob = async (jobId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000/api/student/saved/${jobId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to save job');
  return data.savedJobs;
};

export const hideJob = async (jobId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000/api/student/hidden/${jobId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to hide job');
  return data.hiddenJobs;
};

export const getSavedJobs = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/student/saved', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch saved jobs');
  return data.savedJobs;
};

export const getHiddenJobs = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/student/hidden', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch hidden jobs');
  return data.hiddenJobs;
};

export const removeSavedJob = async (jobId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000/api/student/saved/${jobId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to remove saved job');
  return data.savedJobs;
};