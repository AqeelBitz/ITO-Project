// src/utils/jwtDecoder.js or similar

function decodeJwtPayload(token) {
    if (!token) {
      return null;
    }
    try {
      // JWTs are header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT format');
        return null;
      }
  
      // Decode the Base64Url payload
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  
      // Pad the base64 string if necessary (for atob)
      const padding = '='.repeat((4 - (base64.length % 4)) % 4);
      const decoded = atob(base64 + padding);
  
      // Parse the JSON payload
      return JSON.parse(decoded);
  
    } catch (error) {
      console.error('Failed to decode JWT payload:', error);
      return null;
    }
  }
  
  export default decodeJwtPayload;