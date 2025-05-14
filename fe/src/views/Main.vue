<template>
  <div class="balh-container">
    <header class="balh-header">
      <div class="header-content">
        <img src="../assets/download.png" alt="Bank Al Habib Logo" class="balh-logo">
        <h1 class="balh-title">CONSIGNMENT TRACKING SYSTEM</h1>
      </div>
    </header>

    <main class="balh-content">
      <section class="balh-card">
        <div class="balh-button-group">
          <button
            @click="goToUpload"
            :disabled="roleId === '1'"
            class="balh-btn primary"
            :class="{ 'disabled': roleId === '1' }"
          >
            <i class="fas fa-upload balh-btn-icon"></i>
            Upload Consignment
          </button>
          <button
            @click="goToView"
            class="balh-btn secondary"
          >
            <i class="fas fa-eye balh-btn-icon"></i>
            View Consignments
          </button>
        </div>
        <div class="back-button-container">
          <button @click="handleLogout" class="back-btn">
            Logout
          </button>
        </div>
      </section>
    </main>

    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogout = () => {
  localStorage.removeItem('authResponse');

  router.push('/'); 
};

const goToUpload = () => {
  router.push('/upload');
};

const goToView = () => {
  router.push('/viewer');
};

const authResponse = JSON.parse(localStorage.getItem("authResponse"));
const roleId = authResponse ? authResponse.roleId : null; 
</script>

<style scoped>
:root {
  --balh-primary-green: #006840; /* A strong, professional green */
  --balh-light-green: #e8f5e9; /* Very light green for backgrounds or accents */
  --balh-white: #ffffff;
  --balh-grey-text: #333333;
  --balh-light-grey-bg: #f4f4f4;
  --balh-border-grey: #cccccc;
  --balh-disabled-grey: #e0e0e0;
  --balh-disabled-text: #999999;
  --balh-hover-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); /* Enhanced shadow for lift effect */
}

.balh-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  font-family: 'Arial', sans-serif; /* Using a common, clean font */
  background-color: var(--balh-light-grey-bg);
  color: var(--balh-grey-text);
}

.balh-header {
  margin-bottom: 3rem;
  width: 100%;
  display: flex;
  justify-content: center; /* Center the header content */
}

.header-content {
    display: flex;
    align-items: center; /* Vertically align logo and title */
}

.balh-logo {
    height: 200px;
    margin-right: 15px; /* Space between logo and title */
    
}

.balh-title {
  font-size: 2.2rem;
  color: var(--balh-primary-green);
  font-weight: 700;
  margin: 0; /* Remove default margin */
}

.balh-content {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  max-width: 800px;
}

.balh-card {
  background-color: var(--balh-white);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  text-align: center;
  display: flex; /* Use flex to arrange button group and back button */
  flex-direction: column;
  align-items: center;
  gap: 2rem; /* Space between button group and back button container */
}

.balh-button-group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  width: 100%; /* Allow button group to take available width */
}

.balh-btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease; /* Add transform to transition */
  width: 100%;
  max-width: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Initial subtle shadow */
}

.back-btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease; /* Add transform to transition */
  width: 100%;
  max-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Initial subtle shadow */
}

.balh-btn:hover:not(.disabled) {
  transform: translateY(-5px); /* Lift effect */
  box-shadow: var(--balh-hover-shadow); /* Enhanced shadow on hover */
}
.back-btn:hover:not(.disabled) {
  transform: translateY(-5px); /* Lift effect */
  box-shadow: var(--balh-hover-shadow); /* Enhanced shadow on hover */
}


.balh-btn-icon {
    margin-right: 8px;
}
.back-btn-icon {
    margin-right: 8px;
}

.balh-btn.primary {
  background-color: var(--balh-primary-green);
  color: var(--balh-white);
}
.back-btn.primary {
  background-color: var(--balh-primary-green);
  color: var(--balh-white);
}

.balh-btn.primary:hover:not(.disabled) {
  background-color: #199666; /* Slightly darker green */
}
.back-btn.primary:hover:not(.disabled) {
  background-color: #199666; /* Slightly darker green */
}

.balh-btn.secondary {
  background-color: var(--balh-light-grey-bg);
  color: var(--balh-grey-text);
  border: 1px solid var(--balh-border-grey);
}
.back-btn.secondary {
  background-color: var(--balh-light-grey-bg);
  color: var(--balh-grey-text);
  border: 1px solid var(--balh-border-grey);
}

.balh-btn.secondary:hover:not(.disabled) {
  background-color: #e0e0e0;
}
.back-btn.secondary:hover:not(.disabled) {
  background-color: #e0e0e0;
}

.balh-btn.disabled {
  background-color: var(--balh-disabled-grey);
  color: var(--balh-disabled-text);
  cursor: not-allowed;
  box-shadow: none;
  border: 1px solid var(--balh-disabled-grey);
  transform: none; /* No lift effect when disabled */
}

.back-btn.disabled {
  background-color: var(--balh-disabled-grey);
  color: var(--balh-disabled-text);
  cursor: not-allowed;
  box-shadow: none;
  border: 1px solid var(--balh-disabled-grey);
  transform: none; /* No lift effect when disabled */
}
.balh-btn.disabled:hover {
    transform: none; /* Ensure no transform on hover when disabled */
    box-shadow: none; /* Ensure no shadow change on hover when disabled */
}
.back-btn.disabled:hover {
    transform: none; /* Ensure no transform on hover when disabled */
    box-shadow: none; /* Ensure no shadow change on hover when disabled */
}


.back-button-container {
    margin-top: 1rem; /* Space above the back button */
    width: 40%;
    display: flex;
    justify-content: space-around;
}

.back-btn {
  background-color: #d1d6da; 
    color: var(--balh-white);
    max-width: 120px; 
    padding: 0.8rem 1.5rem; 
    font-size: 1rem; 
}

.balh-btn.back-btn:hover:not(.disabled) {
  background-color: #afb9c0; 
  transform: translateY(-3px); 
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}



/* Footer can be removed or kept for other content if needed */
/*
.balh-footer {
  margin-top: 2rem;
  width: 100%;
  text-align: center;
}
*/

/* Optional: Add font awesome for icons if not already included in your project */
/* You would typically include this in your index.html or main app file */
/* <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"> */
</style>