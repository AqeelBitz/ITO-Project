import { createRouter, createWebHistory } from 'vue-router'
import Upload from '../views/Upload.vue';
import Viewer from '../views/Viewer.vue';
import Login from '../views/Login.vue';
import Main from '../views/Main.vue';
import { ElMessageBox } from 'element-plus';

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
  },
  {
    path: "/main",
    name: "Main",
    component: Main,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/upload",
    name: "Upload",
    component: Upload,
    meta: {
      requiresAuth: true,
      allowedRoles: ['Updater'],
    },
  },
  {
    path: "/viewer",
    name: "Viewer",
    component: Viewer,
    meta: {
      requiresAuth: true,

      allowedRoles: ['Updater','Viewer'],
    },
  },
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
let isMessageBoxOpen = false;
router.beforeEach((to, from, next) => {


  const authToken = localStorage.getItem('authToken');
  const tokenExpiration = localStorage.getItem('tokenExpiration');
  const authResponseString = localStorage.getItem('authResponse');
  let isLoggedIn = false;

  if (authToken && tokenExpiration && authResponseString) {
    try {
      const now = Date.now();
      const expirationTimestampMs = parseInt(tokenExpiration);
      const authResponse = JSON.parse(authResponseString);

      if (expirationTimestampMs > now && authResponse) {
        isLoggedIn = true;
      }
    } catch (error) {
      console.error('Error parsing authResponse or tokenExpiration:', error);
      isLoggedIn = false;
    }
  }

  if (to.name === 'Login') {
    if (isLoggedIn) { 
      next({ name: 'Main' }); 
      return;
    } else { 
      next();
      return;
    }
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  console.log("tokenExpiration: ", tokenExpiration); 


  if (requiresAuth) {
    let needsRedirectToLogin = false;
    let redirectReason = '';

    if (!authToken || !tokenExpiration) {
      console.log('Auth token or expiration missing from storage.');
      needsRedirectToLogin = true;
      redirectReason = 'Authentication data is missing.';
    } else {
        const now = Date.now();
        const expirationTimestampMs = parseInt(tokenExpiration);
        console.log('Current time (ms):', now);
        console.log('Token expiration timestamp (ms):', expirationTimestampMs);
        console.log('Is token expired (expiration < now):', expirationTimestampMs < now);

        if (expirationTimestampMs < now) {
          console.log('Auth token expired client-side.');
          needsRedirectToLogin = true;
          redirectReason = 'Your session has expired.';
        }
    }

    let userRole = null;

    if (!needsRedirectToLogin) {
        if (authResponseString) {
          try {
            const authResponse = JSON.parse(authResponseString);
            console.log('Parsed authResponse:', authResponse);
            userRole = authResponse ? authResponse.roleName : null;
            isLoggedIn = !!authResponse;
            console.log('Extracted userRole:', userRole);

            if (isLoggedIn && to.meta.allowedRoles && !to.meta.allowedRoles.includes(userRole)) {
                console.log(`User role "${userRole}" not allowed for this route. Redirecting to Main.`);
                next({ name: 'Main' });
                console.log('--- Navigation End (Redirected due to role) ---');
                return;
            } else if (!isLoggedIn) {
                 console.log('Auth token exists and is not expired, but authResponse is invalid (parsed to falsy value).');
                 needsRedirectToLogin = true;
                 redirectReason = 'Authentication data is invalid.';
            }
          } catch (error) {
            console.error('Error parsing authResponse:', error);
            needsRedirectToLogin = true;
            redirectReason = 'Authentication data is corrupt.';
          }
        } else {
           console.log('Auth token and expiration exist, but authResponse string is missing.');
           needsRedirectToLogin = true;
           redirectReason = 'Authentication data is missing.';
        }
    }

    if (needsRedirectToLogin || !isLoggedIn) {
        console.log(`Authentication check failed. Reason: ${redirectReason || 'Unknown authentication issue'}`);

        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiration');
        localStorage.removeItem('authResponse');

        if (!isMessageBoxOpen) {
            isMessageBoxOpen = true;
            ElMessageBox.alert(`${redirectReason || 'Your session is invalid.'} Please log in again.`, 'Session Invalid', {
              confirmButtonText: 'OK',
              type: 'warning',
              showClose: false,
              callback: (action) => {
                isMessageBoxOpen = false;
                next({ name: 'Login' });
              }
            })
            .catch(() => {
               isMessageBoxOpen = false;
               next({ name: 'Login' });
            });
        } else {
             console.log('Message box already open from a previous auth failure. Ensuring redirection to Login.');
             next({ name: 'Login' });
        }

        console.log('--- Navigation End (Redirected to Login after auth failure) ---');
        return;
    }

    console.log('Authentication and Authorization checks passed. Navigation allowed.');
    next();
    console.log('--- Navigation End ---');

  } else {
    console.log('Public route, no authentication required. Navigation allowed.');
    next();
    console.log('--- Navigation End ---');
  }
});




export default router;