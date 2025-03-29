import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TeacherHome from './views/TeacherHome';
import Mentees from './views/TeacherHome/Mentees';
import Students from './views/TeacherHome/Students';
import Login from '../on-duty-management/src/components/Login';
import ForgotPassword from '../on-duty-management/src/components/ForgotPassword';

// ... other imports

function App() {
  return (
    <Router>
      <Routes>
        {/* ... other routes ... */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Add more routes here as we create the dashboard components */}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/teacher" element={<TeacherHome />} />
        <Route path="/teacher/mentees" element={<Mentees />} />
        <Route path="/teacher/students" element={<Students />} />
      </Routes>
    </Router>
  );
}