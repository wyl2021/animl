<template>
  <div class="user-list">
    <h2>用户管理</h2>
    <div class="action-bar">
      <router-link to="/users/add" class="btn btn-primary">添加用户</router-link>
    </div>
    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>
    <div v-else>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>姓名</th>
              <th>邮箱</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td class="actions">
                <router-link :to="`/users/edit/${user.id}`" class="btn btn-sm btn-edit">编辑</router-link>
                <button @click="deleteUser(user.id)" class="btn btn-sm btn-delete">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="users.length === 0" class="empty-state">
        <p>暂无用户数据</p>
      </div>
    </div>
  </div>
</template>

<script>
import userApi from '../../api/userApi';

export default {
  name: 'UserList',
  data() {
    return {
      users: [],
      loading: true
    };
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        this.loading = true;
        this.users = await userApi.getUsers();
      } catch (error) {
        console.error('获取用户列表失败:', error);
        alert('获取用户列表失败，请重试');
      } finally {
        this.loading = false;
      }
    },
    async deleteUser(id) {
      if (confirm('确定要删除该用户吗？')) {
        try {
          await userApi.deleteUser(id);
          alert('用户删除成功');
          this.fetchUsers(); // 重新获取用户列表
        } catch (error) {
          console.error('删除用户失败:', error);
          alert('删除用户失败，请重试');
        }
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN');
    }
  }
};
</script>

<style scoped>
.user-list {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.action-bar {
  margin-bottom: 1.5rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.table th {
  background-color: #f5f5f5;
  font-weight: bold;
  color: #333;
}

.table tr:hover {
  background-color: #f9f9f9;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-sm {
  padding: 0.3rem 0.6rem;
  font-size: 0.875rem;
}

.btn-edit {
  background-color: #2196F3;
  color: white;
}

.btn-edit:hover {
  background-color: #0b7dda;
}

.btn-delete {
  background-color: #f44336;
  color: white;
  border: none;
}

.btn-delete:hover {
  background-color: #da190b;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

@media (max-width: 768px) {
  .user-list {
    padding: 1rem;
  }

  .table {
    font-size: 0.875rem;
  }

  .table th,
  .table td {
    padding: 0.5rem;
  }
}
</style>