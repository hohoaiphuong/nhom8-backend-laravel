import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';

/**
 * Hook for logout functionality
 * Clears authentication data from localStorage and redirects to login
 */
export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      // Try to call logout endpoint (optional - for cleanup)
      await authApi.logout();
    } catch (error) {
      // Continue logout even if endpoint fails
      console.warn('Logout endpoint error:', error);
    } finally {
      // Always clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('user');
      
      // Clear cart data
      localStorage.removeItem('cart');
      
      // Dispatch event to notify Header about logout
      window.dispatchEvent(new Event('userLoggedOut'));
      
      // Redirect to login
      navigate('/login');
    }
  };

  return { logout };
};
