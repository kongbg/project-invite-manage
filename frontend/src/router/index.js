import { createRouter, createWebHistory } from 'vue-router';
import Layout from '../components/Layout.vue';
import ProjectList from '../views/ProjectList.vue';
import ProjectDetail from '../views/ProjectDetail.vue';

const routes = [
  {
    path: '/timor',
    component: Layout,
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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
