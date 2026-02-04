import { request } from './index';

// 用户API服务
const userApi = {
  // 创建用户
  createUser: async (userData) => {
    return await request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  // 获取所有用户
  getUsers: async () => {
    return await request('/users');
  },
  
  // 获取单个用户
  getUser: async (id) => {
    return await request(`/users/${id}`);
  },
  
  // 更新用户
  updateUser: async (id, userData) => {
    return await request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },
  
  // 删除用户
  deleteUser: async (id) => {
    return await request(`/users/${id}`, {
      method: 'DELETE'
    });
  }
};

export default userApi;