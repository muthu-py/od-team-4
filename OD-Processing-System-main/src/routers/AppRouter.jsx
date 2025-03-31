import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import * as ROUTES from '../constants/routes'
import * as view from '@/views'
import Navbar from '../components/common/Navbar.jsx'
import Mentees from '../views/TeacherHome/mentees.jsx'
import Students from '../views/TeacherHome/students.jsx'
import Login from '../components/auth/Login'
import Register from '../components/auth/Register'
import ForgotPassword from '../components/auth/ForgotPassword'
import StudentProfile from '../views/StudentHome/StudentProfile.jsx'
import StudentHistory from '../views/StudentHome/StudentHistory.jsx'
import TeacherDashboard from '../views/TeacherHome/index.jsx';
import AdminDashboard from '../components/admin/AdminDashboard.jsx'
import Form from '../components/form/Form'
import MenteeRequests from '../components/teacher/MenteeRequests'
import ClassAdvisorRequests from '../components/teacher/ClassAdvisorRequests'
import Reports from '../components/reports/Reports'
import StudentNav from '../components/student/StudentNav'
import TeacherNav from '../components/teacher/TeacherNav'
import AdminNav from '../components/admin/AdminNav'

const AppRouter = () => {
    const isAuthenticated = () => {
        return localStorage.getItem('token') !== null;
    };

    const getRole = () => {
        return localStorage.getItem('userRole');
    };

    const PrivateRoute = ({ children, allowedRoles }) => {
        if (!isAuthenticated()) {
            return <Navigate to="/login" />;
        }

        const role = getRole();
        if (allowedRoles && !allowedRoles.includes(role)) {
            return <Navigate to="/" />;
        }

        return children;
    };

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Student Routes */}
                <Route
                    path="/student/home"
                    element={
                        <PrivateRoute allowedRoles={['student']}>
                            <>
                                <StudentNav />
                                <StudentHome />
                            </>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/student/od-form"
                    element={
                        <PrivateRoute allowedRoles={['student']}>
                            <>
                                <StudentNav />
                                <Form />
                            </>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/student/reports"
                    element={
                        <PrivateRoute allowedRoles={['student']}>
                            <>
                                <StudentNav />
                                <Reports />
                            </>
                        </PrivateRoute>
                    }
                />

                {/* Teacher Routes */}
                <Route
                    path="/teacher/home"
                    element={
                        <PrivateRoute allowedRoles={['teacher']}>
                            <>
                                <TeacherNav />
                                <TeacherHome />
                            </>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/teacher/mentee-requests"
                    element={
                        <PrivateRoute allowedRoles={['teacher']}>
                            <>
                                <TeacherNav />
                                <MenteeRequests />
                            </>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/teacher/class-advisor-requests"
                    element={
                        <PrivateRoute allowedRoles={['teacher']}>
                            <>
                                <TeacherNav />
                                <ClassAdvisorRequests />
                            </>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/teacher/reports"
                    element={
                        <PrivateRoute allowedRoles={['teacher']}>
                            <>
                                <TeacherNav />
                                <Reports />
                            </>
                        </PrivateRoute>
                    }
                />

                {/* Admin Routes */}
                <Route
                    path="/admin/home"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <>
                                <AdminNav />
                                <AdminDashboard />
                            </>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <>
                                <AdminNav />
                                <AdminDashboard />
                            </>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/reports"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <>
                                <AdminNav />
                                <Reports />
                            </>
                        </PrivateRoute>
                    }
                />

                {/* Logout Route */}
                <Route
                    path="/logout"
                    element={
                        <PrivateRoute>
                            {() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('userRole');
                                return <Navigate to="/login" />;
                            }}
                        </PrivateRoute>
                    }
                />

                {/* Default Route */}
                <Route
                    path="/"
                    element={
                        isAuthenticated() ? (
                            <Navigate
                                to={`/${getRole()}/home`}
                            />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
            </Routes>
        </Router>
    )
}

export default AppRouter;