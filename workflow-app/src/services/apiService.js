const getAuthHeaders = () => {
  const session = localStorage.getItem('session');
  if (!session) return {};
  
  const { access_token } = JSON.parse(session);
  return {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json',
  };
};

export const apiRequest = async (url, options = {}) => {
  // Add auth headers to request
  const headers = {
    ...options.headers,
    ...getAuthHeaders(),
  };

  try {
    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized, try to refresh token
    if (response.status === 401) {
      const session = localStorage.getItem('session');
      if (session) {
        const { refresh_token } = JSON.parse(session);
        
        try {
          // Try to refresh the token
          const refreshResponse = await fetch('http://localhost:8080/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token }),
          });
          
          const refreshData = await refreshResponse.json();
          
          if (refreshData.access_token) {
            // Update session in localStorage
            const updatedSession = {
              ...JSON.parse(session),
              access_token: refreshData.access_token,
              refresh_token: refreshData.refresh_token || JSON.parse(session).refresh_token,
            };
            localStorage.setItem('session', JSON.stringify(updatedSession));
            
            // Retry the request with new token
            const newHeaders = {
              ...options.headers,
              'Authorization': `Bearer ${refreshData.access_token}`,
              'Content-Type': 'application/json',
            };
            
            const retryResponse = await fetch(url, {
              ...options,
              headers: newHeaders,
            });
            
            return retryResponse;
          } else {
            // If refresh fails, clear session and redirect to login
            localStorage.removeItem('session');
            window.location.href = '/login';
            throw new Error('Session expired. Please login again.');
          }
        } catch (error) {
          // If refresh fails, clear session and redirect to login
          localStorage.removeItem('session');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};
