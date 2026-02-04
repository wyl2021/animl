<template>
  <div class="user-form">
    <h2>{{ isEdit ? '编辑用户' : '添加用户' }}</h2>
    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>
    <form v-else @submit.prevent="saveUser">
      <div class="form-group">
        <label for="name">姓名</label>
        <input type="text" id="name" v-model="user.name" required placeholder="请输入姓名">
      </div>
      <div class="form-group">
        <label for="email">邮箱</label>
        <input type="email" id="email" v-model="user.email" required placeholder="请输入邮箱">
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" v-model="user.password" :required="!isEdit" placeholder="请输入密码">
      </div>
      <div class="form-actions">
        <router-link to="/users" class="btn btn-secondary">取消</router-link>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import userApi from '../../api/userApi';

export default {
  name: 'UserForm',
  data() {
    return {
      user: {
        id: null,
        name: '',
        email: '',
        password: ''
      },
      loading: true,
      saving: false
    };
  },
  computed: {
    isEdit() {
      return !!this.$route.params.id;
    }
  },
  mounted() {
    if (this.isEdit) {
      this.loadUser();
    } else {
      this.loading = false;
    }
  },
  methods: {
    async loadUser() {
      try {
        const id = parseInt(this.$route.params.id);
        const userData = await userApi.getUser(id);
        this.user = {
          ...userData,
          password: '' // 密码字段不从API返回
        };
      } catch (error) {
        console.error('获取用户信息失败:', error);
        alert('获取用户信息失败，请重试');
      } finally {
        this.loading = false;
      }
    },
    async saveUser() {
      try {
        this.saving = true;
        
        const userData = {
          name: this.user.name,
          email: this.user.email
        };
        
        // 只有在添加用户或修改密码时才包含password字段
        if (this.user.password) {
          userData.password = this.user.password;
        }
        
        if (this.isEdit) {
          // 编辑用户
          await userApi.updateUser(this.user.id, userData);
          alert('用户编辑成功');
        } else {
          // 添加用户
          await userApi.createUser(userData);
          alert('用户添加成功');
        }
        
        this.$router.push('/users');
      } catch (error) {
        console.error('保存用户失败:', error);
        alert('保存用户失败，请重试');
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style scoped>
.user-form {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border: none;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45a049;
}

.btn-primary:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

@media (max-width: 768px) {
  .user-form {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>