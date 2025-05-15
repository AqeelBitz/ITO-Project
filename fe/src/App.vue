<script setup>
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const router = useRouter();

onMounted(() => {
 const isLoggedIn = localStorage.getItem("authResponse");
 if (!isLoggedIn && router.currentRoute.value.name !== 'Login') {
   router.push('/');
 }
 
});
</script>

<template>
  <header>
    <div class="wrapper">
    </div>
  </header>

  <el-main >
    <router-view />
  </el-main>
</template>

<style scoped>
.el-main{
  height: 100vh;
}
</style>
