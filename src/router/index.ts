// @ts-ignore
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import AdminAuth from '../components/AdminAuth.vue'
import AdminDashboard from '../components/AdminDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/admin',
    name: 'AdminAuth',
    component: AdminAuth
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    beforeEnter: (_to: any, _from: any, next: any) => {
      const isAdmin = localStorage.getItem('isAdmin')
      if (isAdmin) {
        next()
      } else {
        next('/admin')
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
