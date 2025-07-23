import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

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
            const response = await axios.post('http://localhost:5000/api/login', formData);
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                const roleRoutes = {
                    student: '/student',
                    teacher: '/teacher',
                    admin: '/admin'
                };
                
                const redirectPath = roleRoutes[response.data.user.role] || '/';
                navigate(redirectPath);
            }
        } catch (error) {
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
                <div className="login-header">
                    <div className="logo-container">
                        <img src="/ssn-logo.webp" alt="SSN Logo" className="ssn-logo" />
                    </div>
                </div>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <div className="input-group">
                            <PersonOutlineIcon className="input-icon" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Username"
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-group">
                            <LockOutlinedIcon className="input-icon" />
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? (
                            <div className="loading-spinner"></div>
                        ) : (
                            'Login'
                        )}
                    </button>
                    <div className="forgot-password">
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;