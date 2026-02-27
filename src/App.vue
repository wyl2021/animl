<template>
  <div class="app">
    <header v-if="!isAuthPage" class="header" :class="{ 'full-width': isFullWidthHeader }">
      <div class="container">
        <h1 class="logo">
          <router-link to="/">猫咪社区</router-link>
        </h1>
        <!-- <div class="search-box">
          <input type="text" placeholder="搜索猫咪...">
          <span class="search-icon">🔍</span>
        </div> -->
        <nav class="nav">
          <ul>
            <li><router-link to="/">首页</router-link></li>
            <li><router-link to="/adopt">领养</router-link></li>
            <li><router-link to="/interact">互动</router-link></li>
            <li><router-link to="/encyclopedia">百科</router-link></li>
          </ul>
        </nav>
        <div class="user-area">
          <div class="user-dropdown dropdown">
            <div class="user-info" @click="toggleDropdown('userDropdown')">
              <img
                :src="getAvatarUrl(user?.avatar) || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cat%20avatar&image_size=square'"
                alt="用户头像" class="user-avatar">
              <span class="user-name">{{ user?.name || '用户' }}</span>
              <span class="dropdown-arrow">▼</span>
            </div>
            <div v-if="dropdowns.userDropdown" class="dropdown-menu">
              <div class="dropdown-item" @click="goToProfile">个人资料</div>
              <div class="dropdown-item" @click="changeInfo">更改信息</div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item" @click="logout">退出登录</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 个人资料弹窗 -->
    <el-dialog v-model="showProfileModal" title="个人资料" width="500px">
      <div v-if="userInfo" class="profile-info">
        <div class="profile-avatar">
          <img
            :src="getAvatarUrl(userInfo.avatar) || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cat%20avatar&image_size=square'"
            alt="用户头像" class="avatar-img">
        </div>
        <div class="profile-details">
          <div class="detail-item">
            <span class="detail-label">姓名：</span>
            <span class="detail-value">{{ userInfo.name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">账号：</span>
            <span class="detail-value">{{ userInfo.account }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">角色：</span>
            <span class="detail-value">{{ userInfo.role }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">创建时间：</span>
            <span class="detail-value">{{ formatDate(userInfo.created_at) }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showProfileModal = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 更改信息弹窗 -->
    <el-dialog v-model="showChangeInfoModal" title="更改信息" width="500px">
      <el-form :model="userForm" label-width="80px" :rules="userFormRules" ref="userFormRef">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="账号" prop="account">
          <el-input v-model="userForm.account" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码（留空表示不修改）"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="userForm.confirmPassword" type="password" placeholder="请确认密码"></el-input>
        </el-form-item>
        <el-form-item label="头像">
          <el-upload class="avatar-uploader" :show-file-list="false" :on-change="handleAvatarUpload"
            :before-upload="beforeAvatarUpload" :auto-upload="false" accept="image/*">
            <img v-if="userForm.avatarPreview" :src="userForm.avatarPreview" class="avatar">
            <img v-else-if="getAvatarUrl(userInfo?.avatar)" :src="getAvatarUrl(userInfo.avatar)" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showChangeInfoModal = false">取消</el-button>
          <el-button type="primary" @click="submitUserForm" :loading="submitting">保存</el-button>
        </span>
      </template>
    </el-dialog>
    <main class="main">
      <div class="container">
        <router-view v-slot="{ Component }" :key="$route.fullPath">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
    <footer v-if="!isAuthPage" class="footer">
      <div class="container">
        <div class="footer-links">
          <a href="#">关于我们</a>
          <a href="#">联系客服</a>
          <a href="#">隐私政策</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import catApi from './api/catApi'
import { ElMessage } from 'element-plus'

export default {
  name: 'App',
  data() {
    return {
      dropdowns: {
        userDropdown: false
      },
      user: null,
      userInfo: null,
      showProfileModal: false,
      showChangeInfoModal: false,
      submitting: false,
      userForm: {
        name: '',
        account: '',
        password: '',
        confirmPassword: '',
        avatar: '',
        avatarFile: null,
        avatarPreview: ''
      },
      userFormRules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ min: 6, message: '密码长度至少为6位', trigger: 'blur' }],
        confirmPassword: [
          {
            validator: (rule, value, callback) => {
              if (this.userForm.password && value !== this.userForm.password) {
                callback(new Error('两次输入的密码不一致'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ]
      }
    };
  },
  computed: {
    isAuthPage() {
      return this.$route.meta.isAuthPage;
    },
    isFullWidthHeader() {
      const currentPath = this.$route.path;
      return currentPath === '/' || currentPath.startsWith('/cats');
    }
  },
  mounted() {
    // 从本地存储中获取用户信息
    this.loadUserInfo();
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      const userInfo = localStorage.getItem('user');
      console.log('从本地存储获取的用户信息:', userInfo);
      if (userInfo) {
        try {
          this.user = JSON.parse(userInfo);
          console.log('解析后的用户信息:', this.user);
        } catch (error) {
          console.error('解析用户信息失败:', error);
        }
      }
    },
    toggleDropdown(dropdownName) {
      this.dropdowns[dropdownName] = !this.dropdowns[dropdownName];
      // 点击其他地方关闭下拉菜单
      setTimeout(() => {
        document.addEventListener('click', (e) => {
          if (!e.target.closest('.dropdown')) {
            this.dropdowns[dropdownName] = false;
          }
        }, { once: true });
      }, 0);
    },
    // 跳转到个人资料页面
    async goToProfile() {
      this.dropdowns.userDropdown = false;
      // 显示个人资料弹窗
      try {
        this.userInfo = await catApi.getUserInfo();
        this.showProfileModal = true;
      } catch (error) {
        ElMessage.error('获取个人资料失败: ' + error.message);
        console.error('获取个人资料错误:', error);
      }
    },
    // 更改信息
    async changeInfo() {
      this.dropdowns.userDropdown = false;
      // 显示更改信息弹窗
      try {
        this.userInfo = await catApi.getUserInfo();
        this.userForm = {
          name: this.userInfo.name,
          account: this.userInfo.account,
          password: '',
          confirmPassword: '',
          avatar: this.userInfo.avatar
        };
        this.showChangeInfoModal = true;
      } catch (error) {
        ElMessage.error('获取个人资料失败: ' + error.message);
        console.error('获取个人资料错误:', error);
      }
    },
    // 处理头像上传
    handleAvatarUpload(file) {
      if (file.raw) {
        // 保存文件对象
        this.userForm.avatarFile = file.raw;

        // 创建FileReader对象来读取文件，用于预览
        const reader = new FileReader();
        reader.onload = (e) => {
          // 将图片转换为base64格式存储，仅用于预览
          this.userForm.avatarPreview = e.target.result;
        };
        reader.readAsDataURL(file.raw);
      }
    },
    // 上传前校验
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        ElMessage.error('只能上传 JPG、PNG 或 GIF 格式的图片!');
      }
      if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB!');
      }

      return isJPG && isLt2M;
    },
    // 提交用户表单
    async submitUserForm() {
      try {
        await this.$refs.userFormRef.validate();

        this.submitting = true;

        // 准备更新数据
        const updateData = {
          name: this.userForm.name,
          account: this.userForm.account
        };

        // 只有当密码不为空时才更新密码
        if (this.userForm.password) {
          updateData.password = this.userForm.password;
        }

        // 调用API更新用户信息
        let updatedUser;
        if (this.userForm.avatarFile) {
          // 如果有头像文件，使用updateUserWithImage方法
          updatedUser = await catApi.updateUserWithImage(this.userInfo.id, this.userForm);
        } else {
          // 否则使用updateUser方法
          updatedUser = await catApi.updateUser(this.userInfo.id, updateData);
        }

        // 更新本地存储的用户信息（不存储头像数据）
        const userToStore = {
          ...updatedUser,
          avatar: null // 不存储头像数据，避免本地存储容量限制
        };
        localStorage.setItem('user', JSON.stringify(userToStore));

        // 更新用户信息（使用API返回的头像）
        this.user = updatedUser;

        ElMessage.success('更新成功！');
        this.showChangeInfoModal = false;
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('更新失败: ' + error.message);
          console.error('更新用户信息错误:', error);
        }
      } finally {
        this.submitting = false;
      }
    },
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString();
    },
    // 获取头像URL
    getAvatarUrl(avatar) {
      if (!avatar) return ''
      // 如果是完整URL或base64，直接返回
      if (avatar.startsWith('http') || avatar.startsWith('data:image')) {
        return avatar
      }
      // 否则拼接完整的上传路径
      return `http://localhost:3000/uploads/${avatar}`
    },
    // 退出登录
    logout() {
      this.dropdowns.userDropdown = false;
      // 清除本地存储的token和用户信息
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 跳转到登录页面
      this.$router.push('/login');
    }
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #fff5f7;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header {
  background-color: #ffd6e0;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}

.header.full-width {
  width: 100%;
  margin: 0;
  left: 0;
  right: 0;
}

.header.full-width .container {
  max-width: 1200px;
  padding: 0 20px;
}

.logo {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0;
  color: #e63946;
}

.logo a {
  color: #e63946;
  text-decoration: none;
}

.search-box {
  position: relative;
  width: 300px;
}

.search-box input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 20px;
  font-size: 1rem;
  outline: none;
}

.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.nav ul {
  list-style: none;
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav a {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  padding: 0.5rem 0;
  display: block;
}

.nav a:hover {
  color: #e63946;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification {
  font-size: 1.2rem;
  cursor: pointer;
}

.user-dropdown {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.dropdown-arrow {
  font-size: 0.8rem;
  color: #666;
  transition: transform 0.3s ease;
}

.user-info:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  padding: 0.8rem 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 0.5rem 0;
}

/* 个人资料弹窗样式 */
.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.profile-avatar {
  margin-bottom: 1.5rem;
}

.avatar-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-details {
  width: 100%;
}

.detail-item {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.detail-label {
  width: 80px;
  font-weight: 500;
  color: #666;
}

.detail-value {
  flex: 1;
  color: #333;
}

/* 头像上传样式 */
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.main {
  padding: 2rem 0;
  min-height: 80vh;
}

.footer {
  background-color: #ffd6e0;
  color: #333;
  padding: 1.5rem 0;
  margin-top: 2rem;
}

.footer-links {
  display: flex;
  justify-content: space-around;
  width: 100%;
}

.footer-links a {
  color: #333;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #e63946;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 全局加载状态 */
.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading::after {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #e63946;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 全局错误状态 */
.error {
  text-align: center;
  padding: 3rem;
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 全局成功状态 */
.success {
  text-align: center;
  padding: 3rem;
  color: #155724;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 按钮悬停动画 */
.btn {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.1s ease;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .container {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .search-box {
    order: -1;
    width: 100%;
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .nav ul {
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .logo {
    font-size: 1.5rem;
  }

  .search-box {
    width: 100%;
    max-width: 300px;
  }

  .footer-links {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .nav ul {
    flex-direction: column;
    align-items: center;
  }

  .nav a {
    padding: 0.3rem 0;
  }
}
</style>