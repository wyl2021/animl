<template>
  <div class="app">
    <header v-if="!isAuthPage" class="header" :class="{ 'full-width': isFullWidthHeader }">
      <div class="container">
        <h1 class="logo">
          <router-link to="/">猫咪社区</router-link>
        </h1>
        <div class="search-box">
          <input type="text" placeholder="搜索猫咪...">
          <span class="search-icon">🔍</span>
        </div>
        <nav class="nav">
          <ul>
            <li><router-link to="/">首页</router-link></li>
            <li><router-link to="/adopt">领养</router-link></li>
            <li><router-link to="/interact">互动</router-link></li>
            <li><router-link to="/encyclopedia">百科</router-link></li>
          </ul>
        </nav>
        <div class="user-area">
          <span class="notification">🔔</span>
          <span class="user-avatar">👩</span>
        </div>
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

.user-avatar {
  font-size: 1.5rem;
  cursor: pointer;
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