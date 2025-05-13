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
      <el-upload ref="uploadRef" class="upload-demo" action="" :auto-upload="false" :show-file-list="false"
        accept=".csv" @change="handleFileChange">
        <template #trigger>
          <el-button id="file_input">Select File</el-button>
        </template>
        <template #tip>
          <div class="upload-tip">csv files with a size less than 500MB</div>
        </template>
      </el-upload>
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
          <div class="back-button-container">
            <button @click="goBack" class="balh-btn back-btn">
              Back
            </button>
          </div>
        </div>

      </div>
      <div
      v-else-if="!fileName && !errorMessage"
      class="empty-state"
      @click="triggerFileUpload"
      @dragover.prevent="onDragOver"
      @dragenter.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      :class="{ 'drag-over': isDragging }"
    >
      <div class="upload-empty-container">
        <div style="font-size: 90px; padding-right: 15px;">
          <el-icon class="el-icon--upload" viewBox="0 0 24 24"
            ><upload-filled
          /></el-icon>
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

      <MessageBox :visible="showMessageBox" :title="messageBoxTitle" :content="messageBoxContent" :type="messageBoxType"
        @close="handleMessageBoxClose" />

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Papa from 'papaparse';
import MessageBox from './MessageBox.vue';
import { useRouter } from 'vue-router';
import { UploadFilled } from '@element-plus/icons-vue'
import { Loading } from '@element-plus/icons-vue' // Import Loading icon


const router = useRouter();

const errorMessage = ref(null); // For initial file/parsing errors
const multipleTableRef = ref(null);
const multipleSelection = ref([]);
// Initialize tableData as empty array, the placeholder message is handled in template now
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
const isDragging = ref(false); // Corrected: Should be ref(false)


let file_id = 0;
let total_record;

const fileName = ref('');
const columns = ref([]);
const uploadRef = ref(null);
const mappedObjects = ref([]);

const onDragOver = (event) => {
  event.preventDefault(); // Prevent default browser behavior
  isDragging.value = true;
  console.log('Drag Over Event Triggered', event.type); // Add this log
};

const onDragLeave = (event) => {
  event.preventDefault(); // Prevent default browser behavior
  isDragging.value = false;
  console.log('Drag Leave Event Triggered', event.type); // Add this log
};

const onDrop = (event) => {
  event.preventDefault(); // Prevent default browser behavior
  isDragging.value = false;
  console.log('Drop Event Triggered', event.type); // Add this log
  const droppedFiles = event.dataTransfer.files;
  console.log('Dropped Files:', droppedFiles); // Log the files list
  if (droppedFiles.length > 0) {
    console.log('Processing dropped files...'); // Log before processing
    // Call a function to process the dropped files
    processFiles(droppedFiles); // Call the new processFiles function
  }
  else{
    console.log('No files dropped.'); // Log if fileList is empty
  }
};
const headingMap = {
  "consignment number": "consignment_id",
  "courier": "courier",
  "booking date": "booking_date",
  "account number": "account_no",
  "account title": "account_title",
  "receiverâ€™s cnic": "receiver_cnic", // Note: This header has a non-standard char
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

// Modified to be used by both el-upload and drag-and-drop
const processFiles = (files) => {
  // This function processes a FileList (from drag/drop) or a single File (from el-upload)
  // Need to normalize input to always be an array-like list of File objects
  const fileList = files instanceof FileList ? files : [files];

  if (fileList.length === 0) {
    errorMessage.value = 'No file selected or dropped.';
    return;
  }

  // Process the first file in the list (assuming single file upload/drop)
  const file = fileList[0];

  // Basic file type and size validation
  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    errorMessage.value = 'Invalid file type. Please upload a CSV file.';
    // Reset other state variables
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

  if (file.size > 500 * 1024 * 1024) { // 500MB
    errorMessage.value = 'File size exceeds the limit of 500MB.';
     // Reset other state variables
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

   // Clear previous state
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
            console.log("CSV file has headers but they are all empty or invalid.");
            errorMessage.value = "CSV file has invalid headers. Please ensure headers are correct.";
            tableData.value = [];
            columns.value = [];
            mappedObjects.value = [];
            total_record = 0;
            //fileName.value = ''; // Keep file name to show the file was selected but invalid
            return;
          }

          columns.value = validCsvHeaders.map((key) => ({
            prop: key,
            label: key,
          }));
          tableData.value = results.data;
          mappedObjects.value = createMappedObjects(validCsvHeaders, results.data);
          total_record = results.data.length;
          console.log("Total records in CSV:", total_record);
          console.log("Mapped Objects: ", mappedObjects.value);

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
            console.log("Detected File Type: Invalid (unexpected number of columns: " + validCsvHeaders.length + ")");
            errorMessage.value = `Invalid file format: Expected 7, 8, or 16 columns, but found ${validCsvHeaders.length}. Please upload a valid template.`;
            tableData.value = [];
            columns.value = [];
            mappedObjects.value = [];
            total_record = 0;
             // Keep file name to show the file was selected but invalid
          }

        } else {
          columns.value = [];
          tableData.value = [];
          mappedObjects.value = [];
          total_record = 0;
          console.log("CSV file is empty or contains no data rows.");
          errorMessage.value = "CSV file is empty or contains no data rows.";
           // Keep file name to show the file was selected but empty
        }
      },
      error: (error) => {
        console.log('CSV parsing error:', error);
        errorMessage.value = `CSV parsing error: ${error.message}`;
        mappedObjects.value = [];
        tableData.value = [];
        columns.value = [];
        total_record = 0;
         // Keep file name to show the file was selected but errored
      },
    });
  };

  reader.onerror = (error) => {
    console.log('File reading error:', error);
    errorMessage.value = `File reading error: ${error}`;
    mappedObjects.value = [];
    tableData.value = [];
    columns.value = [];
    total_record = 0;
     // Keep file name to show the file was selected but errored
  };

  reader.readAsText(file);
};


// Modify handleFileChange to use the new processFiles function
const handleFileChange = (uploadFile) => {
    // el-upload gives an object with a `raw` property containing the File object
    if (uploadFile && uploadFile.raw) {
      processFiles(uploadFile.raw);
    } else {
      errorMessage.value = 'File is not properly loaded from upload input.';
       // Reset other state variables
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
  // This finds the hidden file input created by el-upload and clicks it.
  // It does NOT handle the drag/drop area click directly anymore,
  // as the drag/drop area has its own @click handler that calls triggerFileUpload.
  if (uploadRef.value) {
    // Ensure uploadRef.value exists and has the correct structure
    const fileInput = uploadRef.value.$el?.querySelector('input[type="file"]') || uploadRef.value.$refs.input?.$el?.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.click();
    } else {
      console.error("File input element not found on uploadRef. Cannot trigger file upload.");
      // Fallback attempt (less reliable as depends on DOM structure)
      const fallbackInput = document.querySelector('.upload-demo input[type="file"]');
       if (fallbackInput) {
         fallbackInput.click();
       } else {
         console.error("Fallback file input element also not found.");
         errorMessage.value = "Unable to open file selection dialog.";
       }
    }
  } else {
      console.error("uploadRef is not available.");
      errorMessage.value = "Upload component not initialized correctly.";
  }
};


const formatDate = (dateString) => {
  console.log("Input dateString:", dateString);
  if (!dateString) {
    console.log("Output dateString (empty):", "");
    return null; // Return null for empty or null input
  }

  // Add trim() to handle potential whitespace
  const trimmedDateString = dateString.trim();
  console.log("Trimmed dateString:", trimmedDateString);

  // Check for empty string after trimming
  if (trimmedDateString === '') {
      console.log("Output dateString (trimmed empty):", null);
      return null; // Return null for empty string input
  }


  // Attempt dd-MM-yyyy
  const parts_dmy = trimmedDateString.split('-');
  if (parts_dmy.length === 3) {
    const day = parts_dmy[0];
    const month = parts_dmy[1];
    const year = parts_dmy[2];
    // Check if parts are valid numbers and year is likely a year
    if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year.length === 4) {
      // Basic check for plausible month/day ranges (optional but helps filter garbage)
      const dayInt = parseInt(day, 10);
      const monthInt = parseInt(month, 10);
      if (dayInt >= 1 && dayInt <= 31 && monthInt >= 1 && monthInt <= 12) {
        const formattedDate = `${year}-${month}-${day}`; // Format toyyyy-MM-dd
        console.log("Output dateString (dd-MM-yyyy parsed):", formattedDate);
        return formattedDate;
      }
    }
  }

  // Attempt yyyy-MM-dd (standard format Date can often parse directly)
  try {
    const date = new Date(trimmedDateString);
    // Check if Date object is valid and represents the input string reasonably
    // This is a basic check; for strict validation, regex or a date library is better.
    // Simple check: Does parsing and reformatting give the same year?
     // Also check if the date components match the input components to avoid false positives
    if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        // Basic check to see if the parsed date components match the input components (for yyyy-MM-dd input)
        // This helps differentiate yyyy-MM-dd from other formats that Date might incorrectly parse
        const parts_ymd_check = trimmedDateString.split('-');
        if (parts_ymd_check.length === 3 &&
            parseInt(parts_ymd_check[0], 10) === year &&
            parseInt(parts_ymd_check[1], 10) === parseInt(month, 10) &&
            parseInt(parts_ymd_check[2], 10) === parseInt(day, 10)) {
             console.log("Output dateString (yyyy-MM-dd parsed by Date object):", formattedDate);
             return formattedDate;
        }
    }
  } catch (error) {
    console.log("Error parsing date with Date object:", trimmedDateString, error);
  }

  // Attempt MM/dd/yyyy or dd/MM/yyyy (common variations)
  const parts_slash = trimmedDateString.split('/');
  if (parts_slash.length === 3) {
    let part1 = parts_slash[0];
    let part2 = parts_slash[1];
    let year = parts_slash[2];

    if (!isNaN(part1) && !isNaN(part2) && !isNaN(year) && year.length === 4) {
      const part1Int = parseInt(part1, 10);
      const part2Int = parseInt(part2, 10);

      // Try MM/dd/yyyy first (Month is typically <= 12, Day <= 31)
      if (part1Int >= 1 && part1Int <= 12 && part2Int >= 1 && part2Int <= 31) {
        let date = new Date(`${year}-${part1}-${part2}`); //yyyy-MM-dd format for Date constructor
        if (!isNaN(date.getTime())) {
          const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          console.log("Output dateString (MM/dd/yyyy parsed):", formattedDate);
          return formattedDate;
        }
      }

      // If MM/dd/yyyy failed or was invalid, try dd/MM/yyyy
      // Note: This might overlap with MM/dd/yyyy if day and month are both <= 12.
      // A more robust solution would check for valid dates (e.g., Feb 30th is invalid).
      // For now, this attempts dd/MM/yyyy if MM/dd/yyyy didn't yield a valid Date object.
      if (part2Int >= 1 && part2Int <= 12 && part1Int >= 1 && part1Int <= 31) {
         let date = new Date(`${year}-${part2}-${part1}`); //yyyy-MM-dd format for Date constructor
         if (!isNaN(date.getTime())) {
           const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
           console.log("Output dateString (dd/MM/yyyy parsed):", formattedDate);
           return formattedDate;
         }
      }
    }
  }


  console.log("Output dateString (invalid format):", null);
  return null; // Indicate invalid format
};


const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

const createMappedObjects = (headers, data) => {
  const mapped = [];
  data.forEach((row, index) => {
    const obj = {};
    headers.forEach((header) => {
      const mappedKey = headingMap[header.toLowerCase().trim()];
      if (mappedKey) {
        obj[mappedKey] = row[header];
      }
    });
    obj._originalIndex = index; // Store original row index
    mapped.push(obj);
  });
  return mapped;
};

const formatValidationErrorMessage = (errors) => {
  if (errors.length === 0) return "";

  let message = "The following entries have validation errors:<br>";
  const acceptedFormats = "'dd-MM-yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy', or 'dd/MM/yyyy'";

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
    message += `<br>Row ${parseInt(rowIndex) + 1}:<br>`; // Display 1-based index
    rowErrors.forEach(err => {
      // Find the original header name based on the mapped column name
      const originalColumnNameEntry = Object.entries(headingMap).find(([key, value]) => value === err.columnName);
      // Use the original header name if found, otherwise use the mapped name
      const displayColumnName = originalColumnNameEntry ? originalColumnNameEntry[0] : err.columnName;


      if (err.columnName === "consignment_id") {
        message += `- Invalid '${displayColumnName}' value: "${err.value}". Must be a number.<br>`;
      } else if (err.columnName.includes("_date")) {
        // Check if the error is specifically for delivery_date and the value was null/undefined/empty
        // In this case, the message should be different or not shown if it's optional
        // For now, keep the message but the validation logic below will prevent adding the error for optional dates
        message += `- Invalid '${displayColumnName}' date value: "${err.value}". Expected formats: ${acceptedFormats}.<br>`;
      } else {
        message += `- Invalid value for '${displayColumnName}': "${err.value}".<br>`;
      }
    });
  });

  return message;
};


const apiUrl = `http://localhost:3001/fsm/consignments/`;

console.log(`localStorage.getItem("authResponse"): ` + localStorage.getItem("authResponse"))
const roleId = localStorage.getItem("authResponse") != null ? parseInt(JSON.parse(localStorage.getItem("authResponse")).roleId) : "";
const authToken = localStorage.getItem("authResponse") != null ? JSON.parse(localStorage.getItem("authResponse")).token : "";
const uploadedBy = localStorage.getItem("authResponse") != null ? JSON.parse(localStorage.getItem("authResponse")).userName : "";
const headers = {
  'accept': '*/*',
  'Authorization': `Bearer ${authToken}`,
  'Content-Type': 'application/json'
};

const makeApiRequest = async (url, method, headers, body = null) => {
  isLoading.value = true;
  try {
    console.log(`Making API request: ${method} ${url}`);
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
          console.log("API Error Response (JSON):", errorDetails);
        } else {
          errorMessage = errorBody || `Error: ${response.status}`;
          console.log("API Error Response (Text):", errorBody);
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
      console.log("API Response (Success - JSON):", data);
      return data;
    } else {
      console.log("API Response (Success - No JSON or other type):", response.status, response.statusText);
      // Return a default success structure if API returns non-JSON or empty body on success
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
};
const handleMessageBoxClose = () => {
  showMessageBox.value = false;

  if (messageBoxPurpose.value === 'validation') {
    console.log("Validation message box closed. Checking if API call is needed.");
    // After closing validation message, if there's data marked for acceptance, trigger the API call
    if (dataToSendToApi.value && dataToSendToApi.value.length > 0) {
      console.log("Proceeding with API call for accepted data.");
      // Clear validation errors only AFTER the potential API call is triggered for accepted data
      // validationErrors.value = []; // This will be cleared inside triggerAcceptApiCall's finally or success

      triggerAcceptApiCall(dataToSendToApi.value);
    } else {
      console.log("No accepted data after validation. API call skipped.");
      // If no data was accepted after validation (meaning all rows had errors),
      // the process is effectively finished for this file. Reset.
      resetAfterProcess();
    }
  } else if (messageBoxPurpose.value === 'apiResponse') {
    console.log("API response message box closed.");
    // API response message box signals the end of the process (either success or final error)
    apiResponseData.value = null;
    apiErrorMessage.value = null;
    // State should be reset after the API response is shown
    resetAfterProcess();
  }

  messageBoxContent.value = '';
  messageBoxTitle.value = '';
  messageBoxType.value = 'info';
  messageBoxPurpose.value = null; // Reset purpose

};

const triggerAcceptApiCall = async (dataArray) => {
  console.log("Starting API call for accepted data...");

  // These counts and row lists should reflect the *result* of the frontend validation
  // acceptedRows.value and rejectedRows.value are populated during the acceptAllData validation loop
  const acceptCountValidated = acceptedRows.value.length;
  const rejectCountValidated = rejectedRows.value.length;

  const rejectedRowsParam = rejectedRows.value.length > 0
    ? JSON.stringify(rejectedRows.value.map(index => index + 1)) // API likely expects 1-based indexing
    : "[]"; // Send empty array string if none rejected
  const acceptedRowsParam = acceptedRows.value.length > 0
    ? JSON.stringify(acceptedRows.value.map(index => index + 1)) // API likely expects 1-based indexing
    : "[]"; // Send empty array string if none accepted


  const fileType = file_id === 1 ? "Shipment letter" : file_id === 2 ? "Delivered letter" : file_id === 3 ? "Returned letter" : "Invalid file type!";

  const params = new URLSearchParams({
    fileName: fileName.value,
    userId: roleId, // Assuming roleId is the correct user identifier
    recordCount: total_record,
    // These counts passed as params might be redundant if the API calculates from the body/row lists,
    // but matching previous logic. The counts in the response body are the most reliable.
    accept_record_count: acceptCountValidated,
    reject_record_count: rejectCountValidated,
    uploadedBy: uploadedBy,
    fileType: fileType
  });

  // Append row indices only if there are any
  if (rejectedRows.value.length > 0) params.append('rejectedRows', rejectedRowsParam);
  if (acceptedRows.value.length > 0) params.append('acceptedRows', acceptedRowsParam);


  const acceptUrl = `${apiUrl}accept?${params.toString()}`;
  console.log("Accept API URL:", acceptUrl);
  console.log("Data being sent to Accept API:", dataArray);


  try {
    const data = await makeApiRequest(acceptUrl, "POST", headers, dataArray);

    apiResponseData.value = data;
    apiErrorMessage.value = null;

    messageBoxTitle.value = "Upload Result";
    messageBoxType.value = "success";
    console.log("====> API Response Data Length: ", data.data ? data.data.length : 0);

    // Use counts from API response if available, otherwise use frontend validated counts
    const apiMessage = data.message || 'Process completed successfully.';
    const finalAcceptedCount = data.data !== undefined ? data.data.length : acceptCountValidated;
    const finalRejectedCount = data.data !== undefined ? (total_record - finalAcceptedCount) : rejectCountValidated;


    // Constructing a more informative message
    let successMessage = `${apiMessage}<br>`;

    if (validationErrors.value.length > 0) {
        // If there were validation errors but some data was accepted
         successMessage += `Some records had validation errors and were not processed.<br>`;
         successMessage += `accepted: ${finalAcceptedCount} records.<br>`;
         successMessage += `Total records in file: ${total_record}.`;
    } else {
        // If no validation errors or all passed validation
         successMessage += `accepted: ${finalAcceptedCount} records.<br>`;
         successMessage += `rejected: ${finalRejectedCount} records.<br>`;
         successMessage += `Total records in file: ${total_record}.`;
    }


    messageBoxContent.value = successMessage;

    messageBoxPurpose.value = 'apiResponse'; // Indicate this is an API response message
    showMessageBox.value = true;

    // Reset state regardless of whether all data was accepted or some were rejected by API
    // The message box informs the user of the outcome.
    // resetAfterProcess(); // Reset happens after message box is closed


  } catch (error) {
    apiResponseData.value = null;
    apiErrorMessage.value = error.message || 'An unknown error occurred during acceptance.';

    messageBoxTitle.value = "Upload Failed";
    messageBoxType.value = "error";
    messageBoxContent.value = apiErrorMessage.value;

    messageBoxPurpose.value = 'apiResponse'; // Indicate this is an API response message
    showMessageBox.value = true;
  } finally {
      // Clear the dataToSendToApi and validation errors after the attempt
      dataToSendToApi.value = [];
      validationErrors.value = []; // Clear validation errors here as they've been displayed or processed
  }
};


const resetAfterProcess = () => {
  console.log("Resetting state after process.");
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
  // Clear previous state related to validation/acceptance
  rejectedRows.value = [];
  acceptedRows.value = [];
  showMessageBox.value = false;
  messageBoxPurpose.value = null;
  apiResponseData.value = null;
  apiErrorMessage.value = null;
  dataToSendToApi.value = []; // Clear any data potentially prepared for acceptance
  validationErrors.value = []; // Clear any validation errors

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

  isLoading.value = true; // Start loading indicator

  // --- MODIFICATION START ---
  // When rejecting all, explicitly mark all rows as rejected
  acceptedRows.value = []; // Set accepted rows to empty
  rejectedRows.value = []; // Clear rejected rows first
  for (let i = 0; i < total_record; i++) {
      // Assuming 0-based indexing is fine internally, will adjust for API param if needed
      rejectedRows.value.push(i);
  }

  const acceptCountToSend = 0; // 0 accepted when rejecting all
  const rejectCountToSend = total_record; // All rows rejected

  // Prepare params for API. Assuming API expects 1-based indexing for row numbers.
  const rejectedRowsParam = rejectedRows.value.length > 0
    ? JSON.stringify(rejectedRows.value.map(index => index + 1)) // Convert 0-based to 1-based
    : "[]"; // Send empty array string if none rejected (though unlikely here)

  // acceptedRowsParam will be "[]" as acceptedRows is empty

  const fileType = file_id === 1 ? "Shipment letter" : file_id === 2 ? "Delivered letter" : file_id === 3 ? "Returned letter" : "Invalid file type!";

  const params = new URLSearchParams({
    fileName: fileName.value,
    userId: roleId, // Assuming roleId is the correct user identifier
    recordCount: total_record,
    accept_record_count: acceptCountToSend,
    reject_record_count: rejectCountToSend,
    uploadedBy: uploadedBy,
    fileType: fileType
  });

  if (rejectedRows.value.length > 0) params.append('rejectedRows', rejectedRowsParam);
  // No need to append acceptedRowsParam as it will be empty

  const rejectUrl = `${apiUrl}reject?${params.toString()}`;
  console.log("Reject URL:", rejectUrl);

  try {
    const data = await makeApiRequest(rejectUrl, "POST", headers); 

    apiResponseData.value = data;
    apiErrorMessage.value = null;

    messageBoxTitle.value = "Rejection Result";
    messageBoxType.value = "success";
    // Display feedback based on the rejection action
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
      apiErrorMessage.value= `Failed to generate the report. Server responded with status ${error.status}: ${error.statusText}.`;
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
  } finally {
      isLoading.value = false; // Ensure loading is turned off
      // Reset state after the API response (success or failure)
      // resetAfterProcess(); // Reset happens after message box is closed
  }
};


const acceptAllData = async () => {
  errorMessage.value = null;
  // Clear previous state related to validation/acceptance
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
    messageBoxPurpose.value = 'apiResponse'; // Use apiResponse purpose as it's a final status message
    showMessageBox.value = true;
    // No isLoading = false here
    return;
  }

  if (file_id === 0) {
    messageBoxTitle.value = "Warning";
    messageBoxType.value = "warning";
    messageBoxContent.value = `Cannot process invalid file type. Please upload a file with 7, 8, or 16 columns.`;
    messageBoxPurpose.value = 'apiResponse'; // Use apiResponse purpose as it's a final status message
    showMessageBox.value = true;
     // No isLoading = false here
    resetAfterProcess(); // Reset state as file type is invalid
    return;
  }

  isLoading.value = true;
  const recordsToProcess = mappedObjects.value;
  const currentValidationErrors = [];
  const currentAcceptedDataForApi = [];
  const currentRejectedRowsIndices = [];
  const currentAcceptedRowsIndices = [];

  console.log("Starting frontend data validation loop...");

  for (let i = 0; i < recordsToProcess.length; i++) {
    const originalRow = recordsToProcess[i];
    // Create a copy to modify for API, leaving original mappedObjects untouched
    const formattedObj = { ...originalRow };
    let rowIsValid = true; // Assume valid until an error is found

    console.log(`--- Processing Row ${i + 1} ---`); // Log 1-based index for user
    console.log("Original Row Data (from mappedObjects):", originalRow);

    // Validate consignment_id (must be a number) - Required for all file types
    const consignmentIdKey = headingMap["consignment number"];
    if (consignmentIdKey) {
      const rawConsignmentValue = originalRow[consignmentIdKey];
      // Check if value is null, undefined, empty string, or not a number
      if (rawConsignmentValue === null || rawConsignmentValue === undefined || rawConsignmentValue.toString().trim() === '' || isNaN(rawConsignmentValue)) {
         rowIsValid = false;
         currentValidationErrors.push({
           rowIndex: i,
           columnName: consignmentIdKey,
           value: rawConsignmentValue,
           message: "Invalid consignment ID. Must be a number."
         });
      } else {
         // Convert to number for consistency if needed, or keep as string if API expects string
         // For now, keeping as string as per original data, validation is just for format
         // formattedObj[consignmentIdKey] = parseInt(rawConsignmentValue, 10); // Example if API needs number
      }
    }

    // Determine which date fields to validate based on file_id
    let dateFieldsToValidate = [];
    let optionalDateFields = []; // Keep track of dates that are allowed to be empty/null

    if (file_id === 1) { // Shipment letter
        dateFieldsToValidate = [
            headingMap["booking date"],
            headingMap["card creation date"]
        ].filter(key => key !== undefined);
    } else if (file_id === 2) { // Delivered letter
        dateFieldsToValidate = [
            headingMap["delivery date"]
        ].filter(key => key !== undefined);
        optionalDateFields.push(headingMap["delivery date"]); 
    } else if (file_id === 3) { 
         dateFieldsToValidate = [
            headingMap["date of return shipment received at branch"]
         ].filter(key => key !== undefined);
         optionalDateFields.push(headingMap["date of return shipment received at branch"]); 
    }

    // Validate the determined date fields
    dateFieldsToValidate.forEach(dateKey => {
        if (dateKey) { // Ensure the mapped key exists
            const rawDate = originalRow[dateKey];
            const formattedDate = formatDate(rawDate);
            console.log(`Row ${i + 1}: Raw ${dateKey}: "${rawDate}", Formatted: "${formattedDate}"`); // Added detailed log

            // Check if the formatted date is null AND if this date field is *not* in the optional list
            if (formattedDate === null && !optionalDateFields.includes(dateKey)) {
                // This date field is required and invalid
                rowIsValid = false; // Mark the row as invalid
                currentValidationErrors.push({
                    rowIndex: i,
                    columnName: dateKey,
                    value: rawDate,
                    message: "Invalid date format"
                });
                 formattedObj[dateKey] = null; // Set to null for API if invalid
            } else {
                 // Date was formatted successfully OR it was an optional date field and was null/empty
                 formattedObj[dateKey] = formattedDate; // Use the formatted date (yyyy-MM-dd) or null
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

  console.log("Frontend validation complete.");
  console.log("Validation Errors:", currentValidationErrors);
  console.log("Accepted Rows Indices:", currentAcceptedRowsIndices);
  console.log("Rejected Rows Indices:", currentRejectedRowsIndices);
  console.log("Data to Send to API (Accepted):", currentAcceptedDataForApi);


  validationErrors.value = currentValidationErrors;
  rejectedRows.value = currentRejectedRowsIndices;
  acceptedRows.value = currentAcceptedRowsIndices;
  dataToSendToApi.value = currentAcceptedDataForApi; // Store data for API call

  isLoading.value = false; // Turn off loading after frontend validation

  if (validationErrors.value.length > 0) {
    // Show validation errors message box
    messageBoxTitle.value = "Validation Errors Found";
    messageBoxType.value = "warning";
    messageBoxContent.value = formatValidationErrorMessage(validationErrors.value);
    messageBoxPurpose.value = 'validation'; // Indicate this is a validation message
    showMessageBox.value = true;

    // The API call for accepted data will be triggered when this message box is closed
  } else {
    // If no validation errors, proceed directly to API call
    console.log("No validation errors. Proceeding directly to API call.");
    triggerAcceptApiCall(dataToSendToApi.value);
  }
};

</script>


<style scoped>
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

  /* Style the scrollbar for Chrome, Safari, Edge */
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
  /* Adjust size as needed */
  height: 50px;
  /* Adjust size as needed */
  fill: white;
  /* Icon color */
  margin-bottom: 10px;
  /* Space between icon and text */
}

#file_input {
  background-color: #29f98e;
  color: black;
  border: 0.5px solid #29f98e
}

.back-button-container {
  margin-top: 2rem;
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
  color: #29f98e;
  width: 100%;
}

.heading h1 {
  font-size: 1.8em;
  font-weight: bold;
  margin: 0;
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

.upload-container .el-upload {
  margin-top: 0;
  margin-bottom: 0;
  /* Remove bottom margin here */
  display: flex;
  align-items: center;
  gap: 15px;
  /* Increased gap */
  width: 100%;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.el-upload .el-button[type="success"] {
  background-color: #00a651;
  border-color: #00a651;
  color: white;
  font-weight: bold;
  border-radius: 4px;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
  /* Using standard CSS variables for hover/active */
  --el-button-hover-border-color: #007a3b;
  --el-button-hover-bg-color: #007a3b;
  --el-button-active-border-color: #007a3b;
  --el-button-active-bg-color: #007a3b;
  padding: 10px 20px;
  /* Increased padding */
  height: auto;
  font-size: 1em;
  /* Standard font size */
}



.file-name {
  margin-top: 10px;
  font-weight: bold;
  color: #29f98e;
  text-align: left;
  width: 100%;
  word-break: break-all;
  font-size: 1em;
}

.error-message {
  margin-top: 15px;
  /* Increased margin */
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
  background-color: #00a651;
  border-color: #00a651;
  color: white;
  --el-button-hover-border-color: #007a3b;
  --el-button-hover-bg-color: #007a3b;
  --el-button-active-border-color: #007a3b;
  --el-button-active-bg-color: #007a66;
}

.reject-btn {
  background-color: #f56c6c;
  /* Element Plus danger color */
  border-color: #f56c6c;
  color: white;
  --el-button-hover-border-color: #e52222;
  --el-button-hover-bg-color: #e52222;
  --el-button-active-border-color: #e52222;
  --el-button-active-bg-color: #e52222;
}

.reject-btn:hover {
  background-color: #e52222;
  border-color: #e52222;
  color: white;
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

  /* Message Box */
  .el-overlay.is-message-box {
    /* Flexbox centering remains active */
    background-color: rgba(0, 0, 0, 0.5);
    /* Keep backdrop */
  }

  .el-message-box {
    width: 500px;
    /* Revert to fixed width or adjust max-width */
    max-width: none;
    /* Remove max-width */
    /* Remove top, left, transform */
  }

  .el-message-box__header {
    padding: 15px 24px;
  }

  .el-message-box__title {
    font-size: 1.1em;
  }

  .el-message-box__content {
    padding: 24px;
  }

  .el-message-box__container {
    max-height: calc(80vh - 120px);
    /* Revert calculation */
    padding-right: 10px;
  }

  .p-text {
    line-height: 1.6;
    font-size: 1em;
  }

  .el-message-box__btns {
    padding: 15px 24px 15px 0;
  }
}


.accept-btn {
  background-color: rgb(20, 168, 226);
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.accept-btn:hover {
  background-color: skyblue;
  color: black;
}

.reject-btn {
  background-color: #e52222c4;
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.reject-btn:hover {
  background-color: #f14c4cc4;
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
  background-color: #00a651;
  border-color: #00a651;
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

  .el-overlay.is-message-box {
    /* Flexbox centering remains active */
    background-color: rgba(0, 0, 0, 0.5);
    /* Keep backdrop */
  }

  .el-message-box {
    width: 500px;
    /* Revert to fixed width or adjust max-width */
    max-width: none;
    /* Remove max-width */
    /* Remove top, left, transform */
  }

  .el-message-box__header {
    padding: 15px 24px;
  }

  .el-message-box__title {
    font-size: 1.1em;
  }

  .el-message-box__content {
    padding: 24px;
  }

  .el-message-box__container {
    /* max-height: calc(80vh - 120px); */
    /* Revert calculation */
    padding-right: 10px;
  }

  .p-text {
    line-height: 1.6;
    font-size: 1em;
  }

  .el-message-box__btns {
    padding: 15px 24px 15px 0;
  }
}
</style>