import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/Login.vue'),
      meta: { isAuthPage: true }

    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/Register.vue'),
      meta: { isAuthPage: true }
    },
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/users/UserList.vue')
    },
    {
      path: '/users/add',
      name: 'addUser',
      component: () => import('../views/users/UserForm.vue')
    },
    {
      path: '/users/edit/:id',
      name: 'editUser',
      component: () => import('../views/users/UserForm.vue')
    },
    {
      path: '/cats',
      name: 'cats',
      component: () => import('../views/cats/CatList.vue')
    },
    {
      path: '/cats/add',
      name: 'addCat',
      component: () => import('../views/cats/CatForm.vue')
    },
    {
      path: '/cats/edit/:id',
      name: 'editCat',
      component: () => import('../views/cats/CatForm.vue')
    },
    {
      path: '/cats/:id',
      name: 'catDetail',
      component: () => import('../views/cats/CatDetail.vue')
    },
    {
      path: '/adopt',
      name: 'adopt',
      component: () => import('../views/cats/AdoptView.vue')
    },
    {
      path: '/interact',
      name: 'interact',
      component: () => import('../views/cats/interactView.vue')
    },
    {
      path: '/posts/:id',
      name: 'postDetail',
      component: () => import('../views/posts/PostDetail.vue')
    },
    {
      path: '/encyclopedia',
      name: 'encyclopedia',
      component: () => import('../views/cats/EncyclopediaView.vue')
    },
    {
      path: '/manager',
      name: 'manager',
      component: () => import('../views/manager/ManagerView.vue')
    }
  ]
})

// 导航守卫，确保用户未登录时无法访问需要权限的页面
router.beforeEach((to, from, next) => {
  // 检查用户是否已登录
  const isLoggedIn = localStorage.getItem('user') !== null;
  
  // 检查当前路由是否需要认证
  const isAuthPage = to.meta.isAuthPage || to.path === '/login' || to.path === '/register';
  
  // 如果用户未登录且访问的不是认证页面，则重定向到登录页面
  if (!isLoggedIn && !isAuthPage) {
    next('/login');
  } else {
    next();
  }
});

export default router