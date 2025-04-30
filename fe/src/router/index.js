import { createRouter, createWebHistory } from 'vue-router'
import Upload from '../views/Upload.vue';
import Viewer from '../views/Viewer.vue';
import Login from '../views/Login.vue';
import Main from '../views/Main.vue';

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
    // meta: {
    //   hideNavbar: true,
    // },
  },
  {
    path: "/main",
    name: "Main",
    component: Main,
    // meta: {
    //   hide: "true",
    //   hideBaseBtn: true,
    //   title: "Main Menu",
    //   activeNav: "1",
    //   hideSideNavMenu: false,
    // },
  },
  {
    path: "/upload",
    name: "Upload",
    component: Upload,
    // meta: {
    //   hide: "true",
    //   hideBaseBtn: true,
    //   title: "Main Menu",
    //   activeNav: "1",
    //   hideSideNavMenu: false,
    // },
  },
  {
    path: "/viewer",
    name: "Viewer",
    component: Viewer,
    // meta: {
    //   hideNavbar: true,
    // },
  },
  ///EndRoutes///
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    let main = document.querySelector('.el-main')
    if (main) {
      main.scrollTop = 0
    }
    return {
      top: 0
    }
  }
});

export default router;
