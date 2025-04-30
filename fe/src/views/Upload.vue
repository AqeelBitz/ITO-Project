<template>
  <div class="main-container">
    <div class="heading">
        <h1>Upload File</h1>
      </div>
    <div class="upload-page-container">
      <div class="upload-container">
        <el-upload ref="uploadRef" class="upload-demo" action="" :auto-upload="false" :show-file-list="false"
          accept=".csv" @change="handleFileChange">
          <template #trigger>
            <el-button id="file_input" type="success" @click="triggerFileUpload">Select
              File</el-button>
          </template>
          <template #tip>
            <div class="upload-tip">csv files with a size less than 500MB</div>
          </template>
        </el-upload>
        <div v-if="fileName" class="file-name">{{ fileName }}</div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}
        </div>
        <div class="table-and-buttons-container"
          v-if="tableData.length > 0 && columns.length > 0 && columns[0].prop !== 'placeholder'">
          <div class="tablecsv">
            <el-table ref="multipleTableRef" row-key="id" @selection-change="handleSelectionChange" :data="tableData"
              stripe height="500" style="width: 100%;" scrollbar-always-on :border="true">
              <el-table-column type="index" label="#" width="50" fixed /> <template
                v-if="columns.length > 0 && columns[0].prop !== 'placeholder'">
                <el-table-column v-for="column in columns" :key="column.prop" :prop="column.prop" :label="column.label"
                  min-width="150" show-overflow-tooltip /> </template>
            </el-table>
          </div>
          <div class="action-buttons" style="margin-top: 20px; display: flex; gap: 10px;">
            <el-button class="accept-btn" type="primary" @click="acceptAllData()">Accept All</el-button>
            <el-button class="reject-btn" @click="rejectAllData()">Reject</el-button>
          </div>
        </div>
        <div v-else-if="!fileName && !errorMessage" class="empty-state">
          <p>No file selected yet.</p>
        </div>
        <div
          v-else-if="fileName && (tableData.length === 0 || (columns.length === 1 && columns[0].prop === 'placeholder')) && !errorMessage"
          class="empty-state">
          <p>File selected but no data or valid columns found.</p>
        </div>
      </div>

      <MessageBox :visible="showMessageBox" :title="messageBoxTitle" :content="messageBoxContent" :type="messageBoxType"
        @close="handleMessageBoxClose" />

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Papa from 'papaparse';
// Import the new MessageBox component
import MessageBox from './MessageBox.vue'; // Adjust the path as needed

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

// --- New/Modified State for Message Box Flow ---
const messageBoxPurpose = ref(null); // null, 'validation', 'apiResponse'
const apiResponseData = ref(null); // Store API success data temporarily
const apiErrorMessage = ref(null); // Store API error message temporarily
const dataToSendToApi = ref([]); // Store accepted data after validation
const validationErrors = ref([]); // Store validation errors temporarily
// Note: rejectedRows and acceptedRows are now used *only* for API URL parameters,
// not necessarily for the validation message summary anymore.
const rejectedRows = ref([]); // Local tracking for validation/summary, sent to API implicitly
const acceptedRows = ref([]); // Local tracking for validation/summary, sent to API implicitly
// --- End New/Modified State ---


let file_id = 0;
let total_record;

const fileName = ref('');
// Initialize columns as empty array, placeholder handled in template
const columns = ref([]);
const uploadRef = ref(null);
const mappedObjects = ref([]);


const headingMap = {
  "consignment number": "consignment_id",
  "courier": "courier",
  "booking date": "booking_date",
  "account number": "account_no",
  "account title": "account_title",
  "receiverâ€™s cnic": "receiver_cnic",
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

const triggerFileUpload = () => {
  if (uploadRef.value) {
    console.log("uploadRef.value: ", uploadRef.value);
    // Access the native file input element
    // The way to access the native input might depend slightly on Element Plus version
    const fileInput = uploadRef.value.$el ? uploadRef.value.$el.querySelector('input[type="file"]') : uploadRef.value.$refs.input?.$el?.querySelector('input[type="file"]'); // Adjusted access methods
    if (fileInput) {
      fileInput.click();
    } else {
      console.error("File input element not found on uploadRef.");
      // Fallback if direct access fails, might need to adjust based on Element Plus structure
      const fallbackInput = document.querySelector('#file_input input[type="file"]');
      if (fallbackInput) {
        fallbackInput.click();
      } else {
        console.error("Fallback file input element also not found.");
      }
    }
  }
};

const formatDate = (dateString) => {
  console.log("Input dateString:", dateString);
  if (!dateString) {
    console.log("Output dateString (empty):", "");
    return null; // Return null for empty or null input
  }
  // Attempt dd-MM-yyyy
  const parts_dmy = dateString.split('-');
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
    const date = new Date(dateString);
    // Check if Date object is valid and represents the input string reasonably
    // This is a basic check; for strict validation, regex or a date library is better.
    // Simple check: Does parsing and reformatting give the same year?
    if (!isNaN(date.getTime()) && date.getFullYear() === parseInt(dateString.substring(0, 4), 10)) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      console.log("Output dateString (parsed by Date object):", formattedDate);
      return formattedDate;
    }
  } catch (error) {
    console.log("Error parsing date with Date object:", dateString, error);
  }

  // Attempt MM/dd/yyyy or dd/MM/yyyy (common variations)
  const parts_slash = dateString.split('/');
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

// Access row data using the original header key
const createMappedObjects = (headers, data) => {
  const mapped = [];
  data.forEach((row, index) => { // Get index here
    const obj = {};
    headers.forEach((header) => {
      // Use the original header to find the mapped key (using lowercase and trim for map lookup)
      const mappedKey = headingMap[header.toLowerCase().trim()];
      if (mappedKey) {
        // Access row data using the original header as the key provided by PapaParse
        obj[mappedKey] = row[header]; // <-- Access using the original 'header' value
      }
      // Decide if you want to keep original unmapped columns.
      // For validation and API, keeping only mapped is usually cleaner.
    });
    // Add original row index for tracking purposes
    obj._originalIndex = index; // Store 0-based index
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
    // Use the original row number (index + 1)
    message += `<br>Row ${parseInt(rowIndex) + 1}:<br>`;
    rowErrors.forEach(err => {
      // Find the original column name from headingMap or use the mapped name if not found
      const originalColumnName = Object.keys(headingMap).find(key => headingMap[key] === err.columnName);
      const displayColumnName = originalColumnName || err.columnName; // Use original if found, else mapped

      if (err.columnName === "consignment_id") { // Use the mapped key for checking
        message += `- Invalid '${displayColumnName}' value: "${err.value}". Must be a number.<br>`;
      } else if (err.columnName.includes("_date")) { // Check for date fields using mapped keys
        message += `- Invalid '${displayColumnName}' date value: "${err.value}". Expected formats: ${acceptedFormats}.<br>`;
      } else {
        // Generic error message for other column types if needed
        message += `- Invalid value for '${displayColumnName}': "${err.value}".<br>`;
      }
    });
  });

  return message;
};

const handleFileChange = (uploadFile) => {
  // Reset states related to previous upload/process
  errorMessage.value = null;
  tableData.value = []; // Reset to empty array
  columns.value = []; // Reset to empty array
  fileName.value = '';
  mappedObjects.value = [];
  rejectedRows.value = [];
  acceptedRows.value = [];
  showMessageBox.value = false; // Hide previous message
  messageBoxPurpose.value = null; // Reset message box purpose
  apiResponseData.value = null;
  apiErrorMessage.value = null;
  dataToSendToApi.value = [];
  validationErrors.value = [];

  file_id = 0; // Reset file type id
  total_record = 0; // Reset total records

  if (!uploadFile.raw) {
    errorMessage.value = 'File is not properly loaded.';
    return;
  }

  fileName.value = uploadFile.name;
  const reader = new FileReader();

  reader.onload = (event) => {
    const csvData = event.target?.result;
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const csvHeaders = Object.keys(results.data[0]);
          // Filter out headers that are empty strings or null
          const validCsvHeaders = csvHeaders.filter(header => header && header.trim() !== '');

          if (validCsvHeaders.length === 0) {
            console.log("CSV file has headers but they are all empty or invalid.");
            errorMessage.value = "CSV file has invalid headers. Please ensure headers are correct.";
            tableData.value = [];
            columns.value = [];
            mappedObjects.value = [];
            total_record = 0;
            fileName.value = '';
            return;
          }

          columns.value = validCsvHeaders.map((key) => ({
            prop: key, // Use original header as prop
            label: key, // Use original header as label
          }));
          tableData.value = results.data; // Store original parsed data for table display
          // Pass validated headers to createMappedObjects
          mappedObjects.value = createMappedObjects(validCsvHeaders, results.data);
          total_record = results.data.length;
          console.log("Total records in CSV:", total_record);
          console.log("Mapped Objects: ", mappedObjects.value);

          // Determine file_id based on the number of *valid* columns found in the CSV
          if (validCsvHeaders.length === 16) {
            file_id = 1; //Shipment
            console.log("Detected File Type: Shipment letter (16 columns)");
          }
          else if (validCsvHeaders.length === 8) {
            file_id = 2; //Delivered
            console.log("Detected File Type: Delivered letter (8 columns)");
          }
          else if (validCsvHeaders.length === 7) {
            file_id = 3; //Returned
            console.log("Detected File Type: Returned letter (7 columns)");
          }
          else {
            file_id = 0; //Invalid
            console.log("Detected File Type: Invalid (unexpected number of columns: " + validCsvHeaders.length + ")");
            errorMessage.value = `Invalid file format: Expected 7, 8, or 16 columns, but found ${validCsvHeaders.length}. Please upload a valid template.`;
            // Clear parsed data if file format is invalid
            tableData.value = [];
            columns.value = [];
            mappedObjects.value = [];
            total_record = 0;
            fileName.value = ''; // Clear file name as it's invalid

          }

        } else {
          columns.value = [];
          tableData.value = [];
          mappedObjects.value = [];
          total_record = 0;
          console.log("CSV file is empty or contains no data rows.");
          errorMessage.value = "CSV file is empty or contains no data rows.";
          fileName.value = ''; // Clear file name as it's empty
        }
      },
      error: (error) => {
        console.log('CSV parsing error:', error);
        errorMessage.value = `CSV parsing error: ${error.message}`;
        mappedObjects.value = [];
        tableData.value = [];
        columns.value = [];
        total_record = 0;
        fileName.value = ''; // Clear file name on parsing error
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
    fileName.value = ''; // Clear file name on read error
  };

  reader.readAsText(uploadFile.raw);
};


const apiUrl = `http://localhost:3001/fsm/consignments/`;

const roleId = parseInt(JSON.parse(localStorage.getItem("authResponse")).roleId);
const authToken = JSON.parse(localStorage.getItem("authResponse")).token;
const uploadedBy = JSON.parse(localStorage.getItem("authResponse")).userName;
const headers = {
  'accept': '*/*',
  'Authorization': `Bearer ${authToken}`,
  'Content-Type': 'application/json'
};

// --- Centralized API Request Helper ---
const makeApiRequest = async (url, method, headers, body = null) => {
  isLoading.value = true; // Start loading
  try {
    console.log(`Making API request: ${method} ${url}`);
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      let errorBody;
      let errorMessage = `HTTP error! Status: ${response.status}`; // Default error message
      let errorDetails = null;

      try {
        errorBody = await response.text(); // Read as text first
        // Attempt JSON parsing only if Content-Type is application/json
        if (response.headers.get("content-type")?.includes("application/json")) {
          errorDetails = JSON.parse(errorBody);
          // **Extract message from JSON payload if available, otherwise use default**
          errorMessage = errorDetails.message || errorDetails.error?.message || errorBody || `Error: ${response.status}`;
          console.log("API Error Response (JSON):", errorDetails);
        } else {
          // **Use raw text if not JSON, otherwise use default**
          errorMessage = errorBody || `Error: ${response.status}`;
          console.log("API Error Response (Text):", errorBody);
        }
      } catch (e) {
        console.error("Error reading or parsing API error body:", e);
        // Fallback to a generic message if body reading/parsing fails
        errorMessage = `HTTP error! Status: ${response.status}. Could not read error details.`;
      }

      // Structure the error to be caught by the caller
      const apiError = new Error(errorMessage); // Use the extracted/default message
      apiError.status = response.status;
      apiError.statusText = response.statusText;
      apiError.details = errorDetails || errorBody; // Include parsed JSON or raw body for debugging

      console.error("API Request failed:", apiError);
      throw apiError; // Re-throw the structured error

    }

    // If response is OK, parse and return JSON
    // Check if response has content to parse (e.g., 204 No Content wouldn't)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("API Response (Success - JSON):", data);
      // **Return the parsed data (which should contain the success message and counts)**
      return data;
    } else {
      console.log("API Response (Success - No JSON or other type):", response.status, response.statusText);
      // **Return a default success object if no JSON body is expected**
      // Assuming API *should* return counts on success for 'accept'. If not,
      // this default might not have the counts.
      return { message: `Operation successful (Status: ${response.status})`, accepted_count: 0, rejected_count: 0 };
    }


  } catch (error) {
    console.error("API Request encountered an exception:", error);
    // Handle network errors or errors thrown during fetch/response processing
    if (error.status !== undefined) {
      // It's an API error we already structured and threw
      throw error; // Re-throw the structured error (with message derived from backend)
    } else {
      // It's a network error or other unexpected fetch issue
      const networkError = new Error(`Network or unexpected error during API call: ${error.message || 'Unknown network error'}`);
      networkError.originalError = error; // Keep original error for debugging
      console.error("Network Error:", networkError);
      throw networkError; // Throw a structured network error
    }
  } finally {
    isLoading.value = false; // End loading in all cases
  }
};
// --- End Centralized API Request Helper ---

// --- Message Box Handling Logic ---
const handleMessageBoxClose = () => {
  // Hide the message box
  showMessageBox.value = false;

  // Check the purpose of the message box that was just closed
  if (messageBoxPurpose.value === 'validation') {
    console.log("Validation message box closed. Checking if API call is needed.");
    // If it was a validation message and there is data to send, trigger API call
    if (dataToSendToApi.value && dataToSendToApi.value.length > 0) {
      console.log("Proceeding with API call for accepted data.");
      // IMPORTANT: Clear validation-specific temp state *before* API call logic
      validationErrors.value = []; // Clear validation error list
      // rejectedRows.value and acceptedRows.value are needed for the API URL params,
      // so they are NOT cleared here. They are cleared in resetAfterProcess.

      // Trigger the API call and handle its message box display
      triggerAcceptApiCall(dataToSendToApi.value); // New function for API call flow
    } else {
      console.log("No accepted data after validation. API call skipped.");
      // If no data to send, the process is finished after validation message
      resetAfterProcess(); // Clear all states
    }
  } else if (messageBoxPurpose.value === 'apiResponse') {
    console.log("API response message box closed.");
    // If it was an API response message, the process is complete
    // States were already cleared on successful API call inside AddConsignmentDetails
    // If API failed, states remain, user can inspect table/errors.
    // We just clear the temp API response data storage here.
    apiResponseData.value = null;
    apiErrorMessage.value = null;
    // If you wanted to *always* clear table/file data after closing API box, do it here.
    // Keeping current logic: clear only on API success (handled by resetAfterProcess).
  }

  // Always clear the message box content and purpose after handling
  messageBoxContent.value = '';
  messageBoxTitle.value = '';
  messageBoxType.value = 'info';
  messageBoxPurpose.value = null; // Reset purpose
};

// Function to trigger the API call specifically after validation
const triggerAcceptApiCall = async (dataArray) => {
  console.log("Starting API call for accepted data...");
  // isLoading.value is handled by makeApiRequest

  // Use the counts captured during frontend validation for API URL params
  const acceptCountValidated = acceptedRows.value.length;
  const rejectCountValidated = rejectedRows.value.length;

  const rejectedRowsParam = rejectedRows.value.length > 0
    ? JSON.stringify(rejectedRows.value.map(index => index)) // Send array of row numbers (1-based)
    : "";
  const acceptedRowsParam = acceptedRows.value.length > 0
    ? JSON.stringify(acceptedRows.value.map(index => index)) // Send array of row numbers (1-based)
    : "";

  const fileType = file_id === 1 ? "Shipment letter" : file_id === 2 ? "Delivered letter" : file_id === 3 ? "Returned letter" : "Invalid file type!";

  const params = new URLSearchParams({
    fileName: fileName.value,
    userId: roleId,
    recordCount: total_record,
    accept_record_count: acceptCountValidated, // Sent frontend count
    reject_record_count: rejectCountValidated, // Sent frontend count
    uploadedBy: uploadedBy,
    fileType: fileType
  });

  if (rejectedRowsParam) params.append('rejectedRows', rejectedRowsParam);
  if (acceptedRowsParam) params.append('acceptedRows', acceptedRowsParam);

  const acceptUrl = `${apiUrl}accept?${params.toString()}`;
  console.log("Accept API URL:", acceptUrl);


  try {
    const data = await makeApiRequest(acceptUrl, "POST", headers, dataArray);

    // API Success - Prepare API response message box
    apiResponseData.value = data; // Store data
    apiErrorMessage.value = null; // Clear any previous error

    messageBoxTitle.value = "Upload Result"; // Title for API response
    messageBoxType.value = "success";

    // Construct the message using API response data, assuming keys like accepted_count, rejected_count
    const apiMessage = data.message || 'Process completed successfully.';
    const acceptedCount = data.accepted_count !== undefined ? data.accepted_count : 'N/A'; // Use 0 if not provided? Or N/A?
    const rejectedCount = data.rejected_count !== undefined ? data.rejected_count : 'N/A'; // Use 0 if not provided? Or N/A?

    messageBoxContent.value = `${apiMessage}<br>Total accepted: ${acceptedCount}<br>Total rejected: ${rejectedCount}`;

    messageBoxPurpose.value = 'apiResponse'; // Set purpose to API response
    showMessageBox.value = true; // Show the API response message box

    // Clear table data and related states after successful API processing
    resetAfterProcess();


  } catch (error) {
    // API Error - Prepare API response message box
    apiResponseData.value = null;
    apiErrorMessage.value = error.message || 'An unknown error occurred during acceptance.';

    messageBoxTitle.value = "Upload Failed"; // Title for API error
    messageBoxType.value = "error";
    messageBoxContent.value = apiErrorMessage.value; // Just show the error message

    messageBoxPurpose.value = 'apiResponse'; // Set purpose to API response
    showMessageBox.value = true; // Show the API response message box

    // Do NOT clear table/file state on API error
  }
  // isLoading is handled by makeApiRequest's finally block
  dataToSendToApi.value = []; // Clear the temp data after API call attempt
};


const resetAfterProcess = () => {
  console.log("Resetting state after successful process.");
  tableData.value = [];
  columns.value = [];
  fileName.value = '';
  mappedObjects.value = [];
  rejectedRows.value = []; // Clear frontend rejected/accepted counts after successful API
  acceptedRows.value = [];
  total_record = 0;
  file_id = 0;
  errorMessage.value = null; // Clear file error too
  dataToSendToApi.value = []; // Should already be cleared by triggerAcceptApiCall, but safety.
  validationErrors.value = []; // Clear validation errors too
  apiResponseData.value = null;
  apiErrorMessage.value = null;
  // messageBox state is reset in handleMessageBoxClose
};


const rejectAllData = async () => {
  // Reset states for a new operation
  errorMessage.value = null;
  rejectedRows.value = []; // Reset counts
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
    messageBoxPurpose.value = 'apiResponse'; // Treat this initial check as a final response message
    showMessageBox.value = true;
    isLoading.value = false; // End loading if not done by helper
    return;
  }

  if (file_id === 0) {
    messageBoxTitle.value = "Warning";
    messageBoxType.value = "warning";
    messageBoxContent.value = `Cannot reject invalid file type. Please upload a file with 7, 8, or 16 columns.`;
    messageBoxPurpose.value = 'apiResponse'; // Treat this as a final response message
    showMessageBox.value = true;
    isLoading.value = false; // End loading
    // Clear data state as it's an invalid file
    resetAfterProcess(); // Clear all states including table/file
    return;
  }

  // Note: Reject All doesn't involve frontend row-level validation,
  // it just sends the file name for backend processing.
  // So, no 'validation' message box needed for reject.

  const rejectUrl = `${apiUrl}reject?fileName=${encodeURIComponent(fileName.value)}&userId=${roleId}&recordCount=${total_record}`;
  console.log("Reject URL:", rejectUrl);

  try {
    // makeApiRequest will throw on non-OK status, otherwise returns data
    const data = await makeApiRequest(rejectUrl, "POST", headers);

    // API Success - Prepare API response message box
    apiResponseData.value = data;
    apiErrorMessage.value = null;

    messageBoxTitle.value = "Rejection Result"; // Title for rejection
    messageBoxType.value = "success";
    // Assuming reject response also has a message
    messageBoxContent.value = data.message || 'Rejection operation successful.';
    // Note: Reject might not return accepted/rejected counts like 'accept' does.
    // If it does, you can add them here similarly.

    messageBoxPurpose.value = 'apiResponse'; // Set purpose to API response
    showMessageBox.value = true; // Show the API response message box

    // Clear table data and related states after successful API processing
    resetAfterProcess();


  } catch (error) {
    // API Error - Prepare API response message box
    apiResponseData.value = null;
    apiErrorMessage.value = error.message || 'An unknown error occurred during rejection.';

    messageBoxTitle.value = "Rejection Failed"; // Title for rejection error
    messageBoxType.value = "error";
    messageBoxContent.value = apiErrorMessage.value;

    messageBoxPurpose.value = 'apiResponse'; // Set purpose to API response
    showMessageBox.value = true; // Show the API response message box

    // Do NOT clear table/file state on API error
  }
  // isLoading is handled by makeApiRequest's finally block
};


const acceptAllData = async () => {
  // Reset states for a new operation (except file/table data which is already loaded)
  errorMessage.value = null;
  rejectedRows.value = []; // Reset counts for current validation run
  acceptedRows.value = [];
  showMessageBox.value = false; // Hide any previous message box
  messageBoxPurpose.value = null; // Reset purpose
  apiResponseData.value = null;
  apiErrorMessage.value = null;
  dataToSendToApi.value = []; // Clear temp data storage
  validationErrors.value = []; // Clear temp error storage


  if (mappedObjects.value.length === 0 || !fileName.value) {
    messageBoxTitle.value = "Info";
    messageBoxType.value = "info";
    messageBoxContent.value = "No data or file selected to accept. Please upload a valid CSV file with data.";
    messageBoxPurpose.value = 'apiResponse'; // Treat this initial check as a final response message
    showMessageBox.value = true;
    isLoading.value = false; // End loading if not done by helper
    return;
  }

  if (file_id === 0) {
    messageBoxTitle.value = "Warning";
    messageBoxType.value = "warning";
    messageBoxContent.value = `Cannot process invalid file type. Please upload a file with 7, 8, or 16 columns.`;
    messageBoxPurpose.value = 'apiResponse'; // Treat this as a final response message
    showMessageBox.value = true;
    isLoading.value = false; // End loading
    // Clear data state as it's an invalid file
    resetAfterProcess(); // Clear all states including table/file
    return;
  }

  // --- Start Frontend Validation ---
  isLoading.value = true; // Indicate validation is starting
  const recordsToProcess = mappedObjects.value;
  const currentValidationErrors = [];
  const currentAcceptedDataForApi = [];
  const currentRejectedRowsIndices = []; // 0-based indices for temp storage
  const currentAcceptedRowsIndices = []; // 0-based indices for temp storage

  console.log("Starting frontend data validation loop...");

  for (let i = 0; i < recordsToProcess.length; i++) {
    const originalRow = recordsToProcess[i]; // Use original mapped object
    const formattedObj = { ...originalRow }; // Start with a copy
    let rowIsValid = true;

    console.log(`--- Processing Row ${i + 1} ---`);
    console.log("Original Row Data (from mappedObjects):", originalRow);

    // --- Field Validation Logic ---
    // Consignment Number (Mandatory)
    const consignmentIdKey = headingMap["consignment number"];
    if (consignmentIdKey) {
      const rawConsignmentValue = originalRow[consignmentIdKey];
      if (rawConsignmentValue == null || String(rawConsignmentValue).trim() === "") {
        console.log(`Row ${i + 1}: ${consignmentIdKey} is missing or empty (Mandatory).`);
        currentValidationErrors.push({ rowIndex: i, columnName: consignmentIdKey, value: rawConsignmentValue || '' });
        formattedObj[consignmentIdKey] = null;
        rowIsValid = false;
      } else {
        const parsedConsignmentId = parseInt(rawConsignmentValue, 10);
        if (isNaN(parsedConsignmentId)) {
          console.log(`Row ${i + 1}: ${consignmentIdKey} '${rawConsignmentValue}' is not a number.`);
          currentValidationErrors.push({ rowIndex: i, columnName: consignmentIdKey, value: rawConsignmentValue });
          formattedObj[consignmentIdKey] = null;
          rowIsValid = false;
        } else {
          formattedObj[consignmentIdKey] = parsedConsignmentId;
          console.log(`Row ${i + 1}: Parsed ${consignmentIdKey}: ${formattedObj[consignmentIdKey]}`);
        }
      }
    } else {
      console.log(`Row ${i + 1}: 'consignment number' column missing from file.`);
      currentValidationErrors.push({ rowIndex: i, columnName: 'consignment_id', value: 'Column Missing' });
      formattedObj['consignment_id'] = null;
      rowIsValid = false;
    }

    // Date Validations based on file type (Mandatory dates checked here)
    if (file_id === 1) { // Shipment letter
      const bookingDateKey = headingMap["booking date"];
      const cardCreationDateKey = headingMap["card creation date"];

      // Booking Date
      if (bookingDateKey) {
        const rawBookingDate = originalRow[bookingDateKey];
        if (rawBookingDate == null || String(rawBookingDate).trim() === "") {
          console.log(`Row ${i + 1}: ${bookingDateKey} is missing or empty (Mandatory for Shipment).`);
          currentValidationErrors.push({ rowIndex: i, columnName: bookingDateKey, value: rawBookingDate || '' });
          formattedObj[bookingDateKey] = null;
          rowIsValid = false;
        } else {
          const bookingDateFormatted = formatDate(rawBookingDate);
          if (bookingDateFormatted === null) {
            console.log(`Row ${i + 1}: ${bookingDateKey} '${rawBookingDate}' is an invalid format.`);
            currentValidationErrors.push({ rowIndex: i, columnName: bookingDateKey, value: rawBookingDate });
            rowIsValid = false;
          }
          formattedObj[bookingDateKey] = bookingDateFormatted;
        }
      } else {
        console.log(`Row ${i + 1}: 'booking date' column missing from Shipment file.`);
        currentValidationErrors.push({ rowIndex: i, columnName: 'booking_date', value: 'Column Missing' });
        formattedObj['booking_date'] = null;
        rowIsValid = false;
      }

      // Card Creation Date
      if (cardCreationDateKey) {
        const rawCardCreationDate = originalRow[cardCreationDateKey];
        if (rawCardCreationDate == null || String(rawCardCreationDate).trim() === "") {
          console.log(`Row ${i + 1}: ${cardCreationDateKey} is missing or empty (Mandatory for Shipment).`);
          currentValidationErrors.push({ rowIndex: i, columnName: cardCreationDateKey, value: rawCardCreationDate || '' });
          formattedObj[cardCreationDateKey] = null;
          rowIsValid = false;
        } else {
          const cardCreationDateFormatted = formatDate(rawCardCreationDate);
          if (cardCreationDateFormatted === null) {
            console.log(`Row ${i + 1}: ${cardCreationDateKey} '${rawCardCreationDate}' is an invalid format.`);
            currentValidationErrors.push({ rowIndex: i, columnName: cardCreationDateKey, value: rawCardCreationDate });
            rowIsValid = false;
          }
          formattedObj[cardCreationDateKey] = cardCreationDateFormatted;
        }
      } else {
        console.log(`Row ${i + 1}: 'card creation date' column missing from Shipment file.`);
        currentValidationErrors.push({ rowIndex: i, columnName: 'card_creation_date', value: 'Column Missing' });
        formattedObj['card_creation_date'] = null;
        rowIsValid = false;
      }


    } else if (file_id === 2) { // Delivered letter
      const deliveryDateKey = headingMap["delivery date"];

      // Delivery Date
      if (deliveryDateKey) {
        const rawDeliveryDate = originalRow[deliveryDateKey];
        if (rawDeliveryDate == null || String(rawDeliveryDate).trim() === "") {
          console.log(`Row ${i + 1}: ${deliveryDateKey} is missing or empty (Mandatory for Delivered).`);
          currentValidationErrors.push({ rowIndex: i, columnName: deliveryDateKey, value: rawDeliveryDate || '' });
          formattedObj[deliveryDateKey] = null;
          rowIsValid = false;
        } else {
          const deliveryDateFormatted = formatDate(rawDeliveryDate);
          if (deliveryDateFormatted === null) {
            console.log(`Row ${i + 1}: ${deliveryDateKey} '${rawDeliveryDate}' is an invalid format.`);
            currentValidationErrors.push({ rowIndex: i, columnName: deliveryDateKey, value: rawDeliveryDate });
            rowIsValid = false;
          }
          formattedObj[deliveryDateKey] = deliveryDateFormatted;
        }
      } else {
        console.log(`Row ${i + 1}: 'delivery date' column missing from Delivered file.`);
        currentValidationErrors.push({ rowIndex: i, columnName: 'delivery_date', value: 'Column Missing' });
        formattedObj['delivery_date'] = null;
        rowIsValid = false;
      }

    } else if (file_id === 3) { // Returned letter
      const returnDateKey = headingMap["date of return shipment received at branch"];

      // Return Date
      if (returnDateKey) {
        const rawReturnDate = originalRow[returnDateKey];
        if (rawReturnDate == null || String(rawReturnDate).trim() === "") {
          console.log(`Row ${i + 1}: ${returnDateKey} is missing or empty (Mandatory for Returned).`);
          currentValidationErrors.push({ rowIndex: i, columnName: returnDateKey, value: rawReturnDate || '' });
          formattedObj[returnDateKey] = null;
          rowIsValid = false;
        } else {
          const returnDateFormatted = formatDate(rawReturnDate);
          if (returnDateFormatted === null) {
            console.log(`Row ${i + 1}: ${returnDateKey} '${rawReturnDate}' is an invalid format.`);
            currentValidationErrors.push({ rowIndex: i, columnName: returnDateKey, value: rawReturnDate });
            rowIsValid = false;
          }
          formattedObj[returnDateKey] = returnDateFormatted;
        }
      } else {
        console.log(`Row ${i + 1}: 'date of return shipment received at branch' column missing from Returned file.`);
        currentValidationErrors.push({ rowIndex: i, columnName: 'return_date', value: 'Column Missing' });
        formattedObj['return_date'] = null;
        rowIsValid = false;
      }
    }
    // --- End Field Validation Logic ---


    console.log(`Row ${i + 1} - Final rowIsValid status: ${rowIsValid}`);
    console.log(`Row ${i + 1} - Formatted Object:`, formattedObj);

    if (rowIsValid) {
      currentAcceptedDataForApi.push(formattedObj);
      // Push original row index + 1 (for 1-based display)
      currentAcceptedRowsIndices.push(originalRow._originalIndex + 1);
      console.log(`Row ${i + 1} added to accepted data.`);
    } else {
      // Push original row index + 1 (for 1-based display)
      currentRejectedRowsIndices.push(originalRow._originalIndex + 1);
      console.log(`Row ${i + 1} added to rejected rows list.`);
    }
    console.log(`--- Finished Row ${i + 1} ---`);
  }

  // --- End Frontend Validation ---
  isLoading.value = false; // Validation is complete

  console.log("Data validation loop finished.");
  console.log("Total Validation Errors collected:", currentValidationErrors.length);
  console.log("Accepted Data Count (for API):", currentAcceptedDataForApi.length);
  console.log("Rejected Row Indices Count (local):", currentRejectedRowsIndices.length);
  console.log("Accepted Row Indices:", currentAcceptedRowsIndices);
  console.log("Rejected Row Indices:", currentAcceptedRowsIndices);

  // Store validation results in state variables to be used after message box is closed
  validationErrors.value = currentValidationErrors; // Store the error objects
  dataToSendToApi.value = currentAcceptedDataForApi; // Store the formatted accepted data
  rejectedRows.value = currentRejectedRowsIndices; // Store 1-based indices for API param
  acceptedRows.value = currentAcceptedRowsIndices; // Store 1-based indices for API param


  // Prepare and show the Validation Message Box
  let validationContent = "";
  if (validationErrors.value.length > 0) {
    validationContent = formatValidationErrorMessage(validationErrors.value);
    messageBoxTitle.value = "Validation Warnings";
    messageBoxType.value = "warning";
  } else {
    validationContent = "Frontend validation successful. No validation errors found.";
    messageBoxTitle.value = "Validation Successful";
    messageBoxType.value = "success";
  }

  // **DO NOT add the summary counts here**

  messageBoxContent.value = validationContent;
  messageBoxPurpose.value = 'validation'; // Set purpose to validation message
  showMessageBox.value = true; // Show the validation message box

  // The process continues in handleMessageBoxClose after the user clicks OK.
};


</script>

<style scoped>
/* General Layout and Typography */
.main-container{
  background-color: #f9f9f9;
}
.upload-page-container {
  font-family: 'Arial', sans-serif;
  color: #333;
  background-color: #f9f9f9;
  min-height: 75vh;
    /* Use min-height for full page background */
  padding: 15px;
  /* Added some padding */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Center content horizontally */
}

.heading {
  text-align: center;
  margin-bottom: 20px;
  color: #007a3b;
  width: 100%;
  /* Ensure heading takes full width */
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
  margin-bottom: 20px;
  /* Increased margin */
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

.upload-tip {
  color: #666;
  margin-top: 5px;
  font-size: 0.9em;
  /* Slightly larger font size */
  text-align: left;
  width: 100%;
  /* Ensure tip takes full width */
}

.file-name {
  margin-top: 10px;
  font-weight: bold;
  color: #007a3b;
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

/* Table Section */
.table-and-buttons-container {
  margin-top: 25px;
  /* Increased margin */
  width: 100%;
  max-width: 1500px;
  /* Keep max-width for large screens */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}


.tablecsv {
  width: 100%;
  overflow-x: auto;
  /* Keep horizontal scrolling for wide tables */
  max-height: 500px;
  /* Keep max height for internal table scrolling */
  overflow-y: hidden;
  /* Let el-table handle vertical scrolling */
  box-sizing: border-box;
  border: 1px solid #cccccc;
  /* Add border to the container */
  border-radius: 4px;
  /* Match table border-radius */
}

.el-table {
  width: 100%;
  /* Ensure table takes full width of its container */
  /* height="500" in template makes the body scroll internally */
  border: none;
  /* Remove border from el-table itself if container has it */
  border-radius: 0;
  /* Remove border-radius if container has it */
}

.el-table td.el-table__cell,
.el-table th.el-table__cell {
  border-bottom: 1px solid #f4f4f4;
  border-right: none;
  /* Ensure no vertical borders */
  padding: 10px;
  /* Adjusted padding */
  box-sizing: border-box;
  white-space: normal;
  /* Allow text wrapping */
  word-break: break-word;
  /* Break long words */
  vertical-align: top;
  /* Align content to the top */
}

/* Style specifically for table headers */
.el-table__header-wrapper th.el-table__cell {
  background-color: #007a3b;
  color: #ffffff;
  font-weight: bold;
  border-bottom: 2px solid #00a651;
  text-align: center;
  /* Center header text */
  padding: 12px 10px;
  /* Adjusted padding */
}

/* Remove the default inner border line Element Plus adds */
.el-table__inner-wrapper::before {
  height: 0;
}

/* Remove default border from Element Plus table if container has one */
.el-table--border {
  border: none;
  border-radius: 0;
}

/* Add rounded corners to the top of the table header (on the container) */
.tablecsv {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  overflow: hidden;
  /* Hide overflow from rounded corners */
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  /* Center buttons on small screens */
  gap: 15px;
  /* Increased gap */
  margin-top: 20px !important;
  width: 100%;
  /* Take full width */
}

.action-buttons .el-button {
  font-weight: bold;
  border-width: 1px;
  border-radius: 4px;
  padding: 10px 20px;
  /* Increased padding */
  height: auto;
  font-size: 1em;
  /* Standard font size */
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
  --el-button-active-bg-color: #007a3b;
}

.accept-btn {
  /* Specific style overridden by .action-buttons .el-button[type="primary"] */
  /* background-color: rgb(20, 168, 226); */
  /* color: white; */
  /* padding: 8px 15px; */
  /* border-radius: 4px; */
  /* border: none; */
  /* cursor: pointer; */
  /* font-weight: bold; */
}

.accept-btn:hover {
  /* background-color: skyblue; */
  /* color: black; */
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
  width: 100%;
  font-size: 1em;
  padding: 20px;
  /* Added padding */
  border: 1px dashed #ccc;
  border-radius: 4px;
  background-color: #fcfcfc;
}

/* Message Box Responsiveness (Keeping styles here as requested) */
.el-overlay.is-message-box {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  /* Slightly darker backdrop */
  z-index: 2006;
  padding: 10px;
  /* Add padding for very small screens */
  box-sizing: border-box;
}

.el-overlay-message-box {
  /* This container helps with centering in Element Plus, keep it */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  /* Take full width of overlay */
  height: 100%;
  /* Take full height of overlay */
}


.el-message-box {
  width: 95%;
  /* Use percentage for width on smaller screens */
  max-width: 500px;
  /* Set a max-width for larger screens */
  background-color: #ffffff;
  max-height: 90vh;
  /* Allow taller message boxes */
  overflow: hidden;
  border-radius: 8px;
  /* Match main container border-radius */
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
  /* More prominent shadow */
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  text-align: left;
}

.el-message-box__header {
  background-color: #007a3b;
  /* Consistent header color */
  padding: 12px 18px;
  /* Adjusted padding */
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.el-message-box__title {
  color: white !important;
  font-weight: bold;
  font-size: 1.1em;
  /* Slightly larger title */
  padding-left: 0;
  margin-bottom: 0;
}

.msg-text {
  font-weight: bold;
}

.el-message-box__content {
  margin-top: 0;
  padding: 18px;
  /* Adjusted padding */
  color: #333;
  font-size: 1em;
  /* Standard font size */
  overflow: hidden;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.el-message-box__container {
  max-height: calc(90vh - 120px);
  /* Adjusted calculation based on max-height and padding */
  overflow-y: auto;
  padding-right: 8px;
  /* Space for scrollbar */
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 8px;
    /* Increased scrollbar width */
  }

  &::-webkit-scrollbar-thumb {
    background-color: #b0b0b0;
    /* Darker thumb */
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: #e0e0e0;
    /* Lighter track */
  }

  scrollbar-width: thin;
  scrollbar-color: #b0b0b0 #e0e0e0;
}

.el-message-box__message {
  display: block;
}

.p-text {
  color: #333;
  line-height: 1.6;
  /* Improved line height */
  font-size: 0.95em;
  /* Slightly larger font size */
}

.el-message-box__btns {
  display: flex;
  /* Use flexbox for buttons */
  justify-content: flex-end;
  /* Align buttons to the right */
  padding: 12px 18px;
  /* Adjusted padding */
  border-top: 1px solid #f0f0f0;
  /* Lighter border */
  flex-shrink: 0;
  gap: 10px;
  /* Add gap between buttons if more were added */
}

.el-message-box__btns .el-button {
  background-color: #00a651;
  /* Primary green */
  border-color: #00a651;
  color: white;
  font-weight: bold;
  border-width: 1px;
  border-radius: 4px;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
  --el-button-hover-border-color: #007a3b;
  --el-button-hover-bg-color: #007a3b;
  --el-button-active-border-color: #007a3b;
  --el-button-active-bg-color: #007a3b;
  padding: 8px 15px;
  /* Standard button padding */
  height: auto;
  font-size: 0.9em;
}

button {
  cursor: pointer;
}

/* Media Queries for larger screens */
@media (min-width: 768px) {
  .upload-page-container {
    padding: 20px;
    /* Standard padding */
  }

  .heading h1 {
    font-size: 2.2em;
    /* Larger heading */
  }

  .upload-container {
    padding: 30px;
    /* More padding on larger screens */
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
    margin-top: 15px;
    font-size: 1.1em;
  }

  .error-message {
    margin-top: 20px;
    padding: 12px;
    font-size: 1em;
  }

  .table-and-buttons-container {
    margin-top: 30px;
  }

  .tablecsv {
    overflow-x: visible;
    /* Allow table to grow */
    max-height: none;
    /* Remove max-height constraint */
    overflow-y: visible;
    /* Remove scrollbar from container */
  }

  .el-table {
    /* height="500" will still make the internal body scroll, consider removing if max-height on container is gone */
    height: auto !important;
    /* Override fixed height with auto */
  }


  .el-table td.el-table__cell,
  .el-table th.el-table__cell {
    padding: 12px 15px;
    /* Standard cell padding */
  }

  .el-table__header-wrapper th.el-table__cell {
    padding: 14px 15px;
    /* Slightly more header padding */
    font-size: 1.05em;
  }

  .action-buttons {
    margin-top: 25px !important;
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
    padding: 20px;
    /* Standard padding */
  }

  .el-message-box {
    width: 500px;
    /* Fixed width */
    max-width: none;
    /* Remove max-width percentage */
    max-height: 80vh;
    /* Revert max-height if needed */
  }

  .el-message-box__header {
    padding: 15px 24px;
  }

  .el-message-box__title {
    font-size: 1.2em;
  }

  .el-message-box__content {
    padding: 20px 24px;
  }

  .el-message-box__container {
    max-height: calc(80vh - 130px);
    /* Adjust calculation */
    padding-right: 10px;
  }

  .p-text {
    font-size: 1em;
    /* Standard font size */
  }

  .el-message-box__btns {
    padding: 15px 24px;
    gap: 15px;
  }

  .el-message-box__btns .el-button {
    padding: 10px 20px;
    font-size: 1em;
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
  margin-bottom: 20px;
  color: #007a3b;
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
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: left;
  /* max-height: fit-content; */
  width: 85%;
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
  color: #666;
  margin-top: 5px;
  /* Adjusted margin */
  font-size: 0.8em;
  /* Slightly smaller font size */
  text-align: left;
  width: 100%;
}

.file-name {
  margin-top: 10px;
  /* Adjusted margin */
  font-weight: bold;
  color: #007a3b;
  text-align: left;
  width: 100%;
  word-break: break-all;
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

.tablecsv {
  margin-top: 15px;
  width: 100%;
  max-width: 1500px;
  overflow-x: auto;
  /* Keep horizontal scrolling for wide tables */
  max-height: 500px;
  /* Set a max height for the table container */
  overflow-y: auto;
  /* Enable vertical scrolling for the container */
  box-sizing: border-box;
}

.el-table {
  width: 100%;
  /* Ensure table takes full width of its container */
  /* The height="500" attribute on the el-table component in your template
     makes the table body scroll internally within that height. */
}

.el-table td.el-table__cell,
.el-table th.el-table__cell {
  border-bottom: 1px solid #f4f4f4;
  border-right: none;
  padding: 8px 10px;
  /* Adjusted padding: Added 10px horizontal padding */
  box-sizing: border-box;
  /* Include padding in cell dimensions */
}

.el-table td.el-table__cell {
  text-align: left;
  /* Align text to the left in data cells */
  white-space: normal;
  /* Ensure text wraps */
  word-break: break-word;
  /* Break long words if necessary */
  /* vertical-align: top; /* Optional: Align cell content to the top */
}

/* Style specifically for table headers */
.el-table__header-wrapper th.el-table__cell {
  background-color: #007a3b;
  color: #ffffff;
  font-weight: bold;
  border-bottom: 2px solid #00a651;
  text-align: center;
  /* Center header text */
}

/* Ensure the last cell in the header row doesn't have a right border */
.el-table__header-wrapper th.el-table__cell:last-child {
  border-right: none;
}

/* Style for regular table rows */
.el-table__body tr.el-table__row {
  background-color: #fff;
}

/* Style for striped table rows */
.el-table__body tr.el-table__row--striped {
  background-color: #f9f9f9;
}

/* Style for table row hover state */
.el-table__body tr.el-table__row:hover>td {
  background-color: #e9f6ee !important;
}

/* Remove the default inner border line Element Plus adds */
.el-table__inner-wrapper::before {
  height: 0;
}

/* Add rounded corners to the top of the table header */
.el-table--border .el-table__header-wrapper {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  overflow: hidden;
}

/* Add subtle bottom border to the entire table */
.el-table--border {
  border: 1px solid #cccccc;
  border-radius: 4px;
}

.tablecsv .el-button {
  font-weight: bold;
  border-width: 1px;
  border-radius: 4px;
  padding: 8px 15px;
  height: auto;
  font-size: 0.9rem;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.tablecsv .el-button[type="primary"] {
  background-color: #00a651;
  border-color: #00a651;
  color: white;
  --el-button-hover-border-color: #007a3b;
  --el-button-hover-bg-color: #007a3b;
  --el-button-active-border-color: #007a3b;
  --el-button-active-bg-color: #007a3b;
}

/* Button container for better spacing on small screens */
.tablecsv+div {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 15px !important;
}

.empty-state {
  margin-top: 15px;
  text-align: center;
  color: #666;
  width: 100%;
  font-size: 1em;
  height: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Message Box Responsiveness */
.el-overlay.is-message-box {
  display: flex;
  /* Use flexbox to center the message box */
  align-items: center;
  /* Center vertically */
  justify-content: center;
  /* Center horizontally */
  position: fixed;
  /* Use fixed positioning */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  /* Add a backdrop */
  z-index: 2006;
}

.el-message-box {
  width: 90%;
  /* Use percentage for width */
  max-width: 500px;
  /* Set a max-width for larger screens */
  /* Removed top, left, and transform as flexbox handles centering */
  background-color: #ffffff;
  max-height: 80vh;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  display: flex;
  /* Added flex display */
  flex-direction: column;
  /* Stack header, content, and buttons vertically */
}

.el-message-box__header {
  background-color: #007a3b;
  padding: 10px 15px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  /* Prevent header from shrinking */
}

.el-message-box__title {
  color: white !important;
  font-weight: bold;
  font-size: 1em;
  padding-left: 0;
  margin-bottom: 0;
  --el-messagebox-title-color: white;
}

.msg-text {
  font-weight: bold;
}

.el-message-box__content {
  margin-top: 0;
  padding: 15px;
  color: #333;
  font-size: 14px;
  overflow: hidden;
  flex-grow: 1;
  /* Allow content to take available space */
  display: flex;
  flex-direction: column;
}

.el-message-box__container {
  max-height: calc(80vh - 100px);
  /* Adjusted calculation */
  overflow-y: auto;
  padding-right: 5px;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #cccccc;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f4f4f4;
  }

  scrollbar-width: thin;
  scrollbar-color: #cccccc #f4f4f4;
}

.el-message-box__message {
  display: block;
}

.p-text {
  color: #333;
  height: auto;
  line-height: 1.5;
  font-size: 0.9em;
}

.el-message-box__btns {
  justify-content: flex-end;
  padding: 10px 15px 10px 0;
  border-top: 1px solid #f4f4f4;
  flex-shrink: 0;
  /* Prevent buttons from shrinking */
}

.el-message-box__btns .el-button {
  background-color: #00a651;
  border-color: #00a651;
  color: white;
  font-weight: bold;
  border-width: 1px;
  border-radius: 4px;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
  --el-button-hover-border-color: #007a3b;
  --el-button-hover-bg-color: #007a3b;
  --el-button-active-border-color: #007a3b;
  --el-button-active-bg-color: #007a3b;
  padding: 8px 15px;
  height: auto;
}

button {
  cursor: pointer;
}

/* Media Queries for larger screens */
@media (min-width: 768px) {
  .upload-page-container {
    /* padding: 20px; */
  }

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

  .file-name {
    margin-top: 15px;
  }

  .error-message {
    margin-top: 15px;
    padding: 10px;
  }

  .tablecsv {
    margin-top: 20px;
    overflow-x: visible;
    max-height: none;
    /* Remove max-height on larger screens */
    overflow-y: visible;
    /* Remove vertical scrolling on larger screens */
  }

  .el-table td.el-table__cell,
  .el-table th.el-table__cell {
    padding: 12px 15px;
    /* Revert/Adjust padding for larger screens */
  }

  .el-table td.el-table__cell {
    white-space: normal;
    /* Ensure text wraps */
    word-break: break-word;
    /* Break long words if necessary */
  }

  .el-table__header-wrapper th.el-table__cell {
    text-align: center;
    /* Center header text on larger screens */
    padding: 12px 15px;
    /* Revert/Adjust padding for larger screens */
  }

  .tablecsv+div {
    margin-top: 20px !important;
    justify-content: flex-start;
    flex-wrap: nowrap;
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
</style>