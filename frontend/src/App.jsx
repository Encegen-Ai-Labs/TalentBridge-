import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployerLogin from './pages/EmployerLogin';
import EmployerRegister from './pages/EmployerRegister';
import CompanyDashboard from './pages/CompanyDashboard';
import CompanyProfile from './pages/CompanyProfile';
import PostJob from './pages/PostJob';
import StudentOpportunities from './pages/StudentOpportunities';
import OpportunityDetails from './pages/OpportunityDetails';
import ApplyJob from './pages/ApplyJob';
import EditPreferences from './pages/EditPreferences';
import EditResume from './pages/EditResume';
import MyApplications from './pages/MyApplications';
import Applicants from './pages/Applicants';
import ContactUs from './pages/ContactUs';
import Navbar from './components/Navbar';
import SavedJobs from './pages/SavedJobs';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import './index.css';

function HomeRedirect() {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (!token || !storedUser) {
    return <StudentOpportunities />;
  }

  try {
    const user = JSON.parse(storedUser);
    if (user.role === 'company') {
      return <Navigate to="/company/dashboard" replace />;
    }
  } catch (e) {
    // ignore
  }

  return <StudentOpportunities />;
}

function AppContent() {
  const location = useLocation();
  const hideNavbar = ['/login', '/register', '/employer/login', '/forgot-password'].includes(location.pathname);
  return (
    <>
      <ToastContainer position="top-right" autoClose={2500} />
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/employer/login" element={<EmployerLogin />} />
        <Route path="/employer/register" element={<EmployerRegister />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/profile" element={<CompanyProfile />} />
        <Route path="/company/post-job" element={<PostJob />} />
        <Route path="/internships" element={<StudentOpportunities />} />
        <Route path="/jobs" element={<StudentOpportunities />} />
        <Route path="/saved-jobs" element={<SavedJobs />} />
        <Route path="/edit-preferences" element={<EditPreferences />} />
        <Route path="/edit-resume" element={<EditResume />} />
        <Route path="/applications" element={<MyApplications />} />
        <Route path="/company/applicants" element={<Applicants />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/opportunity/:id" element={<OpportunityDetails />} />
        <Route path="/apply/:id" element={<ApplyJob />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
