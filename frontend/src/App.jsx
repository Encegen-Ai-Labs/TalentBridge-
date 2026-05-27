import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployerLogin from './pages/EmployerLogin';
import EmployerRegister from './pages/EmployerRegister';
import CompanyDashboard from './pages/CompanyDashboard';
import CompanyProfile from './pages/CompanyProfile';
import PostJob from './pages/PostJob';
import StudentOpportunityViewOnly from './pages/StudentOpportunityViewOnly';
import OpportunityDetails from './pages/OpportunityDetails';
import EditPreferences from './pages/EditPreferences';
import EditResume from './pages/EditResume';
import MyApplications from './pages/MyApplications';
import Applicants from './pages/Applicants';
import ContactUs from './pages/ContactUs';
import Navbar from './components/Navbar';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import './index.css';

function HomeRedirect() {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (!token || !storedUser) {
    return <StudentOpportunityViewOnly />;
  }

  try {
    const user = JSON.parse(storedUser);
    if (user.role === 'company') {
      return <Navigate to="/company/dashboard" replace />;
    }
  } catch (e) {
    // ignore
  }

  return <StudentOpportunityViewOnly />;
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
        <Route path="/internships" element={<StudentOpportunityViewOnly />} />
        <Route path="/jobs" element={<StudentOpportunityViewOnly />} />
        <Route path="/edit-preferences" element={<EditPreferences />} />
        <Route path="/edit-resume" element={<EditResume />} />
        <Route path="/applications" element={<MyApplications />} />
        <Route path="/company/applicants" element={<Applicants />} />
        <Route path="/Contact Us" element={<ContactUs />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/opportunity/:id" element={<OpportunityDetails />} />
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
