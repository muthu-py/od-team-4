import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import * as ROUTES from '../constants/routes';
import '../styles/Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            console.log('Attempting login with:', formData);
            const response = await axios.post('http://localhost:5000/api/login', formData);
            
            if (response.data.token) {
                console.log('Login successful:', response.data);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Redirect based on role
                const roleRoutes = {
                    student: ROUTES.STUDENT,
                    teacher: ROUTES.TEACHER,
                    admin: ROUTES.ADMIN
                };
                
                const redirectPath = roleRoutes[response.data.user.role];
                console.log('Redirecting to:', redirectPath);
                
                if (redirectPath) {
                    navigate(redirectPath);
                } else {
                    console.error('Invalid role:', response.data.user.role);
                    setError('Invalid user role');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(
                error.response?.data?.message || 
                'Unable to connect to the server. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2 className="login-title">SSN On-Duty Management</h2>
                {error && <div className="error-message">{error}</div>}
                <div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    <div className="forgot-password">
                        <Link to={ROUTES.FORGOT_PASSWORD}>Forgot Password?</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;