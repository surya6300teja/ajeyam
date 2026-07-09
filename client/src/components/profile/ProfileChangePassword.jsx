import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfileChangePassword = () => {
  const { changePassword, currentUser } = useAuth();

  // Accounts created with Google Sign-In have no password yet, so there is no
  // "current password" to ask for — they set a first one instead.
  const isSettingFirstPassword = currentUser ? currentUser.hasPassword === false : false;

  const [form, setForm] = useState({
    currentPassword: '',
    password: '',
    passwordConfirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await changePassword(
        isSettingFirstPassword ? '' : form.currentPassword,
        form.password,
        form.passwordConfirm
      );
      setSuccess(
        isSettingFirstPassword
          ? 'Password set! You can now sign in with your email and password.'
          : 'Password updated successfully!'
      );
      setForm({ currentPassword: '', password: '', passwordConfirm: '' });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="max-w-md mx-auto space-y-6" onSubmit={handleSubmit}>
      {isSettingFirstPassword && (
        <div className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded p-3">
          You signed up with Google, so you don’t have a password yet. Set one below
          to also be able to sign in with your email and password.
        </div>
      )}

      {!isSettingFirstPassword && (
        <div>
          <label className="block text-sm font-medium mb-1">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary"
            required
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">New Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary"
          required
          minLength={6}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
        <input
          type="password"
          name="passwordConfirm"
          value={form.passwordConfirm}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary"
          required
          minLength={6}
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <button
        type="submit"
        className="px-4 py-2 bg-[#992E01] text-white rounded hover:bg-primary-dark transition w-full disabled:opacity-50"
        disabled={loading}
      >
        {loading
          ? (isSettingFirstPassword ? 'Setting...' : 'Updating...')
          : (isSettingFirstPassword ? 'Set Password' : 'Change Password')}
      </button>
    </form>
  );
};

export default ProfileChangePassword;
