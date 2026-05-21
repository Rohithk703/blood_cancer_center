/**
 * AP Blood Centre — Form to Google Sheet
 * Deploy as Web app → Anyone can access
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
    saveRow_(params);
    return textResponse("success");
  } catch (err) {
    return textResponse("error: " + err);
  }
}

function getParams_(e) {
  var params = {};

  if (e && e.parameter) {
    params = e.parameter;
  }

  if (e && e.postData && e.postData.contents) {
    var contents = e.postData.contents;
    var type = e.postData.type || "";

    if (type.indexOf("application/json") !== -1) {
      try {
        var json = JSON.parse(contents);
        for (var key in json) {
          if (json.hasOwnProperty(key)) {
            params[key] = json[key];
          }
        }
      } catch (err) {
        // ignore JSON parse errors
      }
    } else {
      var pairs = contents.split("&");
      for (var i = 0; i < pairs.length; i++) {
        var part = pairs[i].split("=");
        if (part.length === 2) {
          params[decodeURIComponent(part[0])] = decodeURIComponent(
            part[1].replace(/\+/g, " ")
          );
        }
      }
    }
  }

  return params;
}

function saveRow_(params) {
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
}

function textResponse(text) {
  return ContentService.createTextOutput(text).setMimeType(
    ContentService.MimeType.TEXT
  );
}
