import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authTokens, setAuthTokens] = useState(() => {
    const storedSession = localStorage.getItem('session');
    return storedSession ? JSON.parse(storedSession) : null;
  });

  // Check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Set up automatic token refresh
  useEffect(() => {
    let refreshInterval;

    const verifyToken = async () => {
      if (!authTokens) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      // Check if token is expired
      if (isTokenExpired(authTokens.access_token)) {
        try {
          const response = await fetch('http://localhost:8080/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: authTokens.refresh_token }),
          });
          
          const data = await response.json();
          
          if (data.access_token) {
            const newTokens = {
              access_token: data.access_token,
              refresh_token: data.refresh_token || authTokens.refresh_token,
              user: authTokens.user
            };
            setAuthTokens(newTokens);
            localStorage.setItem('session', JSON.stringify(newTokens));
            setCurrentUser(authTokens.user);
          } else {
            // If refresh fails, log out
            logout();
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
          logout();
        }
      } else {
        // Token is valid
        setCurrentUser(authTokens.user);
      }
      setLoading(false);
    };

    verifyToken();
    
    // Set up interval to refresh token
    if (authTokens) {
      refreshInterval = setInterval(() => {
        verifyToken();
      }, 4 * 60 * 1000); // Refresh every 4 minutes
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [authTokens]);

  const login = (sessionData) => {
    setAuthTokens(sessionData);
    setCurrentUser(sessionData.user);
    localStorage.setItem('session', JSON.stringify(sessionData));
  };

  const logout = () => {
    setAuthTokens(null);
    setCurrentUser(null);
    localStorage.removeItem('session');
  };

  const value = {
    currentUser,
    authTokens,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
