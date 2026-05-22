const API_URL = 'http://localhost:5000/api/auth';

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  return data;
};

export const register = async (userData) => {

  const response = await fetch(
    `${API_URL}/register`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(userData),
    }
  );

  // parse response
  const data = await response.json();

  // if backend error
  if (!response.ok) {
    throw new Error(
      data.message || 'Registration failed'
    );
  }

  return data;
};

export const registerCompany = async (companyData) => {
  const response = await fetch(
    `${API_URL}/register-company`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Company registration failed'
    );
  }

  return data;
};

export const getDashboardStats = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:5000/api/company/dashboard-stats',
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to fetch dashboard stats'
    );
  }

  return data;
};

export const createJob = async (jobData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:5000/api/jobs/create',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to create job posting'
    );
  }

  return data;
};

export const getAllJobs = async () => {
  const response = await fetch(
    'http://localhost:5000/api/jobs',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to fetch jobs list'
    );
  }

  return data.jobs;
};

export const applyJob = async (jobId, details = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:5000/api/applications/apply',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        job_id: jobId,
        availability: details.availability,
        resume_option: details.resume_option,
        manual_resume_name: details.manual_resume_name,
        manual_resume_data: details.manual_resume_data
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const errorDetails = data.error ? ` (${data.error})` : '';
    throw new Error(
      (data.message || 'Failed to submit application') + errorDetails
    );
  }

  return data;
};

export const getPreferences = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:5000/api/student/preferences',
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to fetch preferences'
    );
  }

  return data.preferences;
};

export const updatePreferences = async (preferences) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:5000/api/student/preferences',
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ preferences }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to update preferences'
    );
  }

  return data;
};

export const getStudentProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:5000/api/student/profile',
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch student profile');
  }
  return data;
};

export const updateStudentProfile = async (profileData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:5000/api/student/profile',
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update student profile');
  }
  return data;
};

export const getMyApplications = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:5000/api/applications/my',
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch applied applications.');
  }
  return data;
};

// ===============================
// GET COMPANY APPLICANTS
// ===============================
export const getCompanyApplicants = async () => {
  const token = localStorage.getItem('token');

  const response = await fetch(
    'http://localhost:5000/api/company/applicants',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to fetch applicants'
    );
  }

  return data.data;
};

// ===============================
// UPDATE APPLICATION STATUS
// ===============================
export const updateApplicationStatus = async (
  applicationId,
  status
) => {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `http://localhost:5000/api/company/applications/${applicationId}/status`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to update status'
    );
  }

  return data;
};