const TOKEN_KEY = 'auth_token';

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('isAdminLoggedIn');
  localStorage.removeItem('isDoctorLoggedIn');
  localStorage.removeItem('isReceptionistLoggedIn');
  localStorage.removeItem('adminId');
  localStorage.removeItem('doctorId');
  localStorage.removeItem('receptionistId');
  localStorage.removeItem('doctorusername');
}

export function parseJwt(token) {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((character) => `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.warn('Failed to parse JWT payload:', error);
    return null;
  }
}

export function getAuthPayload() {
  return parseJwt(getToken());
}

export function getUserRole() {
  return getAuthPayload()?.role || null;
}

export function isAuthenticated(requiredRole) {
  const payload = getAuthPayload();
  if (!payload) return false;

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    removeToken();
    return false;
  }

  return !requiredRole || payload.role === requiredRole;
}

export function getAuthHeaders() {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export function createClientToken(role, username, uid = 1) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + 86400;
  const payload = btoa(JSON.stringify({
    uid,
    role,
    username: username || `${role}_user`,
    exp,
  }));
  const signature = btoa('smart_opd_client_signature');

  return `${header}.${payload}.${signature}`;
}

export function logout(navigate) {
  removeToken();
  if (typeof navigate === 'function') {
    navigate('/', { replace: true });
  } else {
    window.location.replace('/');
  }
}
