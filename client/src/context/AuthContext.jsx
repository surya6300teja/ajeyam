import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Create context
const AuthContext = createContext();

// Context Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Fetch current user data
        const response = await api.auth.getCurrentUser();
        const userData = response.data.data.user;
        
        setCurrentUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.role === 'admin');
      } catch (error) {
        console.error('Error loading user:', error);
        // Clear invalid token
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await api.auth.login({ email, password });
      const { token, data } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Set user data
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      setIsAdmin(data.user.role === 'admin');
      
      return data.user;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const signup = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('AuthContext received signup data:', userData);
      
      // Validate that we have all required fields
      if (!userData || !userData.name || !userData.email || !userData.password || !userData.passwordConfirm) {
        console.error('Missing required user data fields:', userData);
        throw new Error('Missing required registration fields');
      }
      
      // Ensure userData is a plain object with proper field names
      const requestData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        passwordConfirm: userData.passwordConfirm
      };
      
      console.log('Sending registration data to API:', requestData);
      
      const response = await api.auth.register(requestData);
      const { token, data } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Set user data
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      setIsAdmin(data.user.role === 'admin');
      
      return data.user;
    } catch (err) {
      console.error('Registration error in AuthContext:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.auth.logout();
      
      // Clear state
      setCurrentUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await api.users.updateProfile(userData);
      const updatedUser = response.data.data.user;
      
      setCurrentUser(updatedUser);
      
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change password function
  const changePassword = async (currentPassword, password, passwordConfirm) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await api.users.updatePassword({
        currentPassword,
        password,
        passwordConfirm
      });
      
      // Update token if a new one is returned
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear error message
  const clearError = () => setError(null);

  // Create context value object
  const value = {
    currentUser,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext; 