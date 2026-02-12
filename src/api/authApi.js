import { request } from './index';

const authApi = {
  login: async (email, password) => {
    return await request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  
  register: async (name, email, password) => {
    return await request('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default authApi;
