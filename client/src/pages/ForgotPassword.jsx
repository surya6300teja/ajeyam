import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await api.auth.forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="py-16 bg-background min-h-[60vh]">
            <div className="container-custom max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold font-serif text-text mb-2">Forgot Password</h1>
                    <p className="text-gray-600">
                        {success
                            ? 'Check your inbox for a reset link.'
                            : "Enter your email and we'll send you a link to reset your password."}
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
                            <p>{error}</p>
                        </div>
                    )}

                    {success ? (
                        <div className="text-center">
                            <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                                </svg>
                            </div>
                            <p className="text-gray-700 mb-6 leading-relaxed">
                                We've sent a password reset link to <strong>{email}</strong>. Please check your email and click the link to reset your password.
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Didn't receive the email? Check your spam folder or{' '}
                                <button
                                    onClick={() => { setSuccess(false); setError(''); }}
                                    className="text-primary hover:text-primary-dark font-medium underline"
                                >
                                    try again
                                </button>.
                            </p>
                            <Link
                                to="/login"
                                className="inline-block bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition"
                            >
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-2 px-4 border border-transparent rounded-md font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </div>
                                ) : 'Send Reset Link'}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            Remember your password?{' '}
                            <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
