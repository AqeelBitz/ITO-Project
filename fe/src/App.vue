<script setup>
import { useRouter } from 'vue-router';
import { onMounted, computed } from 'vue';

import IdleLogoutWrapper from './views/IdleLogoutWrapper.vue'; 

const router = useRouter();

const isLoginPage = computed(() => {
  return router.currentRoute.value.name === 'Login';
});

onMounted(() => {
  const isLoggedIn = localStorage.getItem("authResponse");
  if (!isLoggedIn && !isLoginPage.value) {
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