<script setup>
import { useRouter } from 'vue-router';
import { onMounted, computed } from 'vue'; // Import 'computed'

import IdleLogoutWrapper from './views/IdleLogoutWrapper.vue'; // Make sure this path is correct

const router = useRouter();

// Use a computed property to check if the current route is the login page
const isLoginPage = computed(() => {
  return router.currentRoute.value.name === 'Login';
});

onMounted(() => {
  const isLoggedIn = localStorage.getItem("authResponse");
  if (!isLoggedIn && !isLoginPage.value) { // Use isLoginPage computed property here
    router.push('/');
  }
});
</script>

<template>
  <header>
    <div class="wrapper">
      </div>
  </header>

  <el-main>
    <IdleLogoutWrapper
      v-if="!isLoginPage"
      :timeoutMinutes="1"
      :showStatus="true"
      logoutRedirectPath="/"
    >
      <router-view />
    </IdleLogoutWrapper>

    <router-view v-else />
  </el-main>
</template>

<style scoped>
.el-main {
  height: 100vh;
  background-color: rgb(0, 99, 99);
}
</style>