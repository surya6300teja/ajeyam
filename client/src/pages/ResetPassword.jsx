import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ password: '', passwordConfirm: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.passwordConfirm) {
            setError('Passwords do not match.');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setIsLoading(true);
        try {
            await api.auth.resetPassword(token, {
                password: formData.password,
                passwordConfirm: formData.passwordConfirm,
            });
            // Redirect to login with success message via state
            navigate('/login', { state: { message: 'Password reset successful! Please sign in with your new password.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="py-16 bg-background min-h-[60vh]">
            <div className="container-custom max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold font-serif text-text mb-2">Reset Password</h1>
                    <p className="text-gray-600">Choose a new password for your account.</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                                    placeholder="••••••••"
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                id="passwordConfirm"
                                name="passwordConfirm"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={formData.passwordConfirm}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="••••••••"
                                minLength={8}
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
                                    Resetting...
                                </div>
                            ) : 'Reset Password'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
                                Back to Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
