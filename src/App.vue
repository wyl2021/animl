<template>
  <div class="app">
    <Header v-if="!isAuthPage" />

    <main class="main">
      <div class="container">
        <router-view v-slot="{ Component }" :key="$route.fullPath">
          <transition name="fade" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
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
import Header from './components/Header.vue'

export default {
  name: 'App',
  components: {
    Header
  },
  computed: {
    isAuthPage() {
      return this.$route.meta.isAuthPage;
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