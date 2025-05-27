const checkTokenExpiration = () => {
    const tokenExpiration = localStorage.getItem('tokenExpiration');
    if (!tokenExpiration) {
      return true; 
    }
    const now = Date.now();
    const expirationTimestampMs = parseInt(tokenExpiration, 10);
    return expirationTimestampMs < now;
  };
  
  const handleLogout = (router) => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('authResponse');
    if (router) {
      router.push('/login');
    } else {
      console.error('Router instance not available for logout.');
    }
  };
  
  const apiRequest = async (url, options = {}, router = null) => {
    if (checkTokenExpiration()) {
      handleLogout(router);
      throw new Error('Session expired. Please log in again.');
    }
  
    const authToken = localStorage.getItem('authToken');
    const headers = {
      ...options.headers,
      'Authorization': authToken ? `Bearer ${authToken}` : '',
    };
  
    const response = await fetch(url, { ...options, headers });
    return response;
  };
  
  export default apiRequest;