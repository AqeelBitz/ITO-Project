function decodeJwtPayload(token) {
    if (!token) {
      return null;
    }
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT format');
        return null;
      }
  
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  
      const padding = '='.repeat((4 - (base64.length % 4)) % 4);
      const decoded = atob(base64 + padding);
  
      return JSON.parse(decoded);
  
    } catch (error) {
      console.error('Failed to decode JWT payload:', error);
      return null;
    }
  }
  
  export default decodeJwtPayload;