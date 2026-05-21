/**
 * AP Blood Centre — Form to Google Sheet
 *
 * Setup:
 * 1. Create a new Google Sheet
 * 2. Extensions → Apps Script → paste this file → Save
 * 3. Run setupSheet() once (authorize when prompted)
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web app URL into js/config.js
 */

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Submissions");

  if (!sheet) {
    sheet = ss.insertSheet("Submissions");
  }

  sheet.clear();
  sheet.appendRow([
    "Timestamp",
    "Name",
    "Phone",
    "Email",
    "Service",
    "Message",
  ]);
  sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function doPost(e) {
  try {
    var params = e.parameter || {};
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Submissions");

    if (!sheet) {
      setupSheet();
      sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Submissions");
    }

    sheet.appendRow([
      new Date(),
      params.name || "",
      params.phone || "",
      params.email || "",
      params.service || "",
      params.message || "",
    ]);

    return jsonResponse({ result: "success" });
  } catch (err) {
    return jsonResponse({ result: "error", message: String(err) });
  }
}

function doGet() {
  return jsonResponse({ result: "ok", message: "Form endpoint is running." });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
