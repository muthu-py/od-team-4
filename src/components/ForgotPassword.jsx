import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post('http://localhost:5000/api/forgot-password', { email });
            setMessage('Password reset instructions have been sent to your email.');
            setIsSubmitted(true);
        } catch (error) {
            setError(
                error.response?.data?.message || 
                'Unable to process your request. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-box">
                <h2 className="forgot-password-title">Reset Password</h2>
                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}
                <div>
                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="submit-button" disabled={isLoading}>
                                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                            </button>
                        </form>
                    ) : (
                        <div className="back-to-login">
                            <Link to="/">Back to Login</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;