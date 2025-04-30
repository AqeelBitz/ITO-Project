<template>
  <el-row>
    <div class="heading">
      <h1><b style="font-weight: bold;">CONSIGNMENT TRACKING SYSTEM</b></h1>
    </div>
  </el-row>
  <el-row>
    <el-col :span="12">
      <div class="img"><img src="../assets/download.png" alt="logo" width="60%"></div>
    </el-col>
    <el-col :span="12" class="box">
      <fieldset class="border border-dark border-2 p-2">
        <legend class="legend-text float-none w-auto p-2" style="">Login
        </legend>
        <div class="login-form">
          <el-form :model="formData" @submit.prevent="handleSubmit" ref="ruleFormRef" style="max-width: 70%" status-icon
            :rules="rules" label-width="auto" class="demo-ruleForm">
            <el-form-item label="Username" :error="usernameError" class="label-color">
              <el-input v-model="formData.username" @change="validateUsername" />
            </el-form-item>
            <el-form-item label="Password" :error="passwordError" class="label-color">
              <el-input v-model="formData.password" type="password" @change="validatePassword" />
            </el-form-item>
            <el-form-item label="Branch Code" :error="branchCodeError" class="label-color">
              <el-input v-model="formData.branchCd" @change="validateBranchCode" />
            </el-form-item>
            <p v-if="loading">Logging in..</p>
            <p v-if="error">Error: {{ error }}</p>
          </el-form>
        </div>
      </fieldset>
      <div class="buttons">
        <div>
          <button type="primary" native-type="submit" @click="handleSubmit" class="login-btn">Login</button>
        </div>
        <div>
          <button @click="resetForm" class="reset-btn">Reset</button>
        </div>
      </div>
    </el-col>
  </el-row>

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
import { ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'; // Removed ElMessage import
import { useRouter } from 'vue-router';


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
.p-text {
  color: #000;
}

.msg-text {
  font-weight: bold;
  display: flex;
  justify-content: center;
}

.el-message-box__header {
  background-color: #009b83;
  padding: 2%;
}

.el-message-box__title {
  color: var(--el-messagebox-title-color);
  --el-messagebox-title-color: #000;
  font-weight: 700;
}

.el-message-box {
  background-color: rgb(160, 200, 168);
}

.el-message-box__title {
  padding-left: 0;
  margin-bottom: 0;
  font-size: var(--el-messagebox-font-size);
  line-height: 1;
}

.el-message-box__content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 10px var(--el-messagebox-padding-primary);
  color: var(--el-messagebox-content-color);
  font-size: var(--el-messagebox-content-font-size);
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
}

.login-btn {
  height: 40px;
  width: 200%;
  background-color: #cccccc;
  border: black;
  color: black;
  font-size: 16px;
  font-weight: bold;
  border-radius: 0%;
}

.reset-btn {
  height: 40px;
  width: 200%;
  background-color: rgb(0, 155, 131);
  border: black;
  color: black;
  font-size: 16px;
  font-weight: bold;
  border-radius: 0%;
}

.buttons {
  display: flex;
  justify-content: space-between;
  width: 59%;
  margin-top: 15px;
}

.el-form {
  display: contents;
}

.box {
  margin-top: 190px;
}

.border-dark {
  border: 2px solid #212529;
  width: 500px;
}

legend {
  font-family: Arial;
  font-size: 22px;
  font-weight: bold;
}

.img {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.heading {
  margin-bottom: 15px;
  width: -webkit-fill-available;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
  font-weight: bolder;
  font-size: large;
}

.login-form {
  justify-content: center;
  align-items: center;
  /* margin-top: 190px; */
}

.custom-button {
  margin-left: 215px;
  color: black;
  background-color: #afafaf;
  border-color: #afafaf;
  width: 80px;
  height: 35px;
  border-width: 2px;
  font-size: 15.5px;
}

.custom-button:hover {
  border-color: grey;
  background-color: #afafaf;
  color: black;
}

.reset-button:hover {
  border-color: grey;
  border-width: 2px;
  background-color: #afafaf;
  color: black;

}

.reset-button {
  color: black;
  background-color: #afafaf;
  border-color: #afafaf;
  width: 80px;
  height: 35px;
  font-size: 15.5px;
}

.form>div {

  border: 2px solid white;
  padding: 10%;
  border-radius: 2%;
}

.class {
  display: flex;
  align-items: center;
  justify-content: center;
}

.heading {
  display: flex;
  justify-content: center;
  font-weight: bolder;
}

.container {
  padding-top: 1.5rem !important;
  padding-bottom: 1.5rem !important;
}

.label-color :deep(.el-form-item__label) {
  color: #000000;
  font-size: 16px;
}

.input-field {
  height: 40px;
  border-radius: 5px;
  /* background-color: #c1dabf; */
  padding: 2px;
}

.input-field:hover {
  background-color: #c1dabf;
}
</style>