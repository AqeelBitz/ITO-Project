<template>
    <div id="app-wrapper" @mousemove="resetIdleTimer" @keypress="resetIdleTimer" @click="resetIdleTimer" @scroll="resetIdleTimer">
      <slot></slot>
  
      <div v-if="showStatus" class="idle-status">
        <p v-if="!isLoggedOut">
          You will be logged out in {{ idleTimeLeft }} seconds due to inactivity.
        </p>
        <p v-else class="logged-out-message">
          You have been logged out. Redirecting...
        </p>
      </div>
    </div>
    <MessageBox :visible="showMessageBox" :title="messageBoxTitle" :content="messageBoxContent" :type="messageBoxType"
    @close="handleMessageBoxClose" />
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount, defineProps } from 'vue';
  import MessageBox from './MessageBox.vue'; 
import router from '@/router';
  
    const showMessageBox = ref(false);
    const messageBoxContent = ref('');
    const messageBoxTitle = ref('');
    const messageBoxType = ref('info');
    const showStatus = ref(false);
  const props = defineProps({
    timeoutMinutes: {
      type: Number,
      default: 1, 
    },
    logoutRedirectPath: {
      type: String,
      default: '/', 
    },
  });
  
  const IDLE_TIMEOUT_MS = props.timeoutMinutes * 6000 * 1000; 

  let idleTimer = null; 
  let countdownInterval = null; 
  const idleTimeLeft = ref(props.timeoutMinutes * 6000); 
  const isLoggedOut = ref(false);
  
  const resetIdleTimer = () => {
    clearTimeout(idleTimer); 
    clearInterval(countdownInterval); 
  
    if (!isLoggedOut.value) { 
      idleTimer = setTimeout(logoutUser, IDLE_TIMEOUT_MS);
      idleTimeLeft.value = props.timeoutMinutes * 6000; 
      startCountdown(); 
      console.log('Idle timer reset. Next logout in', props.timeoutMinutes, 'minutes.');
    }
  };
  
  const handleMessageBoxClose = () => {
  showMessageBox.value = false;
  messageBoxContent.value = '';
  messageBoxTitle.value = '';
  messageBoxType.value = 'info';
  router.push('/')
};
  const startCountdown = () => {
    countdownInterval = setInterval(() => {
      if (idleTimeLeft.value > 0) {
        console.log("time left: ", idleTimeLeft.value)
        idleTimeLeft.value--;
        if(idleTimeLeft.value <=10){
            showStatus.value=true;
        }
      } else {
        clearInterval(countdownInterval); 
      }
    }, 1000);
  };
  
  const logoutUser = () => {
    if (isLoggedOut.value) return;
  
    isLoggedOut.value = true;
    console.log('User logged out due to inactivity.');
    
    messageBoxContent.value = 'You have been logged out due to inactivity.';
    messageBoxTitle.value = 'Logged Out';
    messageBoxType.value = 'info';
    showMessageBox.value = true; 

    localStorage.removeItem('authResponse');
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiration');
  
    setTimeout(() => {
      window.location.href = props.logoutRedirectPath;
    }, 3000);
  };
  
  
  onMounted(() => {
    console.log('IdleLogoutWrapper mounted. Starting idle timer.');
    resetIdleTimer();
  
  });
  
  onBeforeUnmount(() => {
    console.log('IdleLogoutWrapper unmounting. Clearing timers.');
    clearTimeout(idleTimer);
    clearInterval(countdownInterval);
  });
  </script>
  
  <style scoped>
  .idle-status {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    font-size: 0.9em;
    z-index: 1000;
  }
  
  .logged-out-message {
      color: #ffdd57;
  }
  </style>