<template>
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
  <div class="main-container">
    <div class="heading">
      <h1>Upload File</h1>
    </div>
    <div class="upload-page-container">
      <div class="upload-button-container">
        <div>
          <el-upload ref="uploadRef" class="upload-demo" action="" :auto-upload="false" :show-file-list="false"
            accept=".csv" @change="handleFileChange">
            <template #trigger>
              <el-button id="file_input" class="custom-button">Select File</el-button>
            </template>
            <template #tip>
              <div class="upload-tip">csv files with a size less than 500MB</div>
            </template>
          </el-upload>
        </div>
        <div>
          <el-button id="file_input" class="custom-button" @click="openReportModal">View History</el-button>
        </div>
      </div>
      <el-dialog v-model="reportModalVisible" title="Generate File Upload History Report" width="30%" center
        :close-on-click-modal="false" :close-on-press-escape="false" @close="closeModal">
        <div class="modal-content">
          <p>Please select the date range for the report.</p>
          <el-date-picker v-model="fromDatePicker" :disabled-date="disableToDate" type="date" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" placeholder="From Date" style="margin-right: 10px; margin-bottom: 10px;" />
          <el-date-picker v-model="toDatePicker" :disabled-date="disableToDate" type="date" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" placeholder="To Date" style="margin-right: 10px;" />
          <div v-if="dateErrorMessage" class="error-message">
            {{ dateErrorMessage }}
          </div>
          <div v-if="reportError" class="error-message">
            {{ reportError }}
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button class="cancel-btn" @click="closeModal">Cancel</el-button>
            <el-button class="generate-button" @click="viewReport" :loading="isGeneratingReport">
              {{ isGeneratingReport ? 'Generating...' : 'Generate Report' }}
            </el-button>
          </span>
        </template>
      </el-dialog>
      <div v-if="fileName" class="file-name">{{ fileName }}</div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}
      </div>
      <div class="" v-if="tableData.length > 0 && columns.length > 0 && columns[0].prop !== 'placeholder'">
        <div class="p-datatable">
          <div class=" table-responsive my-custom-table">
            <table class="data-table p-datatable-table">
              <thead>
                <tr>
                  <th class="fixed-column">#</th>

                  <template v-if="columns.length > 0 && columns[0].prop !== 'placeholder'">
                    <th v-for="column in columns" :key="column.prop">
                      {{ column.label }}
                    </th>
                  </template>
                </tr>
              </thead>
              <tbody class="p-datatable p-datatable-tbody">
                <tr v-for="(item, index) in tableData" :key="item.id">
                  <td class="fixed-column">{{ index + 1 }}</td>

                  <template v-if="columns.length > 0 && columns[0].prop !== 'placeholder'">
                    <td v-for="column in columns" :key="column.prop">
                      {{ item[column.prop] }} </td>
                  </template>
                </tr>

                <tr v-if="tableData.length === 0">
                  <td :colspan="columns.length + 1" style="text-align: center;">No Data Available</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="buttons-container">
          <div class="action-buttons" style="margin-top: 20px; display: flex; gap: 10px;">
            <el-button class="accept-btn" type="primary" @click="acceptAllData()">Accept</el-button>
            <el-button class="reject-btn" @click="rejectAllData()">Reject</el-button>
          </div>
        </div>

      </div>
      <div v-else-if="!fileName && !errorMessage" class="empty-state" @click="triggerFileUpload"
        @dragover.prevent="onDragOver" @dragenter.prevent="onDragOver" @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop" :class="{ 'drag-over': isDragging }">
        <div class="upload-empty-container">
          <div style="font-size: 90px; padding-right: 15px;">
            <el-icon class="el-icon--upload" viewBox="0 0 24 24"><upload-filled /></el-icon>
          </div>
          <div>
            <p>Drag and drop file here or click to select.</p>
          </div>
        </div>
      </div>
      <div
        v-else-if="fileName && (tableData.length === 0 || (columns.length === 1 && columns[0].prop === 'placeholder')) && !errorMessage"
        class="empty-state">

        <p>File selected but no data or valid columns found.</p>
      </div>
      <div class="back-button-container">
        <button @click="goBack" class="balh-btn back-btn">
          Back
        </button>
      </div>
      <MessageBox :visible="showMessageBox" :title="messageBoxTitle" :content="messageBoxContent" :type="messageBoxType"
        @close="handleMessageBoxClose" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Papa from 'papaparse';
import MessageBox from './MessageBox.vue';
import { useRouter } from 'vue-router';
import { UploadFilled } from '@element-plus/icons-vue'
import { Loading } from '@element-plus/icons-vue'
const reportModalVisible = ref(false);
const isGeneratingReport = ref(false);
const reportError = ref(null);
const today = new Date();
const router = useRouter();
const errorMessage = ref(null);
const tableData = ref([]);
const showMessageBox = ref(false);
const messageBoxContent = ref('');
const messageBoxTitle = ref('');
const messageBoxType = ref('info');
const isLoading = ref(false);
const messageBoxPurpose = ref(null);
const apiResponseData = ref(null);
const apiErrorMessage = ref(null);
const dataToSendToApi = ref([]);
const validationErrors = ref([]);
const rejectedRows = ref([]);
const acceptedRows = ref([]);
const isDragging = ref(false);


let file_id = 0;
let total_record;

const fileName = ref('');
const columns = ref([]);
const uploadRef = ref(null);
const mappedObjects = ref([]);
const dateErrorMessage = ref(null);
const fromDatePicker = ref(null);
const toDatePicker = ref(null);
const sessionExpired = ref(false);

const disableToDate = (date) => {
  return date > today;
};
watch([fromDatePicker, toDatePicker], ([newFromDate, newToDate]) => {
  if (newFromDate && newToDate) {
    const from = new Date(newFromDate);
    const to = new Date(newToDate);
    if (from > to) {
      dateErrorMessage.value = 'From Date must be earlier than To Date.';
    } else {
      dateErrorMessage.value = null;
    }
  } else {
    dateErrorMessage.value = null;
  }
});

const closeModal = () => {
  reportModalVisible.value = false
  fromDatePicker.value = "";
  toDatePicker.value = "";
}

const openReportModal = () => {
  reportModalVisible.value = true;
  reportError.value = null;
};

const viewReport = async () => {
  if (dateErrorMessage.value) {
    return;
  };
  reportError.value = null;
  if (!fromDatePicker.value || !toDatePicker.value) {
    reportError.value = 'Please select both From and To dates.';
    return;
  }

  isGeneratingReport.value = true;
  const authToken = localStorage.getItem("authResponse") ? JSON.parse(localStorage.getItem("authResponse"))?.token : "";
  const authResponse = localStorage.getItem("authResponse") ? localStorage.getItem("authResponse") : "";
  const tokenExpiration = parseInt(localStorage.getItem("tokenExpiration"));
  if (tokenExpiration >= Date.now() && tokenExpiration !== 0 && authToken !== "" && authResponse !== "") {
    try {
      const username = JSON.parse(localStorage.getItem("authResponse")).userName;
      const design = 'cts_report.rptdesign';
      const format = 'pdf';
      const fromDate = fromDatePicker.value;
      const toDate = toDatePicker.value;
      const url = `http://localhost:8082/consignments/generate?designfile=${design}&format=${format}&username=${username}&fromDate=${fromDate}&toDate=${toDate}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream',
          'Authorization': `Bearer ${authToken}`,
        }
      });

      if (!response.ok) {
        const contentType = response.headers.get('Content-Type');
        let errorBody = null;
        try {
          if (contentType && contentType.includes('application/json')) {
            errorBody = await response.json();
          } else {
            errorBody = await response.text();
          }
        } catch (e) {
          console.error("Error parsing response body", e);
        }
        if (response.status === 400 && errorBody && errorBody.message === "No data found for the given date range.") {
          reportError.value = "No data found for the selected date range.";
        } else {
          throw {
            status: response.status,
            statusText: response.statusText,
            message: `HTTP error! Status: ${response.status}`,
            body: errorBody
          };
        }
        isGeneratingReport.value = false;
        return;
      }

      const reportBlob = await response.blob();

      if (reportBlob.size === 0) {
        reportError.value = "The generated report is empty. Please check the date range.";
        isGeneratingReport.value = false;
        return;
      }


      const blob = new Blob([reportBlob], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(blob);

      window.open(fileURL, '_blank');

      reportModalVisible.value = false;

    } catch (error) {
      console.error("Error fetching report:", error);
      isGeneratingReport.value = false;
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
    } finally {
      isGeneratingReport.value = false;
    }
  } else {
    tableData.value = [];
    reportModalVisible.value = false
    messageBoxContent.value = "Your session has expired. Please log in again.";
    messageBoxTitle.value = 'Session Invalid';
    messageBoxType.value = 'error';
    showMessageBox.value = true;
    setTimeout(() => {
      router.push('/');
    }, 3000)
    return
  }
}
const onDragOver = (event) => {
  event.preventDefault();
  isDragging.value = true;
};

const onDragLeave = (event) => {
  event.preventDefault();
  isDragging.value = false;
};

const onDrop = (event) => {
  event.preventDefault();
  isDragging.value = false;
  const droppedFiles = event.dataTransfer.files;
  if (droppedFiles.length > 0) {
    processFiles(droppedFiles);
  }
  else {
    console.log('No files dropped.');
  }
};
const headingMap = {
  "consignment number": "consignment_id",
  "courier": "courier",
  "booking date": "booking_date",
  "account number": "account_no",
  "account title": "account_title",
  "receiver's cnic": "receiver_cnic",
  "sb/ cb": "shipping_bill",
  "address": "address",
  "city": "city",
  "email": "email",
  "mobile number": "mobile_no",
  "letter type": "letter_type",
  "card number": "card_no",
  "type of card": "card_type",
  "card creation date": "card_creation_date",
  "return reason": "return_reason",
  "date of return shipment received at branch": "return_date",
  "return date": "return_date_courier",
  "branch code": "branch_cd",
  "receiver name b": "receiver_name_b",
  "delivery date": "delivery_date",
  "status": "status",
  "receiver name d": "receiver_name_d",
  "relationship": "relationship",
  "card status": "card_status",
  "customer cnic number": "customer_cnic_number"
};

const goBack = () => {
  router.push('/main');
}

const processFiles = (files) => {
  const fileList = files instanceof FileList ? files : [files];

  if (fileList.length === 0) {
    errorMessage.value = 'No file selected or dropped.';
    return;
  }

  const file = fileList[0];

  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    messageBoxContent.value = 'Invalid file type. Please upload a CSV file.';
    messageBoxTitle.value = 'Invalid file type';
    messageBoxType.value = 'error';
    showMessageBox.value = true;
    fileName.value = '';
    tableData.value = [];
    columns.value = [];
    mappedObjects.value = [];
    total_record = 0;
    file_id = 0;
    rejectedRows.value = [];
    acceptedRows.value = [];
    dataToSendToApi.value = [];
    validationErrors.value = [];
    return;
  }

  if (file.size > 500 * 1024 * 1024) {
    errorMessage.value = 'File size exceeds the limit of 500MB.';
    fileName.value = '';
    tableData.value = [];
    columns.value = [];
    mappedObjects.value = [];
    total_record = 0;
    file_id = 0;
    rejectedRows.value = [];
    acceptedRows.value = [];
    dataToSendToApi.value = [];
    validationErrors.value = [];
    return;
  }

  errorMessage.value = null;
  tableData.value = [];
  columns.value = [];
  fileName.value = '';
  mappedObjects.value = [];
  rejectedRows.value = [];
  acceptedRows.value = [];
  showMessageBox.value = false;
  messageBoxPurpose.value = null;
  apiResponseData.value = null;
  apiErrorMessage.value = null;
  dataToSendToApi.value = [];
  validationErrors.value = [];
  file_id = 0;
  total_record = 0;


  fileName.value = file.name;
  const reader = new FileReader();

  reader.onload = (event) => {
    const csvData = event.target?.result;
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const csvHeaders = Object.keys(results.data[0]);
          const validCsvHeaders = csvHeaders.filter(header => header && header.trim() !== '');

          if (validCsvHeaders.length === 0) {
            messageBoxContent.value = "CSV file has invalid headers. Please ensure headers are correct.";
            messageBoxTitle.value = 'CSV file has invalid headers.';
            messageBoxType.value = 'error';
            showMessageBox.value = true;
            tableData.value = [];
            columns.value = [];
            mappedObjects.value = [];
            total_record = 0;
            return;
          }

          columns.value = validCsvHeaders.map((key) => ({
            prop: key,
            label: key,
          }));
          tableData.value = results.data;
          mappedObjects.value = createMappedObjects(validCsvHeaders, results.data);
          total_record = results.data.length;

          if (validCsvHeaders.length === 16) {
            file_id = 1;
            console.log("Detected File Type: Shipment letter (16 columns)");
          }
          else if (validCsvHeaders.length === 8) {
            file_id = 2;
            console.log("Detected File Type: Delivered letter (8 columns)");
          }
          else if (validCsvHeaders.length === 7) {
            file_id = 3;
            console.log("Detected File Type: Returned letter (7 columns)");
          }
          else {
            file_id = 0;
            messageBoxContent.value = `Invalid file format: Expected 7, 8, or 16 columns, but found ${validCsvHeaders.length}. Please upload a valid template.`;
            messageBoxTitle.value = 'Invalid file format';
            messageBoxType.value = 'error';
            showMessageBox.value = true;
            tableData.value = [];
            columns.value = [];
            mappedObjects.value = [];
            total_record = 0;
          }

        } else {
          columns.value = [];
          tableData.value = [];
          mappedObjects.value = [];
          total_record = 0;
          messageBoxContent.value = "CSV file is empty or contains no data rows.";
          messageBoxTitle.value = 'Empty file';
          messageBoxType.value = 'error';
          showMessageBox.value = true;

        }
      },
      error: (error) => {
        messageBoxContent.value = `CSV parsing error: ${error.message}`;
        messageBoxTitle.value = 'error parsing csv';
        messageBoxType.value = 'error';
        showMessageBox.value = true;
        mappedObjects.value = [];
        tableData.value = [];
        columns.value = [];
        total_record = 0;
      },
    });
  };

  reader.onerror = (error) => {
    errorMessage.value = `File reading error: ${error}`;
    messageBoxContent.value = `File reading error: ${error}`;
    messageBoxTitle.value = 'Unable to read file';
    messageBoxType.value = 'error';
    showMessageBox.value = true;
    mappedObjects.value = [];
    tableData.value = [];
    columns.value = [];
    total_record = 0;
  };

  reader.readAsText(file);
};


const handleFileChange = (uploadFile) => {
  if (uploadFile && uploadFile.raw) {
    processFiles(uploadFile.raw);
  } else {
    messageBoxContent.value = 'File is not properly loaded from upload input.';
    messageBoxTitle.value = 'Unable to load file';
    messageBoxType.value = 'error';
    showMessageBox.value = true;
    fileName.value = '';
    tableData.value = [];
    columns.value = [];
    mappedObjects.value = [];
    total_record = 0;
    file_id = 0;
    rejectedRows.value = [];
    acceptedRows.value = [];
    dataToSendToApi.value = [];
    validationErrors.value = [];
  }
};


const triggerFileUpload = () => {
  if (uploadRef.value) {
    const fileInput = uploadRef.value.$el?.querySelector('input[type="file"]') || uploadRef.value.$refs.input?.$el?.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.click();
    } else {
      console.error("File input element not found on uploadRef. Cannot trigger file upload.");
      const fallbackInput = document.querySelector('.upload-demo input[type="file"]');
      if (fallbackInput) {
        fallbackInput.click();
      } else {
        console.error("Fallback file input element also not found.");
        messageBoxContent.value = "Unable to open file selection dialog.";
        messageBoxTitle.value = 'Unable to open dialog';
        messageBoxType.value = 'error';
        showMessageBox.value = true;
      }
    }
  } else {
    console.error("uploadRef is not available.");
    messageBoxContent.value = "Upload component not initialized correctly.";
    messageBoxTitle.value = 'Error in upload component';
    messageBoxType.value = 'error';
    showMessageBox.value = true;
  }
};


const formatDate = (dateString) => {
  if (!dateString) {
    return null;
  }

  const trimmedDateString = dateString.trim();

  if (trimmedDateString === '') {
    return null;
  }


  const parts_dmy = trimmedDateString.split('-');
  if (parts_dmy.length === 3) {
    const day = parts_dmy[0];
    const month = parts_dmy[1];
    const year = parts_dmy[2];
    if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year.length === 4) {
      const dayInt = parseInt(day, 10);
      const monthInt = parseInt(month, 10);
      if (dayInt >= 1 && dayInt <= 31 && monthInt >= 1 && monthInt <= 12) {
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
      }
    }
  }

  try {
    const date = new Date(trimmedDateString);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      const parts_ymd_check = trimmedDateString.split('-');
      if (parts_ymd_check.length === 3 &&
        parseInt(parts_ymd_check[0], 10) === year &&
        parseInt(parts_ymd_check[1], 10) === parseInt(month, 10) &&
        parseInt(parts_ymd_check[2], 10) === parseInt(day, 10)) {
        return formattedDate;
      }
    }
  } catch (error) {
    console.log("Error parsing date with Date object:", trimmedDateString, error);
  }

  const parts_slash = trimmedDateString.split('/');
  if (parts_slash.length === 3) {
    let part1 = parts_slash[0];
    let part2 = parts_slash[1];
    let year = parts_slash[2];

    if (!isNaN(part1) && !isNaN(part2) && !isNaN(year) && year.length === 4) {
      const part1Int = parseInt(part1, 10);
      const part2Int = parseInt(part2, 10);

      if (part1Int >= 1 && part1Int <= 12 && part2Int >= 1 && part2Int <= 31) {
        let date = new Date(`${year}-${part1}-${part2}`);
        if (!isNaN(date.getTime())) {
          const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          return formattedDate;
        }
      }

      if (part2Int >= 1 && part2Int <= 12 && part1Int >= 1 && part1Int <= 31) {
        let date = new Date(`${year}-${part2}-${part1}`);
        if (!isNaN(date.getTime())) {
          const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          return formattedDate;
        }
      }
    }
  }

  return null;
};

const createMappedObjects = (headers, data) => {
  const mapped = [];
  data.forEach((row, index) => {
    const obj = {};
    headers.forEach((header) => {
      const normalizedHeader = header.toLowerCase().trim().replace(/\s+/g, ' ');
      const mappedKey = headingMap[normalizedHeader];
      if (mappedKey) {
        obj[mappedKey] = row[header];
      }
    });
    obj._originalIndex = index;
    mapped.push(obj);
  });
  return mapped;
};

const formatValidationErrorMessage = (errors) => {
  if (errors.length === 0) return "";

  let message = "The following entries have validation errors:<br>";

  const errorsByRowIndex = {};
  errors.forEach(err => {
    if (!errorsByRowIndex[err.rowIndex]) {
      errorsByRowIndex[err.rowIndex] = [];
    }
    errorsByRowIndex[err.rowIndex].push(err);
  });

  const sortedRowIndices = Object.keys(errorsByRowIndex).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  sortedRowIndices.forEach(rowIndex => {
    const rowErrors = errorsByRowIndex[rowIndex];
    message += `<br>Row ${parseInt(rowIndex) + 1}:<br>`;
    rowErrors.forEach(err => {
      const originalColumnNameEntry = Object.entries(headingMap).find(([key, value]) => value === err.columnName);
      const displayColumnName = originalColumnNameEntry ? originalColumnNameEntry[0] : err.columnName;

      if (err.value) {
        message += `- Invalid '${displayColumnName}' value: "${err.value}". ${err.message}<br>`;
      } else {
        message += `- Invalid '${displayColumnName}' value <br>`;
      }
    });
  });

  return message;
};


const apiUrl = `http://localhost:3001/fsm/consignments/`;

const roleId = localStorage.getItem("authResponse") != null ? parseInt(JSON.parse(localStorage.getItem("authResponse")).userId) : "";
const authToken = localStorage.getItem("authResponse") != null ? JSON.parse(localStorage.getItem("authResponse")).token : "";
const uploadedBy = localStorage.getItem("authResponse") != null ? JSON.parse(localStorage.getItem("authResponse")).userName : "";
const headers = {
  'accept': '*/*',
  'Authorization': `Bearer ${authToken}`,
  'Content-Type': 'application/json'
};

const makeApiRequest = async (url, method, headers, body = null) => {
  isLoading.value = true;
  const tokenExpiration = parseInt(localStorage.getItem("tokenExpiration"));
  const authResponse = localStorage.getItem("authResponse");
  const authToken = authResponse != null ? JSON.parse(authResponse).token : "";


  if (authToken && authToken !== '' && tokenExpiration && tokenExpiration > Date.now()) {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
      });

      if (!response.ok) {
        let errorBody;
        let errorMessage = `HTTP error! Status: ${response.status}`;
        let errorDetails = null;

        try {
          errorBody = await response.text();
          if (response.headers.get("content-type")?.includes("application/json")) {
            errorDetails = JSON.parse(errorBody);
            errorMessage = errorDetails.message || errorDetails.error?.message || errorBody || `Error: ${response.status}`;
          } else {
            errorMessage = errorBody || `Error: ${response.status}`;
          }
        } catch (e) {
          console.error("Error reading or parsing API error body:", e);
          errorMessage = `HTTP error! Status: ${response.status}. Could not read error details.`;
        }

        const apiError = new Error(errorMessage);
        apiError.status = response.status;
        apiError.statusText = response.statusText;
        apiError.details = errorDetails || errorBody;

        console.error("API Request failed:", apiError);
        throw apiError;

      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data;
      } else {
        return { message: `Operation successful (Status: ${response.status})`, data: [], accepted_count: 0, rejected_count: 0 };
      }


    } catch (error) {
      console.error("API Request encountered an exception:", error);
      if (error.status !== undefined) {
        throw error;
      } else {
        const networkError = new Error(`Network or unexpected error during API call: ${error.message || 'Unknown network error'}`);
        networkError.originalError = error;
        console.error("Network Error:", networkError);
        throw networkError;
      }
    } finally {
      isLoading.value = false;
    }
  } else {
    tableData.value = [];
    messageBoxContent.value = "Your session has expired. Please log in again.";
    messageBoxTitle.value = 'Session Invalid';
    messageBoxType.value = 'error';
    showMessageBox.value = true;
    setTimeout(() => {
      router.push('/');
    }, 30000);
    return;
  }
};
const handleMessageBoxClose = () => {
  showMessageBox.value = false;

  if (messageBoxPurpose.value === 'validation') {
    if (dataToSendToApi.value && dataToSendToApi.value.length > 0) {
      if (sessionExpired.value) {
        resetAfterProcess();
      } else {
        triggerAcceptApiCall(dataToSendToApi.value);
      }

    } else {
      resetAfterProcess();
    }
  } else if (messageBoxPurpose.value === 'apiResponse') {
    apiResponseData.value = null;
    apiErrorMessage.value = null;
    resetAfterProcess();
  }

};

const triggerAcceptApiCall = async (dataArray) => {


  const acceptCountValidated = acceptedRows.value.length;
  const rejectCountValidated = rejectedRows.value.length;

  const rejectedRowsParam = rejectedRows.value.length > 0
    ? JSON.stringify(rejectedRows.value.map(index => index + 1)).replace(/,/g, ', ')
    : "[]";
  const acceptedRowsParam = acceptedRows.value.length > 0
    ? JSON.stringify(acceptedRows.value.map(index => index + 1)).replace(/,/g, ', ')
    : "[]";

  const fileType = file_id === 1 ? "Shipment letter" : file_id === 2 ? "Delivered letter" : file_id === 3 ? "Returned letter" : "Invalid file type!";

  const params = new URLSearchParams({
    fileName: fileName.value,
    userId: roleId,
    recordCount: total_record,
    accept_record_count: acceptCountValidated,
    reject_record_count: rejectCountValidated,
    uploadedBy: uploadedBy,
    fileType: fileType
  });

  if (rejectedRows.value.length > 0) { params.append('rejectedRows', rejectedRowsParam); }
  else {
    params.append('rejectedRows', '[]');
  }
  if (acceptedRows.value.length > 0) {
    params.append('acceptedRows', acceptedRowsParam);
  } else {
    params.append('acceptedRows', '[]');

  }


  const acceptUrl = `${apiUrl}accept?${params.toString()}`;


  const authToken = localStorage.getItem("authResponse") ? JSON.parse(localStorage.getItem("authResponse"))?.token : "";
  const authResponse = localStorage.getItem("authResponse") ? localStorage.getItem("authResponse") : "";
  const tokenExpiration = parseInt(localStorage.getItem("tokenExpiration"));
  if (tokenExpiration >= Date.now() && tokenExpiration !== 0 && authToken !== "" && authResponse !== "") {
    try {
      const data = await makeApiRequest(acceptUrl, "POST", headers, dataArray);

      apiResponseData.value = data;
      apiErrorMessage.value = null;

      messageBoxTitle.value = "Upload Result";
      messageBoxType.value = "success";

      const apiMessage = data.message || 'Process completed successfully.';
      const finalAcceptedCount = data.data !== undefined ? data.data.length : acceptCountValidated;
      const finalRejectedCount = data.data !== undefined ? (total_record - finalAcceptedCount) : rejectCountValidated;


      let successMessage = `${apiMessage}<br>`;

      if (validationErrors.value.length > 0) {
        successMessage += `rejected: ${finalRejectedCount} records.<br>`;
        successMessage += `accepted: ${finalAcceptedCount} records.<br>`;
        successMessage += `Total records in file: ${total_record}.`;
      } else {
        successMessage += `accepted: ${finalAcceptedCount} records.<br>`;
        successMessage += `rejected: ${finalRejectedCount} records.<br>`;
        successMessage += `Total records in file: ${total_record}.`;
      }


      messageBoxContent.value = successMessage;

      messageBoxPurpose.value = 'apiResponse';
      showMessageBox.value = true;



    } catch (error) {
      apiResponseData.value = null;
      if (error && error.status === 401) {
        messageBoxTitle.value = "Unauthorized";
        messageBoxType.value = "error";
        apiErrorMessage.value = "Unauthorized: Your session may have expired or you lack permission. Please log in again.";
      } else if (error && error.status) {
        messageBoxType.value = "error";
        messageBoxTitle.value = "Acception Failed";
        apiErrorMessage.value = `Failed to generate the report. Server responded with status ${error.status}: ${error.statusText}.`;
      } else if (error instanceof TypeError) {
        messageBoxType.value = "error";
        messageBoxTitle.value = "Acception Failed";
        apiErrorMessage.value = `Network Error: Could not reach the report server. Please check your connection and the server address. (${error.message})`;
      }
      else {
        messageBoxType.value = "error";
        apiErrorMessage.value = "Failed to generate the report due to an unexpected error.";
      }
      apiErrorMessage.value = error.message || 'An unknown error occurred during rejection.';

      messageBoxTitle.value = "Acception Failed";
      messageBoxType.value = "error";
      messageBoxContent.value = apiErrorMessage.value;

      messageBoxPurpose.value = 'apiResponse';
      showMessageBox.value = true;
    }
    finally {
      dataToSendToApi.value = [];
      validationErrors.value = [];
    }
  } else {
    tableData.value = [];
    messageBoxContent.value = "Your session has expired. Please log in again.";
    messageBoxTitle.value = 'Session Invalid';
    messageBoxType.value = 'error';
    showMessageBox.value = true;
    sessionExpired.value = true;
    setTimeout(() => {
      router.push('/');
    }, 3000); return
  }
};


const resetAfterProcess = () => {
  tableData.value = [];
  columns.value = [];
  fileName.value = '';
  mappedObjects.value = [];
  rejectedRows.value = [];
  acceptedRows.value = [];
  total_record = 0;
  file_id = 0;
  errorMessage.value = null;
  dataToSendToApi.value = [];
  validationErrors.value = [];
  apiResponseData.value = null;
  apiErrorMessage.value = null;
};

const rejectAllData = async () => {
  errorMessage.value = null;
  rejectedRows.value = [];
  acceptedRows.value = [];
  showMessageBox.value = false;
  messageBoxPurpose.value = null;
  apiResponseData.value = null;
  apiErrorMessage.value = null;
  dataToSendToApi.value = [];
  validationErrors.value = [];

  if (mappedObjects.value.length === 0 || !fileName.value) {
    messageBoxTitle.value = "Info";
    messageBoxType.value = "info";
    messageBoxContent.value = "No data or file selected to reject. Please upload a valid CSV file with data.";
    messageBoxPurpose.value = 'apiResponse';
    showMessageBox.value = true;
    return;
  }

  if (file_id === 0) {
    messageBoxTitle.value = "Warning";
    messageBoxType.value = "warning";
    messageBoxContent.value = `Cannot reject invalid file type. Please upload a file with 7, 8, or 16 columns.`;
    messageBoxPurpose.value = 'apiResponse';
    showMessageBox.value = true;
    resetAfterProcess();
    return;
  }

  isLoading.value = true;

  acceptedRows.value = [];
  rejectedRows.value = [];
  for (let i = 0; i < total_record; i++) {
    rejectedRows.value.push(i);
  }

  const acceptCountToSend = 0;
  const rejectCountToSend = total_record;

  const rejectedRowsParam = rejectedRows.value.length > 0
    ? JSON.stringify(rejectedRows.value.map(index => index + 1)).replace(/,/g, ', ')
    : "[]";


  const fileType = file_id === 1 ? "Shipment letter" : file_id === 2 ? "Delivered letter" : file_id === 3 ? "Returned letter" : "Invalid file type!";

  const params = new URLSearchParams({
    fileName: fileName.value,
    userId: roleId,
    recordCount: total_record,
    accept_record_count: acceptCountToSend,
    reject_record_count: rejectCountToSend,
    uploadedBy: uploadedBy,
    fileType: fileType
  });

  if (rejectedRows.value.length > 0) params.append('rejectedRows', rejectedRowsParam);
  params.append('acceptedRows', '[]');
  const rejectUrl = `${apiUrl}reject?${params.toString()}`;

  const authToken = localStorage.getItem("authResponse") ? JSON.parse(localStorage.getItem("authResponse"))?.token : "";
  const authResponse = localStorage.getItem("authResponse") ? localStorage.getItem("authResponse") : "";
  const tokenExpiration = parseInt(localStorage.getItem("tokenExpiration"));
  if (tokenExpiration >= Date.now() && tokenExpiration !== 0 && authToken !== "" && authResponse !== "") {
    try {
      const data = await makeApiRequest(rejectUrl, "POST", headers);

      apiResponseData.value = data;
      apiErrorMessage.value = null;

      messageBoxTitle.value = "Rejection Result";
      messageBoxType.value = "success";
      const apiMessage = data.message || `Successfully rejected ${total_record} records.`;
      messageBoxContent.value = `${apiMessage}<br>Total rejected: ${total_record}<br>Total accepted: 0<br>Total records in file: ${total_record}.`;


      messageBoxPurpose.value = 'apiResponse';
      showMessageBox.value = true;


    } catch (error) {
      apiResponseData.value = null;
      if (error && error.status === 401) {
        messageBoxTitle.value = "Unauthorized";
        messageBoxType.value = "error";
        apiErrorMessage.value = "Unauthorized: Your session may have expired or you lack permission. Please log in again.";
      } else if (error && error.status) {
        messageBoxType.value = "error";
        messageBoxTitle.value = "Rejection Failed";
        apiErrorMessage.value = `Failed to generate the report. Server responded with status ${error.status}: ${error.statusText}.`;
      } else if (error instanceof TypeError) {
        messageBoxType.value = "error";
        messageBoxTitle.value = "Rejection Failed";
        apiErrorMessage.value = `Network Error: Could not reach the report server. Please check your connection and the server address. (${error.message})`;
      }
      else {
        messageBoxType.value = "error";
        apiErrorMessage.value = "Failed to generate the report due to an unexpected error.";
      }
      apiErrorMessage.value = error.message || 'An unknown error occurred during rejection.';

      messageBoxTitle.value = "Rejection Failed";
      messageBoxType.value = "error";
      messageBoxContent.value = apiErrorMessage.value;

      messageBoxPurpose.value = 'apiResponse';
      showMessageBox.value = true;
    }
    finally {
      isLoading.value = false;
    }
  } else {
    tableData.value = [];
    messageBoxContent.value = "Your session has expired. Please log in again.";
    messageBoxTitle.value = 'Session Invalid';
    messageBoxType.value = 'error';
    showMessageBox.value = true;
    sessionExpired.value = true;
    setTimeout(() => {
      router.push('/');
    }, 3000);
    return;
  }
};

const checkColumnValidation = (columnKey, originalRowValue, currentRowIsValid, currentValidationErrors, i) => {
  let columnCheckResult = currentRowIsValid;

  if (columnKey) {
    const valueAsString = String(originalRowValue || '').trim();

    if (valueAsString === '') {
      columnCheckResult = false;
      currentValidationErrors.push({
        rowIndex: i,
        columnName: columnKey,
        value: originalRowValue,
        message: `Value for '${columnKey}' cannot be empty.`
      });
    } else {
      const maxLengths = {
        [headingMap["account number"]]: 30,
        [headingMap["receiver's cnic"]]: 15,
        [headingMap["mobile number"]]: 15,
        [headingMap["email"]]: 255,
        [headingMap["card number"]]: 19,
        [headingMap["shipping bill"]]: 50,
        [headingMap["address"]]: 255,
        [headingMap["city"]]: 50,
        [headingMap["account title"]]: 100,
        [headingMap["courier"]]: 50,
        [headingMap["letter type"]]: 50,
        [headingMap["type of card"]]: 50,
        [headingMap["return reason"]]: 255,
        [headingMap["branch code"]]: 20,
        [headingMap["receiver name b"]]: 100,
        [headingMap["status"]]: 50,
        [headingMap["receiver name d"]]: 100,
        [headingMap["relationship"]]: 50,
        [headingMap["card status"]]: 50,
        [headingMap["customer cnic number"]]: 15,
      };

      const maxLength = maxLengths[columnKey];

      if (columnKey === headingMap["consignment number"]) {
        if (valueAsString.includes('E+') || valueAsString.includes('e+')) {
          columnCheckResult = false;
          currentValidationErrors.push({
            rowIndex: i,
            columnName: columnKey,
            value: originalRowValue,
            message: `'${columnKey}' cannot be in scientific notation. Please provide a valid numeric ID.`
          });
        } else if (!/^\d+$/.test(valueAsString)) {
          columnCheckResult = false;
          currentValidationErrors.push({
            rowIndex: i,
            columnName: columnKey,
            value: originalRowValue,
            message: `'${columnKey}' must contain only digits.`
          });
        }
      } else if (columnKey === headingMap["receiver's cnic"] || columnKey === headingMap["customer cnic number"]) {
        // Updated regex for CNIC: XXXXX-XXXXXXX-X (5 digits, 7 digits, 1 digit, with hyphens)
        if (!/^\d{5}-\d{7}-\d{1}$/.test(valueAsString)) {
          columnCheckResult = false;
          currentValidationErrors.push({
            rowIndex: i,
            columnName: columnKey,
            value: originalRowValue,
            message: `'${columnKey}' must be in the format XXXXX-XXXXXXX-X (e.g., 12345-6789012-3).`
          });
        }
      } else { // This else block now applies to all other columns except consignment number and CNIC
        if (maxLength !== undefined && valueAsString.length > maxLength) {
          columnCheckResult = false;
          currentValidationErrors.push({
            rowIndex: i,
            columnName: columnKey,
            value: originalRowValue,
            message: `'${columnKey}' length (${valueAsString.length}) exceeds the maximum allowed length of ${maxLength}.`
          });
        }
      }
    }
  }
  return columnCheckResult;
};
const acceptAllData = async () => {
  errorMessage.value = null;
  rejectedRows.value = [];
  acceptedRows.value = [];
  showMessageBox.value = false;
  messageBoxPurpose.value = null;
  apiResponseData.value = null;
  apiErrorMessage.value = null;
  dataToSendToApi.value = [];
  validationErrors.value = [];

  if (mappedObjects.value.length === 0 || !fileName.value) {
    messageBoxTitle.value = "Info";
    messageBoxType.value = "info";
    messageBoxContent.value = "No data or file selected to accept. Please upload a valid CSV file with data.";
    messageBoxPurpose.value = 'apiResponse';
    showMessageBox.value = true;
    return;
  }

  if (file_id === 0) {
    messageBoxTitle.value = "Warning";
    messageBoxType.value = "warning";
    messageBoxContent.value = `Cannot process invalid file type. Please upload a file with 7, 8, or 16 columns.`;
    messageBoxPurpose.value = 'apiResponse';
    resetAfterProcess();
    return;
  }

  isLoading.value = true;
  const recordsToProcess = mappedObjects.value;
  const currentValidationErrors = [];
  const currentAcceptedDataForApi = [];
  const currentRejectedRowsIndices = [];
  const currentAcceptedRowsIndices = [];

  for (let i = 0; i < recordsToProcess.length; i++) {
    const originalRow = recordsToProcess[i];
    const formattedObj = { ...originalRow };
    let rowIsValid = true; // Initialize for each row

    const consignmentIdKey = headingMap["consignment number"];
    const accountnumberKey = headingMap["account number"];
    const accounttitleKey = headingMap["account title"];
    const receiverscnicKey = headingMap["receiver's cnic"];
    const courierKey = headingMap["courier"];
    const shippingBillKey = headingMap["sb/ cb"];
    const addressKey = headingMap["address"];
    const cityKey = headingMap["city"];
    const emailKey = headingMap["email"];
    const mobilenumberKey = headingMap["mobile number"];
    const letterTypeKey = headingMap["letter type"];
    const cardnumberKey = headingMap["card number"];
    const typeofcardKey = headingMap["type of card"];
    const returnreasonKey = headingMap["return reason"];
    const branchcodeKey = headingMap["branch code"];
    const receivernamebKey = headingMap["receiver name b"];
    const statusKey = headingMap["status"];
    const receivernamedKey = headingMap["receiver name d"];
    const relationshipKey = headingMap["relationship"];
    const cardstatusKey = headingMap["card status"];
    const customercnicnumberKey = headingMap["customer cnic number"];

    if (consignmentIdKey) {
      const rawConsignmentValue = originalRow[consignmentIdKey];
      if (rawConsignmentValue === null || rawConsignmentValue === undefined || rawConsignmentValue.toString().trim() === '' || isNaN(rawConsignmentValue)) {
        rowIsValid = false;
        currentValidationErrors.push({
          rowIndex: i,
          columnName: consignmentIdKey,
          value: rawConsignmentValue,
          message: "Invalid consignment ID. Must be a number."
        });
      }
      else {
        const valueAsString = String(originalRow[consignmentIdKey]);
        if (consignmentIdKey === "consignment_id" && valueAsString.length > 13) {
          rowIsValid = false;
          currentValidationErrors.push({
            rowIndex: i,
            columnName: consignmentIdKey,
            value: originalRow[consignmentIdKey],
            message: `consignment number length exceeded.`
          });
        }
      }
    }

    let dateFieldsToValidate = [];
    let optionalDateFields = [];

    if (file_id === 1) {
      rowIsValid = checkColumnValidation(accountnumberKey, originalRow[accountnumberKey], rowIsValid, currentValidationErrors, i);
      rowIsValid = checkColumnValidation(accounttitleKey, originalRow[accounttitleKey], rowIsValid, currentValidationErrors, i);
      rowIsValid = checkColumnValidation(customercnicnumberKey, originalRow[customercnicnumberKey], rowIsValid, currentValidationErrors, i);
      rowIsValid = checkColumnValidation(shippingBillKey, originalRow[shippingBillKey], rowIsValid, currentValidationErrors, i);
      rowIsValid = checkColumnValidation(courierKey, originalRow[courierKey], rowIsValid, currentValidationErrors, i);
      rowIsValid = checkColumnValidation(addressKey, originalRow[addressKey], rowIsValid, currentValidationErrors, i);
      rowIsValid = checkColumnValidation(cityKey, originalRow[cityKey], rowIsValid, currentValidationErrors, i);
      rowIsValid = checkColumnValidation(emailKey, originalRow[emailKey], rowIsValid, currentValidationErrors, i);
      rowIsValid = checkColumnValidation(mobilenumberKey, originalRow[mobilenumberKey], rowIsValid, currentValidationErrors, i);
      rowIsValid = checkColumnValidation(letterTypeKey, originalRow[letterTypeKey], rowIsValid, currentValidationErrors, i);
      rowIsValid = checkColumnValidation(cardnumberKey, originalRow[cardnumberKey], rowIsValid, currentValidationErrors, i);
      rowIsValid = checkColumnValidation(typeofcardKey, originalRow[typeofcardKey], rowIsValid, currentValidationErrors, i);
      rowIsValid = checkColumnValidation(statusKey, originalRow[statusKey], rowIsValid, currentValidationErrors, i);

      dateFieldsToValidate = [
        headingMap["booking date"],
        headingMap["card creation date"]
      ].filter(key => key !== undefined);
    } else if (file_id === 2) {
      rowIsValid = checkColumnValidation(courierKey, originalRow[courierKey], rowIsValid, currentValidationErrors, i);
      rowIsValid = checkColumnValidation(statusKey, originalRow[statusKey], rowIsValid, currentValidationErrors, i);
      rowIsValid = checkColumnValidation(receivernamedKey, originalRow[receivernamedKey], rowIsValid, currentValidationErrors, i);
      rowIsValid = checkColumnValidation(cardstatusKey, originalRow[cardstatusKey], rowIsValid, currentValidationErrors, i);
      rowIsValid = checkColumnValidation(relationshipKey, originalRow[relationshipKey], rowIsValid, currentValidationErrors, i);

      dateFieldsToValidate = [
        headingMap["delivery date"]
      ].filter(key => key !== undefined);
    } else if (file_id === 3) {
      rowIsValid = checkColumnValidation(returnreasonKey, originalRow[returnreasonKey], rowIsValid, currentValidationErrors, i);
      rowIsValid = checkColumnValidation(branchcodeKey, originalRow[branchcodeKey], rowIsValid, currentValidationErrors, i);
      rowIsValid = checkColumnValidation(receivernamebKey, originalRow[receivernamebKey], rowIsValid, currentValidationErrors, i);

      dateFieldsToValidate = [
        headingMap["date of return shipment received at branch"],
        headingMap["return date"],
      ].filter(key => key !== undefined);
    }

    dateFieldsToValidate.forEach(dateKey => {
      if (dateKey) {
        const rawDate = originalRow[dateKey];
        const formattedDate = formatDate(rawDate);

        if (formattedDate === null && !optionalDateFields.includes(dateKey)) {
          rowIsValid = false;
          currentValidationErrors.push({
            rowIndex: i,
            columnName: dateKey,
            value: rawDate,
            message: "Invalid date format"
          });
          formattedObj[dateKey] = null;
        } else {
          formattedObj[dateKey] = formattedDate;
        }
      }
    });

    if (rowIsValid) {
      currentAcceptedDataForApi.push(formattedObj);
      currentAcceptedRowsIndices.push(i);
    } else {
      currentRejectedRowsIndices.push(i);
    }
  }

  validationErrors.value = currentValidationErrors;
  rejectedRows.value = currentRejectedRowsIndices;
  acceptedRows.value = currentAcceptedRowsIndices;
  dataToSendToApi.value = currentAcceptedDataForApi;

  isLoading.value = false;

  if (validationErrors.value.length > 0) {
    messageBoxTitle.value = "Validation Errors Found";
    messageBoxType.value = "warning";
    messageBoxContent.value = formatValidationErrorMessage(validationErrors.value);
    messageBoxPurpose.value = 'validation';
    showMessageBox.value = true;

  } else {
    triggerAcceptApiCall(dataToSendToApi.value);
  }
};

</script>

<style scoped>
.cancel-btn:hover {
  color: #606266;
}

.balh-btn.back-btn:hover:not(.disabled) {
  background-color: #afb9c0;
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.upload-button-container {
  display: flex;
  justify-content: space-between;
}

.generate-button {
  border-color: rgb(0, 155, 131);
  background-color: rgb(0, 155, 131);
  font-size: 1em;
  color: white;
}

.generate-button:hover:not(.disabled) {
  background-color: rgb(0, 155, 131);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.buttons-container {
  display: flex;
}

.p-datatable .p-datatable-tbody>tr>td {
  border: 1px solid #a9a9a9 !important;
  border-width: 0 0 1px 1px !important;
}

.p-datatable {
  padding: 8px;
  background-color: rgb(162, 200, 168);
  border: 2px solid white;
  border-radius: 5px;
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
  max-height: 465px;
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
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

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

.upload-empty-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.upload-icon {
  width: 50px;
  height: 50px;
  fill: white;
  margin-bottom: 10px;
}

#file_input {
  background-color: rgb(0, 155, 131);
  color: black;
  border: 0.5px solid rgb(0, 155, 131);
  font-size: 1em;
}

.back-button-container {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.balh-btn.back-btn {
  background-color: #d1d6da;
  color: var(--balh-white);
  max-width: 120px;
  max-height: 33px;
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
  box-shadow: var(--balh-hover-shadow);
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


.main-container {
  height: 85vh;
  background-color: var(--balh-white);
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.upload-page-container {
  font-family: 'Arial', sans-serif;
  min-height: 80vh;
  padding: 1vh 10vh 0vh 10vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.heading {
  text-align: center;
  color: black;
  width: 100%;
}

.heading h1 {
  font-size: 1.8em;
  font-weight: bold;
  margin: 0;
  color: #d1d6da;
}


/* Upload Section */
.upload-demo {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  /* Allow items to wrap */
  gap: 15px;
  /* Increased gap */
  width: 100%;
  justify-content: flex-start;
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

.upload-container .el-upload {
  margin-top: 0;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.el-upload .el-button[type="success"] {
  background-color: rgb(0, 155, 131);
  border-color: rgb(0, 155, 131);
  color: white;
  font-weight: bold;
  border-radius: 4px;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
  --el-button-hover-border-color: #007a3b;
  --el-button-hover-bg-color: #007a3b;
  --el-button-active-border-color: #007a3b;
  --el-button-active-bg-color: #007a3b;
  padding: 10px 20px;
  height: auto;
  font-size: 1em;
}

.custom-button {
  background-color: rgb(0, 155, 131);
  color: black;
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  font-size: 1em;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
  max-width: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.custom-button:hover:not(.disabled) {
  background-color: rgb(0, 155, 131);
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

.file-name {
  margin-top: 5px;
  font-weight: bold;
  color: #d1d6da;
  text-align: left;
  width: 100%;
  word-break: break-all;
  font-size: 1em;
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

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  width: 100%;
}

.action-buttons .el-button {
  font-weight: bold;
  border-width: 1px;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 1em;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
  min-width: 120px;
  /* Give buttons a minimum width */
  text-align: center;
}

.action-buttons .el-button[type="primary"] {
  background-color: #d1d6da;
  border-color: rgb(0, 155, 131);
  color: white;
  --el-button-hover-border-color: rgb(0, 155, 131);
  --el-button-hover-bg-color: rgb(0, 155, 131);
  --el-button-active-border-color: rgb(0, 155, 131);
  --el-button-active-bg-color: rgb(0, 155, 131);
}

.empty-state {
  margin-top: 20px;
  /* Increased margin */
  text-align: center;
  color: #666;
  width: 94vw;
  font-size: 1em;
  padding: 20px;
  /* Added padding */
  border: 1px dashed #ccc;
  border-radius: 4px;
  background-color: #fcfcfc;
}

/* Message Box Responsiveness (Keeping styles here as requested) */

button {
  cursor: pointer;
}

@media (min-width: 768px) {

  .heading h1 {
    font-size: 2.2em;
  }

  .upload-container {
    padding: 30px;
  }

  .upload-demo {
    gap: 20px;
    /* More gap */
    flex-wrap: nowrap;
    /* Prevent wrapping */
  }

  .upload-container .el-upload {
    gap: 20px;
    /* More gap */
    flex-wrap: nowrap;
  }

  .el-upload .el-button[type="success"] {
    padding: 12px 25px;
    /* Larger button */
    font-size: 1.1em;
  }

  .upload-tip {
    font-size: 1em;
    /* Standard font size */
    margin-top: 0;
    /* Align better */
  }

  .file-name {
    font-size: 1.1em;
  }

  .error-message {
    margin-top: 20px;
    padding: 12px;
    font-size: 1em;
  }

  .action-buttons {
    margin-top: 30px !important;
    justify-content: flex-start;
    /* Align left */
    flex-wrap: nowrap;
    /* Prevent wrapping */
    gap: 20px;
    /* More gap */
  }

  .action-buttons .el-button {
    padding: 12px 25px;
    /* Larger buttons */
    font-size: 1.1em;
  }


  .empty-state {
    margin-top: 30px;
    font-size: 1.1em;
    padding: 30px;
  }

}


.accept-btn {
  background-color: #d1d6da;
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  color: black;
}

.accept-btn:hover {
  background-color: #d1d6da;
  color: black;
}

.reject-btn {
  background-color: #d1d6da;
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  color: black;
}

.reject-btn:hover {
  background-color: #d1d6da;
  color: black;
}

.upload-demo {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  justify-content: flex-start;
}

.heading {
  text-align: center;
  margin-top: 10px;
  color: #29f98e;
}

.heading h1 {
  font-size: 1.8em;
  /* Slightly smaller font size for responsiveness */
  font-weight: bold;
  margin: 0;
}

.upload-container {
  margin: 0.5vw 2vw;
  height: 65vh;
  /* Adjusted margin with vw */
  padding: 15px;
  /* Reduced padding */
  /* background-color: #fff; */
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: left;
  /* max-height: fit-content; */
  width: 100%;
  /* Use percentage for width */
  box-sizing: border-box;
  /* Include padding in element's total width */
}

.upload-container .el-upload {
  margin-top: 0;
  margin-bottom: 15px;
  /* Adjusted margin */
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.el-upload .el-button[type="success"] {
  background-color: rgb(0, 155, 131);
  border-color: rgb(0, 155, 131);
  color: white;
  font-weight: bold;
  border-radius: 4px;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
  --el-button-hover-border-color: #007a3b;
  --el-button-hover-bg-color: #007a3b;
  --el-button-active-border-color: #007a3b;
  --el-button-active-bg-color: #007a3b;
  padding: 8px 15px;
  height: auto;
}

.upload-tip {
  color: #e9e7e7;
  margin-top: 5px;
  /* Adjusted margin */
  font-size: 0.8em;
  /* Slightly smaller font size */
  text-align: left;
  width: 100%;
}



.error-message {
  margin-top: 10px;
  /* Adjusted margin */
  padding: 8px;
  /* Adjusted padding */
  background-color: #fee6e6;
  color: #f56c6c;
  border: 1px solid #f56c6c;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
  font-weight: bold;
  text-align: center;
  word-break: break-word;
}

.empty-state {
  background-color: rgba(0, 0, 0, 0.15);
  margin-top: 15px;
  text-align: center;
  color: white;
  width: 100%;
  font-size: 1em;
  height: 60vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

button {
  cursor: pointer;
}

/* Media Queries for larger screens */
@media (min-width: 768px) {
  .heading h1 {
    font-size: 2em;
  }

  .upload-container {
    margin: 0vw 5vw;
    padding: 20px;
    /* width: auto;
      max-width: none; */
  }

  .upload-container .el-upload {
    margin-bottom: 20px;
    flex-wrap: nowrap;
  }

  .upload-tip {
    margin-top: 0;
    font-size: 0.9em;
    width: auto;
  }

  .error-message {
    margin-top: 15px;
    padding: 10px;
  }


  .empty-state {
    margin-top: 20px;
    font-size: 1em;
  }

}
</style>