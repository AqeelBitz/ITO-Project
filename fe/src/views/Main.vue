<template>
  <el-row>
    <div class="heading">
      <h1><b style="font-weight: bold;">CONSIGNMENT TRACKING SYSTEM</b></h1>
    </div>
  </el-row>
  <el-col class="col">
    <el-row class="buttons">
      <div>
        <button
          type="primary"
          @click="goToUpload"
          class="upload-btn"
          :disabled="roleId === '1'"
        >
        Upload
        </button>
      </div>
      <div>
        <button @click="goToView" class="view-btn">View</button>
      </div>
    </el-row>
    <el-row>
      <button @click="goBack" class="back-btn">Back</button>
    </el-row>
  </el-col>
</template>


<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const goToUpload = () => {
  router.push('/upload');
};
const goToView = () => {
  router.push('/viewer');
};
const goBack=() =>{
  router.push('/');
};
const roleId = JSON.parse(localStorage.getItem("authResponse")).roleId;
</script>



<style scoped>
.back-btn{
  height: 40px;
    padding: 0% 6% 0% 6%;
    margin:4% 0% 0% 14.5%;
    background-color: #009b83;
    border: black;
    color: black;
    font-size: 16px;
    font-weight: bold;
    border-radius: 0%;
}
.back-btn:hover{
  background-color: #098572;
}

.col{
  height: auto;
}
.upload-btn {

  height: 15vw;
  width: 20vw;
  background-color: #cccccc;
  border: black;
  color: black;
  font-size: 16px;
  font-weight: bold;
  border-radius: 0%;
}
.upload-btn:hover{
  background-color: #afafaf;;
}

.upload-btn:disabled {
  background-color: #e0e0e0; 
  color: #999999; 
  opacity: 0.6; 
  cursor: not-allowed; 
}

.upload-btn:disabled:hover {
  background-color: #e0e0e0;
}
.view-btn {
  height: 15vw;
  width: 20vw;
  background-color: #cccccc;
  border: black;
  color: black;
  font-size: 16px;
  font-weight: bold;
  border-radius: 0%;
}
.view-btn:hover{
  background-color: #afafaf;;
}


.buttons {
  margin-top: 5%;
  display: flex;
  justify-content: space-around;
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

</style>