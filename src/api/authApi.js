import { request } from './index';

const authApi = {
  login: async (account, password) => {
    return await request('/login', {
      method: 'POST',
      body: JSON.stringify({ account, password })
    });
  },

  register: async (name, account, password) => {
    return await request('/register', {
      method: 'POST',
      body: JSON.stringify({ name, account, password })
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
