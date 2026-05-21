/**
 * AP Blood Centre — Form to Google Sheet
 * Deploy: Web app → Execute as Me → Anyone can access
 * After edits: Deploy → Manage deployments → Edit → New version → Deploy
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

function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    if (params.name || params.phone || params.message) {
      saveRow_(params);
      return textResponse("success");
    }
    return textResponse("ok");
  } catch (err) {
    return textResponse("error: " + err);
  }
}

function doPost(e) {
  try {
    var params = getParams_(e);
    if (!params.name && !params.phone && !params.message) {
      return textResponse("error: no data");
    }
    saveRow_(params);
    return textResponse("success");
  } catch (err) {
    return textResponse("error: " + err);
  }
}

function getParams_(e) {
  var params = {};

  if (e && e.parameter) {
    for (var k in e.parameter) {
      if (e.parameter.hasOwnProperty(k)) {
        params[k] = e.parameter[k];
      }
    }
  }

  if (e && e.postData && e.postData.contents) {
    var contents = String(e.postData.contents);
    var type = (e.postData.type || "").toLowerCase();

    if (type.indexOf("application/json") !== -1) {
      try {
        var json = JSON.parse(contents);
        for (var key in json) {
          if (json.hasOwnProperty(key)) {
            params[key] = String(json[key]);
          }
        }
      } catch (ignore) {}
    } else {
      var pairs = contents.split("&");
      for (var i = 0; i < pairs.length; i++) {
        var idx = pairs[i].indexOf("=");
        if (idx > 0) {
          var pKey = decodeURIComponent(pairs[i].substring(0, idx).replace(/\+/g, " "));
          var pVal = decodeURIComponent(pairs[i].substring(idx + 1).replace(/\+/g, " "));
          params[pKey] = pVal;
        }
      }
    }
  }

  return params;
}

function saveRow_(params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Submissions");

  if (!sheet) {
    setupSheet();
    sheet = ss.getSheetByName("Submissions");
  }

  sheet.appendRow([
    new Date(),
    String(params.name || ""),
    String(params.phone || ""),
    String(params.email || ""),
    String(params.service || ""),
    String(params.message || ""),
  ]);
}

function textResponse(text) {
  return ContentService.createTextOutput(String(text)).setMimeType(
    ContentService.MimeType.TEXT
  );
}

/** Run once from editor to test — check Submissions sheet for a new row */
function testSubmit() {
  saveRow_({
    name: "Test User",
    phone: "9876543210",
    email: "test@example.com",
    service: "test",
    message: "Hello from Apps Script",
  });
}
