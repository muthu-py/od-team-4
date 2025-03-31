import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/ForgotPassword.css';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockIcon from '@mui/icons-material/Lock';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [isLoading, setIsLoading] = useState(false);
    const [resetToken, setResetToken] = useState('');

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post('http://localhost:5000/api/forgot-password', { email });
            setMessage('OTP has been sent to your email');
            setStep(2);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post('http://localhost:5000/api/verify-otp', { email, otp });
            setResetToken(response.data.resetToken);
            setMessage('OTP verified successfully');
            setStep(3);
        } catch (error) {
            setError(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post('http://localhost:5000/api/reset-password', {
                resetToken,
                newPassword
            });
            setMessage('Password reset successful');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-box">
                <div className="logo-container">
                    <img src="/ssn-logo.webp" alt="SSN Logo" className="ssn-logo" />
                </div>
                <h2 className="forgot-password-title">Reset Password</h2>
                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                {step === 1 && (
                    <form onSubmit={handleSendOTP}>
                        <div className="form-group">
                            <div className="input-group">
                                <PersonOutlineIcon className="input-icon" />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="submit-button" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOTP}>
                        <div className="form-group">
                            <div className="input-group">
                                <LockIcon className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    maxLength="6"
                                />
                            </div>
                        </div>
                        <button type="submit" className="submit-button" disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <div className="input-group">
                                <LockIcon className="input-icon" />
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength="6"
                                />
                            </div>
                        </div>
                        <button type="submit" className="submit-button" disabled={isLoading}>
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div className="back-to-login">
                    <Link to="/login">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;