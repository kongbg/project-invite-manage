import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
// import Register from '../views/Register.vue';
import Layout from '../components/Layout.vue';
import ProjectList from '../views/ProjectList.vue';
import ProjectDetail from '../views/ProjectDetail.vue';
import Page404 from '../views/404.vue'

const routes = [
  {
    path: '/timor/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  // {
  //   path: '/register',
  //   name: 'Register',
  //   component: Register,
  //   meta: { requiresAuth: false }
  // },
  {
    path: '/timor',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'ProjectList',
        component: ProjectList,
      },
      {
        path: 'project/:id',
        name: 'ProjectDetail',
        component: ProjectDetail,
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'Page404',
    component: Page404
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth !== false;
  const token = localStorage.getItem('token');
  
  if (requiresAuth && !token) {
    next('/timor/login');
  } else if ((to.path === '/timor/login' || to.path === '/timor/register') && token) {
    next('/timor');
  } else {
    next();
  }
});

export default router;
