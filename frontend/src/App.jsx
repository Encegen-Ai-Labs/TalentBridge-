import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployerLogin from './pages/EmployerLogin';
import EmployerRegister from './pages/EmployerRegister';
import CompanyDashboard from './pages/CompanyDashboard';
import PostJob from './pages/PostJob';
import StudentOpportunities from './pages/StudentOpportunities';
import EditPreferences from './pages/EditPreferences';
import EditResume from './pages/EditResume';
import MyApplications from './pages/MyApplications';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import Applicants from './pages/Applicants';

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

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={2500} />
      <Navbar />
      <Routes>

        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/employer/login" element={<EmployerLogin />} />
        <Route path="/employer/register" element={<EmployerRegister />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/post-job" element={<PostJob />} />
        <Route path="/internships" element={<StudentOpportunities />} />
        <Route path="/jobs" element={<StudentOpportunities />} />
        <Route path="/edit-preferences" element={<EditPreferences />} />
        <Route path="/edit-resume" element={<EditResume />} />
        <Route path="/applications" element={<MyApplications />} />
        <Route path="/company/applicants" element={<Applicants />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
