<template>
  <div>
    <div>
      <header data-v-9562428a="" class="balh-headerr">
        <div data-v-9562428a="" class="header-contentt">
          <div>
            <img data-v-9562428a="" src="/src/assets/download.png" alt="Bank Al Habib Logo" class="bahl-logoo">
          </div>
        </div>
        <div>
            <h1 data-v-9562428a="" class="balh-titlee">CONSIGNMENT TRACKING SYSTEM</h1>
          </div>
      </header>
    </div>
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
          <el-table ref="multipleTableRef" row-key="consignment_id" :data="tableData" scrollbar-always-on
            empty-text="No Data Available" :border="true" stripe height="auto" style="width: 100%;">
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
  console.log("authToken: ", authToken);
  const headers = {
    'accept': '*/*',
    'Authorization': `Bearer ${authToken}`,
  };

  try {
    const response = await fetch(apiUrl, {
      headers: headers,
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
  customer_cnic_number: String;
}

const multipleTableRef = ref<TableInstance | null>(null);
</script>
<style scoped>
.balh-titlee {
  text-align: center;
  margin: 0;
}

.bahl-logoo {
  height: 60px;
}

.balh-headerr { 
  display: flex;
  flex-direction: row;
  align-items: center; 
  width: 100%; 
  padding: 0 20px;
  box-sizing: border-box; 
}

.balh-headerr > div:nth-child(2) {
  margin-left: auto;
  margin-right: auto;
}

.main-cotainer {
  background-color: var(--balh-white);
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 15px;
  font-family: 'Arial', sans-serif;
  box-sizing: border-box;
  width: 100%;
  max-width: 1500px;
  margin: 20px auto;
}

.heading {
  text-align: center;
  color: #29f98e;
  margin-bottom: 20px;
}

.heading h1 {
  font-size: 1.8em;
  font-weight: bold;
  margin: 0;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.main-div {
  width: 100%;
}

.input-container {
  display: flex;
  flex-direction: column;
  /* Stack inputs vertically by default on small screens */
  gap: 10px;
  /* Space between input elements */
  width: 100%;
  align-items: stretch;
  /* Stretch items to fill container width */
}

.select-field .el-input__wrapper,
.input-field .el-input__wrapper {
  /* Style Element Plus input/select wrappers */
  background-color: #f9f9f9;
  /* Light background */
  border-radius: 4px;
  padding: 8px 12px;
  /* Comfortable padding */
  /* Ensure consistent box model */
  box-shadow: none !important;
  /* Remove default shadow */
  border: 1px solid var(--balh-border-grey);
  /* Subtle border */
  box-sizing: border-box;
}

.select-field .el-input__wrapper.is-focused,
.input-field .el-input__wrapper.is-focused {
  border-color: #00a651;
  /* Highlight color on focus */
  box-shadow: 0 0 0 1px #00a651 inset !important;
}


.select-field.el-select {
  width: 100%;
}

.input-field.el-input {
  width: 100%;
}


.custom-button {
  background-color: #00a651;
  color: var(--balh-white);
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  font-size: 1em;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
  width: 100%;
  max-width: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.custom-button:hover:not(.disabled) {
  background-color: #007a3b;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.custom-button.disabled {
  background-color: var(--balh-disabled-grey);
  color: var(--balh-disabled-text);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #fee6e6;
  color: #f56c6c;
  border: 1px solid #f56c6c;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
  font-weight: bold;
  text-align: center;
  word-break: break-word;
  font-size: 0.9em;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  margin-top: 0;
  box-sizing: border-box;
  border-radius: 4px;
  overflow: hidden;
}

.el-table {
  width: 100%;
  border: none;
  border-radius: 0;
}

.el-table td.el-table__cell,
.el-table th.el-table__cell {
  border-bottom: 1px solid #f4f4f4;
  border-right: none;
  /* Remove vertical borders */
  padding: 10px;
  /* Base padding */
  box-sizing: border-box;
  white-space: normal;
  /* Allow text wrapping */
  word-break: break-word;
  vertical-align: top;
}

.el-table__header-wrapper th.el-table__cell {
  background-color: #007a3b;
  /* Darker green for header background */
  color: #ffffff;
  font-weight: bold;
  border-bottom: 2px solid #00a651;
  /* Slightly lighter green bottom border */
  text-align: center;
  /* Center header text */
  padding: 12px 10px;
  /* Padding for headers */
}

/* Remove the default inner border line Element Plus adds */
.el-table__inner-wrapper::before {
  height: 0;
}

/* Add a border to the table itself (on the container) */
.table-responsive .el-table--border {
  border: 1px solid #cccccc;
  border-radius: 4px;
}


/* Style for striped table rows */
.el-table__body tr.el-table__row--striped {
  background-color: #f9f9f9;
}

/* Style for table row hover state */
.el-table__body tr.el-table__row:hover>td {
  background-color: #e9f6ee !important;
  /* Light green hover effect */
}

/* Empty Table State */
/* Element Plus handles the empty-text, we just need container styling */
.el-table__empty-block {
  min-height: 150px;
  /* Ensure the empty state block has some height */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  /* Element Plus default empty text color */
}


/* --- Media Queries for Responsiveness --- */
@media (min-width: 768px) {
  .main-cotainer {
    padding: 20px 30px;
    /* More padding on larger screens */
  }

  .heading h1 {
    font-size: 2.2em;
  }

  .container {
    gap: 30px;
    /* More space between sections on larger screens */
  }

  .input-container {
    flex-direction: row;
    /* Arrange inputs horizontally on larger screens */
    gap: 15px;
    /* Space between input elements */
    align-items: center;
    /* Align items vertically in the center */
  }

  .select-field.el-select {
    width: 200px;
    /* Fixed width for select on larger screens */
  }

  .input-field.el-input {
    flex-grow: 1;
    /* Allow input to take remaining space */
    width: auto;
    /* Override 100% width */
  }

  .custom-button {
    width: auto;
    /* Button takes natural width */
    max-width: 150px;
    /* Max width for the button */
    padding: 10px 25px;
    font-size: 1.1em;
  }

  .error-message {
    margin-top: 20px;
    padding: 12px;
    font-size: 1em;
  }

  .table-responsive {
    margin-top: 0;
    /* Gap handles spacing */
  }

  .el-table td.el-table__cell,
  .el-table th.el-table__cell {
    padding: 12px 15px;
    /* More padding in table cells on larger screens */
  }
}
</style>
<!-- <style scoped>
.main-container {
  display: flex;
  height: 100vh; /* Make the main container take full viewport height */
  overflow: hidden; /* Prevent body scroll */
}
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
</style> -->