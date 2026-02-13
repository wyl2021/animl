<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-box">
        <div class="register-header">
          <div class="logo-icon">🐱</div>
          <h2>创建账户</h2>
          <p>加入我们的猫咪乐园</p>
        </div>
        <el-form @submit.prevent="handleRegister" class="register-form" :model="form">
          <el-form-item label="姓名">
            <el-input v-model="form.name" placeholder="请输入姓名" clearable />
          </el-form-item>
          <el-form-item label="账号">
            <el-input v-model="form.account" type="account" placeholder="请输入邮箱" clearable />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
          </el-form-item>
          <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon style="margin-bottom: 15px;" />
          <el-form-item>
            <el-button type="primary" @click="handleRegister" :loading="loading" style="width: 100%;">注册</el-button>
          </el-form-item>
        </el-form>
        <div class="register-footer">
          <p>已有账户？ <router-link to="/login">立即登录</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import authApi from '../../api/authApi'

export default {
  name: 'Register',
  data() {
    return {
      form: {
        name: '',
        account: '',
        password: '',
        confirmPassword: ''
      },
      loading: false,
      error: ''
    }
  },
  methods: {
    async handleRegister() {
      if (this.loading) return

      if (!this.form.name || !this.form.account || !this.form.password) {
        ElMessage.warning('请填写完整信息')
        return
      }

      if (this.form.password !== this.form.confirmPassword) {
        this.error = '两次输入的密码不一致'
        ElMessage.warning(this.error)
        return
      }

      this.error = ''
      this.loading = true

      try {
        const data = await authApi.register(this.form.name, this.form.account, this.form.password)

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify({
          id: data.id,
          name: data.name,
          account: data.account
        }))

        ElMessage.success('注册成功！')
        this.$router.push('/')
      } catch (error) {
        console.error('注册失败:', error)
        this.error = error.message || '注册失败，请重试'
        ElMessage.error(this.error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  width: 100%;
}

.register-container {
  width: 100%;
  max-width: 420px;
}

.register-box {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.6s ease-out;
  width: 100%;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
  animation: fadeIn 0.8s ease-out 0.2s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.logo-icon {
  font-size: 60px;
  margin-bottom: 15px;
  animation: bounce 1s ease-out 0.4s both;
}

@keyframes bounce {
  0% {
    opacity: 0;
    transform: scale(0);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.register-header h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 8px;
}

.register-header p {
  color: #666;
  font-size: 14px;
}

.register-form {
  animation: fadeInUp 0.6s ease-out 0.3s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  outline: none;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
}

.form-group input::placeholder {
  color: #aaa;
}

.btn-register {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-top: 10px;
  animation: fadeInUp 0.6s ease-out 0.5s both;
}

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-register:active:not(:disabled) {
  transform: translateY(0);
}

.btn-register:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.register-footer {
  text-align: center;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  animation: fadeInUp 0.6s ease-out 0.6s both;
}

.register-footer p {
  color: #666;
  font-size: 14px;
}

.register-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.register-footer a:hover {
  color: #764ba2;
}

@media (max-width: 480px) {
  .register-box {
    padding: 30px 20px;
  }

  .register-header h2 {
    font-size: 24px;
  }

  .logo-icon {
    font-size: 50px;
  }
}
</style>
