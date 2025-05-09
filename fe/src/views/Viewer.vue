<template>
  <div class="viewer-container">
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
                <el-option label="Customer's CNIC Number" value="customer_cnic_number" />
                <el-option label="Address" value="address" />
                <el-option label="City" value="city" />
              </el-select>
              <el-input v-model="input" placeholder="Please input" class="input-field"></el-input>
              <el-button class="custom-button" @click="searchButton">Search</el-button>
              <el-button class="custom-button" @click="openReportModal">View History</el-button>
            </div>
            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
          </div>
          <div class="table-container p-datatable" v-if="tableData.length">
            <div class="table-responsive my-custom-table">
              <table class="data-table p-datatable-table">
                <thead>
                  <tr>
                    <th>Sno</th>
                    <th>Consignment Number</th>
                    <th>Courier</th>
                    <th>Booking Date</th>
                    <th>Account Number</th>
                    <th>Account Title</th>
                    <th>Shipping Bill</th>
                    <th>Address</th>
                    <th>City</th>
                    <th>Email</th>
                    <th>Mobile Number</th>
                    <th>Letter Type</th>
                    <th>Card Number</th>
                    <th>Card Type</th>
                    <th>Card Creation Date</th>
                    <th>Return Reason</th>
                    <th>Return Date</th>
                    <th>Branch Code</th>
                    <th>Received By (At Branch)</th>
                    <th>Delivery Date</th>
                    <th>Status</th>
                    <th>Delivered To</th>
                    <th>Relationship</th>
                    <th>CNIC Number of Receiver</th>
                    <th>Card Status</th>
                    <th>Customer CNIC Number</th>
                  </tr>
                </thead>
                <tbody class="p-datatable p-datatable-tbody">
                  <tr v-for="(item, index) in tableData" :key="item.consignment_id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.consignment_id }}</td>
                    <td>{{ item.courier }}</td>
                    <td>{{ item.booking_date }}</td>
                    <td>{{ item.account_no }}</td>
                    <td>{{ item.account_title }}</td>
                    <td>{{ item.shipping_bill }}</td>
                    <td>{{ item.address }}</td>
                    <td>{{ item.city }}</td>
                    <td>{{ item.email }}</td>
                    <td>{{ item.mobile_no }}</td>
                    <td>{{ item.letter_type }}</td>
                    <td>{{ item.card_no }}</td>
                    <td>{{ item.card_type }}</td>
                    <td>{{ item.card_creation_date }}</td>
                    <td>{{ item.return_reason }}</td>
                    <td>{{ item.return_date }}</td>
                    <td>{{ item.branch_cd }}</td>
                    <td>{{ item.receiver_name_b }}</td>
                    <td>{{ item.delivery_date }}</td>
                    <td>{{ item.status }}</td>
                    <td>{{ item.receiver_name_d }}</td>
                    <td>{{ item.relationship }}</td>
                    <td>{{ item.receiver_cnic }}</td>
                    <td>{{ item.card_status }}</td>
                    <td>{{ item.customer_cnic_number }}</td>
                  </tr>
                  <tr v-if="tableData.length === 0">
                    <td :colspan="26" style="text-align: center;">No Data Available</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <el-dialog v-model="reportModalVisible" title="Generate File Upload History Report" width="30%" center
        :close-on-click-modal="false" :close-on-press-escape="false">
        <div class="modal-content">
          <p>Please select the date range for the report.</p>
          <el-date-picker v-model="fromDatePicker" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
            placeholder="From Date" style="margin-right: 10px;" />
          <el-date-picker v-model="toDatePicker" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
            placeholder="To Date" />
          <div v-if="reportError" class="error-message">
            {{ reportError }}
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="reportModalVisible = false">Cancel</el-button>
            <el-button type="primary" @click="viewReport" :loading="isGeneratingReport">
              {{ isGeneratingReport ? 'Generating...' : 'Generate Report' }}
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
    <div class="back-container">
      <div class="back-button-container">
        <button @click="goBack" class="balh-btn back-btn">
          Back
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { TableInstance } from 'element-plus';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus'; // Import ElMessage for notifications

const router = useRouter();

const input = ref('');
const select = ref('');
const errorMessage = ref<string | null>(null);
const tableData = ref<TableRow[]>([]);
// Initialize date pickers for the modal
const fromDatePicker = ref<string | null>(null); // Use null for initial state
const toDatePicker = ref<string | null>(null); // Use null for initial state

// Modal state
const reportModalVisible = ref(false);
const isGeneratingReport = ref(false);
const reportError = ref<string | null>(null);


// Function to open the report modal
const openReportModal = () => {
  reportModalVisible.value = true;
  // Optionally reset dates when opening the modal
  // fromDatePicker.value = null;
  // toDatePicker.value = null;
  reportError.value = null; // Clear previous errors
};
const goBack = () => {
  router.push('/main');
}
// This function is now called from within the modal
const viewReport = async () => {
  reportError.value = null; // Clear previous errors
  if (!fromDatePicker.value || !toDatePicker.value) {
    reportError.value = 'Please select both From and To dates.';
    return;
  }

  isGeneratingReport.value = true; // Start loading state

  try {
    const authToken = JSON.parse(localStorage.getItem("authResponse")).token;
    const username = JSON.parse(localStorage.getItem("authResponse")).userName;
    const design = 'cts_report.rptdesign';
    const format = 'pdf';
    const fromDate = fromDatePicker.value;
    const toDate = toDatePicker.value;
    console.log("username passed for report:", username);
    const url = `http://localhost:8081/api/data-access/consignment-details/generate?designfile=${design}&format=${format}&username=${username}&fromDate=${fromDate}&toDate=${toDate}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/octet-stream',
        'Authorization': `Bearer ${authToken}`,
      }
    });

    if (!response.ok) {
      const contentType = response.headers.get('Content-Type');
      let errorBody: any = null;
      try {
        if (contentType && contentType.includes('application/json')) {
          errorBody = await response.json();
        } else {
          errorBody = await response.text();
        }
      } catch (e) {
        console.error("Error parsing response body", e);
      }
      // Check for specific empty data response structure if applicable
      if (response.status === 400 && errorBody && errorBody.message === "No data found for the given date range.") {
        reportError.value = "No data found for the selected date range.";
      } else {
        throw {
          status: response.status,
          statusText: response.statusText,
          message: `HTTP error! Status: ${response.status}`,
          body: errorBody // this works because you're creating the object here
        };
      }
      isGeneratingReport.value = false; // End loading state
      return; // Exit the function if there was an error
    }

    const reportBlob = await response.blob();

    if (reportBlob.size === 0) {
      reportError.value = "The generated report is empty. Please check the date range.";
      isGeneratingReport.value = false; // End loading state
      return; // Exit if the blob is empty
    }


    const blob = new Blob([reportBlob], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(blob);

    window.open(fileURL, '_blank');

    reportModalVisible.value = false;

  } catch (error: any) {
    console.error("Error fetching report:", error);
    isGeneratingReport.value = false; // End loading state
    if (error && error.status === 401) {
      reportError.value = "Unauthorized: Your session may have expired or you lack permission. Please log in again.";
    } else if (error && error.status) {
      reportError.value = `Failed to generate the report. Server responded with status ${error.status}: ${error.statusText}.`;
    } else if (error instanceof TypeError) {
      reportError.value = `Network Error: Could not reach the report server. Please check your connection and the server address. (${error.message})`;
    }
    else {
      reportError.value = "Failed to generate the report due to an unexpected error.";
    }
    ElMessage.error(reportError.value); // Show Element Plus error message
  } finally {
    isGeneratingReport.value = false; // Ensure loading state is turned off
  }
}
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
.back-container{
  padding-left: 5vw;
  display: flex;
  justify-content: flex-end;
}
.balh-btn.back-btn {
  background-color: #d1d6da;
  color: var(--balh-white);
  max-width: 150px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
}

.balh-btn.back-btn:hover:not(.disabled) {
  background-color: #afb9c0;
  /* Darker grey on hover */
  transform: translateY(-3px);
  /* Subtle lift for back button */
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.balh-btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
  /* Add transform to transition */
  width: 100%;
  max-width: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  /* Initial subtle shadow */
}

.balh-btn:hover:not(.disabled) {
  transform: translateY(-5px);
  /* Lift effect */
  box-shadow: var(--balh-hover-shadow);
  /* Enhanced shadow on hover */
}


.balh-btn-icon {
  margin-right: 8px;
}

.balh-btn.primary {
  background-color: var(--balh-primary-green);
  color: var(--balh-white);
}

.balh-btn.primary:hover:not(.disabled) {
  background-color: #199666;
  /* Slightly darker green */
}

.balh-btn.secondary {
  background-color: var(--balh-light-grey-bg);
  color: var(--balh-grey-text);
  border: 1px solid var(--balh-border-grey);
}

.balh-btn.secondary:hover:not(.disabled) {
  background-color: #e0e0e0;
}

.balh-btn.disabled {
  background-color: var(--balh-disabled-grey);
  color: var(--balh-disabled-text);
  cursor: not-allowed;
  box-shadow: none;
  border: 1px solid var(--balh-disabled-grey);
  transform: none;
  /* No lift effect when disabled */
}

.balh-btn.disabled:hover {
  transform: none;
  /* Ensure no transform on hover when disabled */
  box-shadow: none;
  /* Ensure no shadow change on hover when disabled */
}

.back-button-container {
  margin-top: 2rem;
}
.viewer-container{
  height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 8px;
  /* box-shadow: 0 4px 15px rgb(0 0 0 / 28%); */
  /* padding-left: 50px; */
}
.p-datatable .p-datatable-tbody>tr>td {
  border: 1px solid #a9a9a9 !important;
  border-width: 0 0 1px 1px !important;
}

.table-container {
  padding: 8px;
  background-color: rgb(162, 200, 168);
  border: 1px solid #ebeef5;
  border-radius: 3px;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  max-height: 420px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    border-radius: 10px;
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: #888;
    /* Muted gray/green, adjust color to match screenshot precisely */
    border-radius: 10px;
    /* Optional: rounded corners for the thumb */
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
    /* Darker color on hover */
  }

  /* Hide the scrollbar buttons (arrows) for Webkit browsers */
  &::-webkit-scrollbar-button {
    display: none;
  }

  scrollbar-width: thin;
  scrollbar-color: #006363 #f1f1f1;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #1a1b1b;
}

.data-table thead {
  position: sticky;
  top: 0;
  background-color: #f5f7fa;
  z-index: 1;
}

.data-table th,
.data-table td {
  padding: 8px 7px;
  border: 1px solid #ebeef5;
  text-align: left;
  white-space: nowrap;
}

.data-table th {
  background-color: rgb(162, 200, 168);
  font-weight: bold;
}

.data-table tbody tr:nth-child(odd) {
  background-color: #fff;
}

.data-table tbody tr:nth-child(even) {
  background-color: #fcfcfc;
  /* Slightly different background for even rows (stripe effect) */
}

.data-table td[colspan][style*="text-align: center;"] {
  font-style: italic;
  color: #909399;
}

.modal-content {
  padding: 20px;
  text-align: center;
}

.modal-content p {
  margin-bottom: 20px;
}

.modal-content .el-date-editor {
  width: auto;
}

.error-message {
  color: red;
  margin-top: 10px;
  font-size: 0.9em;
}

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

.balh-headerr>div:nth-child(2) {
  margin-left: auto;
  margin-right: auto;
}

.main-cotainer {
  background-color: var(--balh-white);
  border-radius: 8px;
  box-shadow: 0 4px 15px rgb(8 8 8 / 36%);
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


}
</style>
