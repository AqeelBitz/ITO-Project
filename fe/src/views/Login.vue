<template>
  <div class="main-container">
    <el-row>
      <h1><b style="font-weight: bold;font-size: 36px;">CONSIGNMENT TRACKING SYSTEM</b></h1>
    </el-row>
    <el-row class="main-div">
        <el-col :span="10">
            <div class="bahl-logo-container">
                <img class="bahl-logo-img" src="../assets/download.png" alt="">
            </div>
        </el-col>
        <el-col :span="2"></el-col>
        <el-col :span="9" class="login-container">
          <fieldset class="border border-dark border-2 p-2">
            <legend class="legend-text float-none w-auto p-2" style="">Login</legend>
          <div class="login-form-wrapper">
            <form :model="formData" @submit.prevent="handleSubmit" ref="ruleFormRef"
               status-icon :rules="rules" label-width="auto" class="login-form-container">
                <div class="login-form">
                    <div style="display: flex; margin-bottom: 24px; gap: 24px;">
                        <input :error="branchCodeError" v-model="formData.branchCd" @change="validateBranchCode" @keydown="checkDigits" class="form-control" style="width: 21%;" type="text">
                        <input :error="usernameError" v-model="formData.username" @change="validateUsername" class="form-control" maxlength="10" style="width: 75%; margin-right: -62px;" type="password">
                    </div>
                    <div>
                        <input :error="passwordError" v-model="formData.password" type="password" @change="validatePassword" class="form-control" maxlength="10" >
                    </div>
                </div>
            </form>
          </div>
          </fieldset>
            <div class="button-container">
                    <div>
                        <button type="primary" native-type="submit" @click="handleSubmit" :disabled="isInvalid" class="primary-button">Sign In</button>
                    </div>
                    <div>
                        <button @click="resetForm" type="button" style=" width:100%;" class="primary-button reset-button">Reset</button>
                    </div>
                
          </div>
        </el-col>
    </el-row>
  </div>
  <div v-if="showMessageBox" class="el-overlay is-message-box" style="z-index: 2006;">
    <div class="el-overlay-message-box">
      <div role="dialog" aria-label="Message" aria-modal="true" class="el-message-box is-draggable">
        <div class="el-message-box__header">
          <div class="el-message-box__title"><span class="msg-text">Message</span></div>
        </div>
        <div class="el-message-box__content">
          <div class="el-message-box__container">
            <div class="el-message-box__message">
              <p v-html="messageBoxContent" class="p-text"></p>
            </div>
          </div>
          <div class="el-message-box__input" style="display: none;">
            <div class="el-input"><input class="el-input__inner" type="text" autocomplete="off" placeholder=""></div>
            <div class="el-message-box__errormsg" style="visibility: hidden;"></div>
          </div>
        </div>
        <div class="el-message-box__btns"><button @click="closeMessageBox" class="el-button el-button--primary"
            type="button"><span class="">OK</span></button></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'; 
import { useRouter } from 'vue-router';

const checkDigits = (event) => {
    if (
        event.key.length === 1 &&
        (
            isNaN(Number(event.key)) ||
            branchCode.value.length >= maxLength
        )
    )
    {
        event.preventDefault();
    }
}

const router = useRouter();
const formData = reactive({
  username: '',
  password: '',
  branchCd: '',
});

const usernameError = ref('');
const passwordError = ref('');
const branchCodeError = ref('');
const showMessageBox = ref(false);
const messageBoxContent = ref('');
const loading = ref(false);
const result = ref(null);
const error = ref(null);

const validateUsername = () => {
  if (!formData.username) {
    usernameError.value = 'Username is required.';
  } else {
    usernameError.value = '';
  }
};

const validatePassword = () => {
  if (!formData.password) {
    passwordError.value = 'password is required.';
  } else {
    passwordError.value = '';
  }
};

const validateBranchCode = () => {
  if (!formData.branchCd) {
    branchCodeError.value = 'Branch code is required.';
  } else {
    branchCodeError.value = '';
  }
};

const callApi = async () => {
  try {
    const response = await fetch('http://localhost:3001/fsm/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      console.log(`HTTP error! status: ${response.status}`);
      const errorData = await response.json();
      messageBoxContent.value = errorData.error.message;
      // console.log("errorData: ",errorData.error.message)
      const a = errorData;
      showMessageBox.value = true;
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    result.value = data;
    // const { userId, roleId } =data;
    // console.log("userId: ", userId,".. ","roleId: ",roleId)

    console.log('API Response:', data);
    // send({ type: 'LOGIN_SUCCESS', userId, roleId });

    localStorage.setItem('authResponse', JSON.stringify(data));

    messageBoxContent.value = `Sign-on is Successful <br> Last Sign-on date is ${new Date().toLocaleDateString()}`;
    showMessageBox.value = true;
    setTimeout(() => {
      router.push('/main');
    }, 1500);
  } catch (err) {
    // console.error('API Error:', error);
    error.value = err.error || 'Login Failed';
    // send({ type: 'LOGIN_FAILURE' });
    showMessageBox.value = true;
  } finally {
    loading.value = false;
  }
};

const handleSubmit = () => {
  loading.value = true;
  result.value = null;
  error.value = null;

  validateUsername();
  validatePassword();
  validateBranchCode();

  if (!usernameError.value && !passwordError.value && !branchCodeError.value) {
    // send({type: 'SUBMI'}); // move FSM to loggingIn state
    callApi();
  } else {
    console.log("Form has errors. Please correct them.");
    messageBoxContent.value = 'Please fill in all required fields correctly.';
    showMessageBox.value = true;
  }
};

const resetForm = () => {
  formData.username = '';
  formData.password = '';
  formData.branchCd = '';
  usernameError.value = '';
  passwordError.value = '';
  branchCodeError.value = '';
};

const closeMessageBox = () => {
  showMessageBox.value = false;
};
</script>

<style scoped>
.login-container{
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.login-button{
  background-color: #cccccc;
}
.reset-button{
  background-color: rgb(0, 155, 131);
}
.p-text {
  color: #000;
}

.el-overlay.is-message-box {
  display: flex; 
  align-items: center; 
  justify-content: center; 
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2006;
}

.legend-text{
  font-size: 22px;
  font-weight: 700;
}

.border-dark {
  padding: 5px;
    border-width: 3px !important;
    border: 2px solid #212529;
    /* width: 100%; */
    margin-bottom: 20px;
    /* margin-top: 170px; */
    /* margin-left: 100px; */
    box-sizing: border-box;
}

.msg-text {
  font-weight: bold;
  display: flex;
  justify-content: center;
  text-align: center;
}

.el-message-box__header {
  background-color: #009b83;
  padding: 2%;
}

.el-message-box__title {
  color: var(--el-messagebox-title-color);
  --el-messagebox-title-color: #000;
  font-weight: 700;
  padding-left: 0;
  margin-bottom: 0;
  font-size: var(--el-messagebox-font-size);
  line-height: 1;
}

.el-message-box {
  background-color: rgb(160, 200, 168);
  width: 90%;
  max-width: 400px;
  margin: auto;
  margin-top: 250px;
}

.el-message-box__content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 10px var(--el-messagebox-padding-primary);
  color: var(--el-messagebox-content-color);
  font-size: var(--el-messagebox-content-font-size);
  text-align: center;
}

.el-button--primary {
  font-family: Arial, Helvetica, sans-serif;
  background-image: linear-gradient(180deg, #fff 8%, #f0f0f0 48%) !important;
  color: #000 !important;
  border: 0 !important;
  border-radius: 4px !important;
  font-weight: 700;
  font-size: 14px !important;
  width: 70px !important;
}

.el-message-box__btns {
  justify-content: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.form-control {
    display: block;
    width: 100%;
    padding: .375rem .75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #212529;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border-radius: .25rem;
    transition: border-color .15sease-in-out, box-shadow .15sease-in-out;
}

.primary-button {
    padding: 0px 20px;
    height: 40px;
    width: 100%;
    border: black;
    color: black;
    font-size: 16px;
    font-weight: bold;
    border-radius: 0%;

}

.primary-button[disabled] {
    padding: 0px 20px;
    height: 40px;
    width: 100%;
    background-color: #cccccc;
    border: black;
    color: black;
    font-size: 16px;
    font-weight: bold;
    border-radius: 0%;
}

.form-control:focus {
    color: #212529;
    background-color: #fff;
    border-color: #86b7fe;
    outline: 0;
    box-shadow: 0 0 0 .25rem rgba(13, 110, 253, .25);
}

.login-form {
    border: 2px var(--border-primary) solid;
    padding: 8px;
    margin-bottom: 20px;
    margin-top: -25px;
    position: relative;
    padding-top: 40px;
}

.login-form-wrapper{
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: flex-end;
}


.main-container {
  margin: 0% 4% 0% 4%;
}

.main-div {
  padding-top: 5%;
    display: flex;
    justify-content: center;
    align-items: flex-end;
}

.main-header-1 {
    padding-bottom: 4%;
    font-weight: 500;
    font-size: 38px;
}

.bahl-logo-container {
    width: 100%;
}

.button-container {
  display: flex;
  justify-content: space-between;
  gap: 17rem;
  padding-bottom: 1rem;
    
}

.bahl-logo-img {
  width: 27vw;
  vertical-align: middle;
}

.error-message{
  color: var(--white);
  font-weight: bolder;
  font-size: 2vw;
  margin-top: 8px;
}
</style>