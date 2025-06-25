import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/LoginView.vue"),
  },
  {
    path: '/case-query',
    name: 'case-query',
    component: () => import('../views/CaseQueryLayout.vue'),
    redirect: '/case-query/search',
    children: [
      {
        path: '/case-query/search',
        name: 'case-list',
        component: () => import('../views/SearchCases.vue'),
      },
      {
        path:'/case-query/favorite',
        name: 'favorite-case',
        component: () => import('../views/FavoriteCases.vue'),
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuth = sessionStorage.getItem('token') === 'true';
  if (!isAuth && to.path !== '/login') {
    next('/login');
  } else if (isAuth && to.path === '/login') {
    next();
  } else {
    next();
  }
});

export default router;
