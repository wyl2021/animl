<template>
  <div class="app">
    <header v-if="!isAuthPage" class="header" :class="{ 'full-width': isFullWidthHeader }">
      <div class="container">
        <h1 class="logo">
          <router-link to="/">🐱 猫咪乐园</router-link>
        </h1>
        <nav class="nav">
          <ul>
            <li><router-link to="/">首页</router-link></li>
            <li><router-link to="/cats">猫咪管理</router-link></li>
            <li class="dropdown">
              <button class="dropdown-toggle" @click="toggleDropdown('userDropdown')">
                用户管理
                <span class="dropdown-icon">▼</span>
              </button>
              <div class="dropdown-menu" v-if="dropdowns.userDropdown">
                <!-- <router-link to="/users">用户列表</router-link> -->
                <!-- <router-link to="/users/add">添加用户</router-link> -->
                <router-link to="/login" class="nav-btn">退出</router-link>
                <!-- <router-link to="/register" class="nav-btn">注册</router-link> -->
              </div>
            </li>

          </ul>
        </nav>
      </div>
    </header>
    <main class="main">
      <div class="container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
    <footer v-if="!isAuthPage" class="footer">
      <div class="container">
        <p>&copy; 2026 猫咪乐园 - 所有权利保留</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      dropdowns: {
        userDropdown: false
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
  methods: {
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
  background-color: #f5f5f5;
}

.container {
  /* max-width: 1200px; */
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}

.header.full-width {
  width: 95vw;
  /* max-width: 100vw; */
  margin: 0;
  left: 0;
  right: 0;
}

.header.full-width .container {
  max-width: 100%;
  padding: 0 20px;
}

.logo {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0;
}

.logo a {
  color: #333;
  text-decoration: none;
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
  color: #4CAF50;
}

/* 下拉菜单样式 */
.dropdown {
  position: relative;
}

.dropdown-toggle {
  background: none;
  border: none;
  color: #333;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 0;
  transition: color 0.3s ease;
  outline: none;
}

.dropdown-toggle:focus {
  outline: none;
}

.dropdown-toggle:hover {
  color: #4CAF50;
}

.dropdown-icon {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.dropdown:hover .dropdown-icon {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 0.5rem 0;
  min-width: 150px;
  margin-top: 0.5rem;
  z-index: 1000;
  animation: dropdownFade 0.3s ease;
}

.dropdown-menu a {
  padding: 0.8rem 1.2rem;
  color: #333;
  text-decoration: none;
  display: block;
  transition: all 0.3s ease;
}

.dropdown-menu a:hover {
  background-color: #f5f5f5;
  color: #4CAF50;
  padding-left: 1.5rem;
}

@keyframes dropdownFade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-btn {
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.nav-btn:hover {
  transform: translateY(-2px);
}

.register-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
}

.register-btn:hover {
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.main {
  padding: 2rem 0;
  min-height: 80vh;
}

.footer {
  background-color: #333;
  color: #fff;
  text-align: center;
  padding: 1.5rem 0;
  margin-top: 2rem;
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
  border-top: 2px solid #4CAF50;
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

  .dropdown-menu {
    right: 50%;
    transform: translateX(50%);
  }

  .logo {
    font-size: 1.5rem;
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

  .dropdown-toggle {
    padding: 0.3rem 0;
  }
}
</style>