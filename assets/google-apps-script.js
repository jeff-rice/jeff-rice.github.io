/**
 * Google Apps Script for J.Rice Coaching Admin Dashboard
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com and create a new project
 * 2. Copy and paste this entire code into the script editor
 * 3. Update the SPREADSHEET_ID below with your Google Sheet ID
 * 4. Click Deploy > New Deployment
 * 5. Select "Web app" as the type
 * 6. Set "Execute as" to "Me"
 * 7. Set "Who has access" to "Anyone"
 * 8. Click Deploy and authorize the app
 * 9. Copy the Web App URL and paste it into your admin.html file
 */

// UPDATE THIS with your Google Sheet ID (from the sheet URL)
const SPREADSHEET_ID = '1AoBoVGCIzwhTtX5j4KhVMabTnLwcxJOcejhPv2Y3mU8';
const SHEET_NAME = 'Appointments';

/**
 * Handle GET requests - Fetch all appointments
 */
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet) {
      return createJsonResponse({ error: 'Sheet not found' }, 404);
    }

    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return createJsonResponse([]);
    }

    const headers = data[0];
    const appointments = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Skip empty rows
      if (!row[0] && !row[1]) continue;

      appointments.push({
        rowId: i + 1, // Row number in sheet (1-indexed, accounting for header)
        clientName: row[0] || '',
        email: row[1] || '',
        phone: row[2] || '',
        dateScheduled: row[3] ? formatDateForOutput(row[3]) : '',
        status: row[4] || 'Scheduled',
        rescheduleCount: row[5] || 0,
        eligible: row[6] || 'Yes',
        notes: row[7] || ''
      });
    }

    return createJsonResponse(appointments);
  } catch (error) {
    return createJsonResponse({ error: error.message }, 500);
  }
}

/**
 * Handle POST requests - Add, Update, or Delete appointments
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet) {
      return createJsonResponse({ error: 'Sheet not found' }, 404);
    }

    switch (data.action) {
      case 'add':
        return addAppointment(sheet, data);
      case 'update':
        return updateAppointment(sheet, data);
      case 'delete':
        return deleteAppointment(sheet, data);
      default:
        return createJsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    return createJsonResponse({ error: error.message }, 500);
  }
}

/**
 * Add a new appointment
 */
function addAppointment(sheet, data) {
  const newRow = [
    data.clientName,
    data.email,
    data.phone || '',
    data.dateScheduled,
    data.status,
    data.rescheduleCount || 0,
    data.eligible || 'Yes',
    data.notes || ''
  ];

  sheet.appendRow(newRow);

  return createJsonResponse({ success: true, message: 'Appointment added' });
}

/**
 * Update an existing appointment
 */
function updateAppointment(sheet, data) {
  const rowId = parseInt(data.rowId);

  if (!rowId || rowId < 2) {
    return createJsonResponse({ error: 'Invalid row ID' }, 400);
  }

  const range = sheet.getRange(rowId, 1, 1, 8);
  range.setValues([[
    data.clientName,
    data.email,
    data.phone || '',
    data.dateScheduled,
    data.status,
    data.rescheduleCount || 0,
    data.eligible || 'Yes',
    data.notes || ''
  ]]);

  return createJsonResponse({ success: true, message: 'Appointment updated' });
}

/**
 * Delete an appointment
 */
function deleteAppointment(sheet, data) {
  const rowId = parseInt(data.rowId);

  if (!rowId || rowId < 2) {
    return createJsonResponse({ error: 'Invalid row ID' }, 400);
  }

  sheet.deleteRow(rowId);

  return createJsonResponse({ success: true, message: 'Appointment deleted' });
}

/**
 * Format date for output
 */
function formatDateForOutput(date) {
  if (date instanceof Date) {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm");
  }
  return date;
}

/**
 * Create JSON response with CORS headers
 */
function createJsonResponse(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Initialize the spreadsheet with headers (run this once manually)
 */
function initializeSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  // Set headers
  const headers = [
    'Client Name',
    'Email',
    'Phone',
    'Date Scheduled',
    'Status',
    'Reschedule Count',
    'Eligible for Free Consultation',
    'Notes'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');

  // Set column widths
  sheet.setColumnWidth(1, 150); // Client Name
  sheet.setColumnWidth(2, 200); // Email
  sheet.setColumnWidth(3, 120); // Phone
  sheet.setColumnWidth(4, 150); // Date Scheduled
  sheet.setColumnWidth(5, 100); // Status
  sheet.setColumnWidth(6, 120); // Reschedule Count
  sheet.setColumnWidth(7, 180); // Eligible
  sheet.setColumnWidth(8, 250); // Notes

  // Freeze header row
  sheet.setFrozenRows(1);

  Logger.log('Sheet initialized successfully!');
}
