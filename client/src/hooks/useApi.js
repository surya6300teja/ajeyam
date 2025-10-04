import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for handling API requests with loading, error, and data states
 * @param {Function} apiFunction - The API function to call
 * @param {boolean} immediate - Whether to call the API function immediately
 * @param {Array} dependencies - Dependencies array for immediate API calls
 * @param {any} initialData - Initial data state
 * @returns {Object} Object containing data, loading, error states and execute function
 */
const useApi = (apiFunction, immediate = false, dependencies = [], initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  
  // Function to execute the API call
  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(...args);
      const result = response.data;
      
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);
  
  // Call API function immediately if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, execute]);
  
  // Reset states
  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);
  
  return { 
    data, 
    loading, 
    error, 
    execute,
    reset
  };
};

export default useApi; 