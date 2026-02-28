<template>
  <header class="header" :class="{ 'full-width': isFullWidthHeader }">
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
          <li v-if="user?.role === 'admin'">
            <router-link to="/manager">管理</router-link>
          </li>
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
  <el-dialog v-model="showProfileModal" title="个人资料" width="400px">
    <div class="profile-info">
      <div class="profile-avatar">
        <img
          :src="getAvatarUrl(userInfo?.avatar) || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cat%20avatar&image_size=square'"
          alt="用户头像" class="avatar-img">
      </div>
      <div class="profile-details">
        <div class="detail-item">
          <span class="detail-label">姓名：</span>
          <span class="detail-value">{{ userInfo?.name || '未知' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">账号：</span>
          <span class="detail-value">{{ userInfo?.account || '未知' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">角色：</span>
          <span class="detail-value">{{ userInfo?.role === 'admin' ? '管理员' : '普通用户' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">注册时间：</span>
          <span class="detail-value">{{ formatDate(userInfo?.created_at) }}</span>
        </div>
      </div>
    </div>
  </el-dialog>

  <!-- 更改信息弹窗 -->
  <el-dialog v-model="showChangeInfoModal" title="更改信息" width="500px">
    <el-form ref="userFormRef" :model="userForm" :rules="userFormRules" label-width="80px">
      <div class="avatar-uploader">
        <el-upload class="avatar-uploader" action="#" :show-file-list="false" :on-change="handleAvatarUpload"
          :before-upload="beforeAvatarUpload" :auto-upload="false">
          <img v-if="userForm.avatarPreview || userForm.avatar"
            :src="userForm.avatarPreview || getAvatarUrl(userForm.avatar)" class="avatar">
          <div v-else class="avatar-uploader-icon">
            <el-icon>
              <Plus />
            </el-icon>
          </div>
        </el-upload>
      </div>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="userForm.name"></el-input>
      </el-form-item>
      <el-form-item label="账号" prop="account">
        <el-input v-model="userForm.account"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="userForm.password" placeholder="不修改请留空"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input type="password" v-model="userForm.confirmPassword" placeholder="不修改请留空"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showChangeInfoModal = false">取消</el-button>
        <el-button type="primary" @click="submitUserForm" :loading="submitting">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import catApi from '../api/catApi'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

export default {
  name: 'Header',
  components: {
    Plus
  },
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
    isFullWidthHeader() {
      const currentPath = this.$route.path;
      return currentPath === '/';
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

        // 更新本地存储的用户信息
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // 更新用户信息
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

<style scoped>
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

.nav ul {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav a:hover {
  color: #e63946;
}

.user-area {
  display: flex;
  align-items: center;
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
  background-color: rgba(255, 255, 255, 0.2);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  margin-top: 0.5rem;
  z-index: 1000;
}

.dropdown-item {
  padding: 0.75rem 1rem;
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
  gap: 1.5rem;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #ffd6e0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-details {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-label {
  font-weight: 500;
  color: #666;
}

.detail-value {
  color: #333;
}

/* 更改信息弹窗样式 */
.avatar-uploader {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ffd6e0;
}

.avatar-uploader-icon {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px dashed #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #999;
}
</style>