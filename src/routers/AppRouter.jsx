import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import * as ROUTES from '../constants/routes'
import * as view from '@/views'
import Navbar from '../components/common/Navbar.jsx'
import Mentees from '../views/TeacherHome/mentees.jsx'
import Students from '../views/TeacherHome/students.jsx'
import Login from '../components/Login.jsx'
import ForgotPassword from '../components/ForgotPassword.jsx'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to={ROUTES.LOGIN} />;
    }
    return children;
};

function AppRouter() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path={ROUTES.LOGIN} element={<Login />} />
                <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
                
                {/* Protected Routes with Navbar */}
                <Route path={ROUTES.STUDENT} element={
                    <ProtectedRoute>
                        <>
                            <Navbar />
                            <view.StudentHome />
                        </>
                    </ProtectedRoute>
                } />
                
                <Route path={ROUTES.TEACHER} element={
                    <ProtectedRoute>
                        <>
                            <Navbar />
                            <view.TeacherHome />
                        </>
                    </ProtectedRoute>
                } />
                
                <Route path={ROUTES.MENTEES} element={
                    <ProtectedRoute>
                        <>
                            <Navbar />
                            <Mentees />
                        </>
                    </ProtectedRoute>
                } />
                
                <Route path={ROUTES.STUDENTS} element={
                    <ProtectedRoute>
                        <>
                            <Navbar />
                            <Students />
                        </>
                    </ProtectedRoute>
                } />
                
                {/* Redirect any unknown routes to login */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    )
}

export default AppRouter