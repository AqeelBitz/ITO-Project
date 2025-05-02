<script setup>
import HelloWorld from './components/HelloWorld.vue'
import Login from './views/Login.vue'
import Upload from './views/Upload.vue'
import { useMachine } from '@xstate/vue';
import { useRouter } from 'vue-router';
// import { appStateMachine } from './././fsm/f';

// const { state, send, context } = useMachine(appStateMachine);
const router = useRouter();

// Provide FSM functions to child components
// provide('send', send);
// provide('context', context);

// Watch for state changes and update the route
// watchEffect(() => {
//   if (state.value === 'login') router.push('/login');
//   else if (state.value === 'upload') router.push('/upload');
//   else if (state.value === 'viewer') router.push('/viewer');
// });
</script>

<template>
  <header>
    <div class="wrapper">
    </div>
  </header>

  <el-main >
    <router-view />
  </el-main>
  <!-- <RouterView/> -->
</template>

<style scoped>
.el-main{
  height: 100vh;
}
</style>
