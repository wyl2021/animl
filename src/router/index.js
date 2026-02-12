import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/Register.vue')
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
    }
  ]
})

export default router