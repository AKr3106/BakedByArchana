import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCallback } from 'react';

/**
 * A hook to wrap actions that require the user to be logged in.
 * If the user is authenticated, the action is executed.
 * If not, the user is immediately redirected to /auth, preserving their intended destination.
 */
export const useRequireAuth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = useCallback(
    (actionCallback) => {
      if (!user) {
        // Not logged in -> Redirect to auth, passing the current URL so they can return
        navigate('/auth', { state: { from: location.pathname } });
        return;
      }
      
      // Logged in -> Proceed with the action
      if (typeof actionCallback === 'function') {
        actionCallback();
      }
    },
    [user, navigate, location]
  );

  return requireAuth;
};
