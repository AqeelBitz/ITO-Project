<template>
  <div class="main-cotainer">
    <div class="heading">
      <h1>Consignment Details</h1>
    </div>
    <div class="container">
      <div class="main-div">
        <div class="input-container">
          <el-select v-model="select" class="select-field" placeholder="Select">
            <el-option label="Consignment Number" value="consignment_id" />
            <el-option label="Account Number" value="account_no" />
            <el-option label="Reciver's CNIC Number" value="receiver_cnic" />
            <el-option label="Address" value="address" />
            <el-option label="City" value="city" />
          </el-select>
          <el-input v-model="input" placeholder="Please input" class="input-field"></el-input>
          <el-button class="custom-button" @click="searchButton">Search</el-button>
        </div>
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
      <div class="table-responsive" v-if="tableData.length">
        <el-table
          ref="multipleTableRef"
          row-key="consignment_id"
          :data="tableData"
          scrollbar-always-on
          empty-text="No Data Available"
          :border="true"
          stripe
          height="auto"
          style="width: 100%;"
        >
          <el-table-column type="index" />
          <el-table-column prop="consignment_id" label="Consignment Number" min-width="120" />
          <el-table-column prop="courier" label="Courier" min-width="120" />
          <el-table-column prop="booking_date" label="Booking Date" min-width="120" />
          <el-table-column prop="account_no" label="Account Number" min-width="120" />
          <el-table-column prop="account_title" label="Account Title" min-width="150" />
          <el-table-column prop="shipping_bill" label="Shipping Bill" min-width="120" />
          <el-table-column prop="address" label="Address" min-width="200" />
          <el-table-column prop="city" label="City" min-width="120" />
          <el-table-column prop="email" label="Email" min-width="180" />
          <el-table-column prop="mobile_no" label="Mobile Number" min-width="120" />
          <el-table-column prop="letter_type" label="Letter Type" min-width="120" />
          <el-table-column prop="card_no" label="Card Number" min-width="150" />
          <el-table-column prop="card_type" label="Card Type" min-width="120" />
          <el-table-column prop="card_creation_date" label="Card Creation Date" min-width="150" />
          <el-table-column prop="return_reason" label="Return Reason" min-width="150" />
          <el-table-column prop="return_date" label="Return Date" min-width="120" />
          <el-table-column prop="branch_cd" label="Branch Code" min-width="120" />
          <el-table-column prop="receiver_name_b" label="Received By (At Branch)" min-width="180" />
          <el-table-column prop="delivery_date" label="Delivery Date" min-width="120" />
          <el-table-column prop="status" label="Status" min-width="120" />
          <el-table-column prop="receiver_name_d" label="Delivered To" min-width="180" />
          <el-table-column prop="relationship" label="Relationship" min-width="120" />
          <el-table-column prop="receiver_cnic" label="CNIC Number of Receiver" min-width="150" />
          <el-table-column prop="card_status" label="Card Status" min-width="120" />
          <el-table-column prop="customer_cnic_number" label="Customer CNIC Number" min-width="120" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { TableInstance } from 'element-plus';
import { useRouter } from 'vue-router';

const router = useRouter();

const input = ref('');
const select = ref('');
const errorMessage = ref<string | null>(null);
const tableData = ref<TableRow[]>([]);

const searchButton = async () => {
  errorMessage.value = null;
  if (!select.value || !input.value) {
    errorMessage.value = 'Please select a search criteria and enter a value.';
    tableData.value = [];
    return;
  }

  let apiUrl = `http://localhost:3001/fsm/consignments/search?${select.value}=${input.value}`;
  const authToken = JSON.parse(localStorage.getItem("authResponse")).token; 
console.log("authToken: ",authToken);
  const headers = {
    'accept': '*/*',
    'Authorization': `Bearer ${authToken}`,
  };

  try {
    const response = await fetch(apiUrl,{
      headers:headers,
    });
    if (!response.ok) {
      const error = await response.json();
      errorMessage.value = error.message || 'Failed to fetch data.';
      tableData.value = [];
      return;
    }
    const res = await response.json();
    const data = res.data.data;
    // Ensure the API returns an array. If it returns a single object, wrap it in an array.
    tableData.value = Array.isArray(data) ? data : [data];
  } catch (error: any) {
    errorMessage.value = error.message || 'An unexpected error occurred.';
    tableData.value = [];
  }
};

interface TableRow {
  consignment_id: number;
  courier: String;
  booking_date: String;
  account_no: String;
  account_title: String;
  shipping_bill: String;
  address: String;
  city: String;
  email: String;
  mobile_no: String;
  letter_type: String;
  card_no: String;
  card_type: String;
  card_creation_date: String;
  return_reason: String;
  return_date: String;
  branch_cd: String;
  receiver_name_b: String;
  delivery_date: String;
  status: String;
  receiver_name_d: String;
  relationship: String;
  receiver_cnic: String;
  card_status: String;
  customer_cnic_number:String;
}

const multipleTableRef = ref<TableInstance | null>(null);
</script>

<style scoped>
.main-container {
  display: flex;
  height: 100vh; /* Make the main container take full viewport height */
  overflow: hidden; /* Prevent body scroll */
}
/* .main-container{
  display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
} */
.container{
  display: flex
;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.form-section {
  width: 350px; /* Adjust as needed */
  background-color: #f4f4f4;
  padding: 20px;
  box-sizing: border-box;
  position: sticky; /* Keep the form fixed on scroll within main-container */
  top: 0;
  left: 0;
  height: 100vh; /* Make the form section full height */
  overflow-y: auto; /* Allow scrolling for long forms */
}

.form-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.heading {
  display: flex;
  justify-content: center;
  color: white;
}

.input-container {
  margin-bottom: 10px;
  display: flex;
    flex-direction: column;
    gap: 15px;  
    width: 100%;
}

.select-field {
  width: 100%;
}

.input-field {
  width: 100%;
}

.custom-button {
  width: 100%;
}

.error-message {
  color: #dc3545;
  margin-top: 10px;
  font-size: 14px;
}

/* .table-section {
  flex-grow: 1;
  overflow: auto; 
  padding: 20px;
  box-sizing: border-box;
} */
.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.el-table {
  min-width: 100%;
}

.no-data-message {
  color: #777;
  font-style: italic;
  padding: 20px;
  text-align: center;
}
</style>