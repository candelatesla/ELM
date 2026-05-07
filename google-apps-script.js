/**
 * ELM Progress Tracker — Google Apps Script
 *
 * SETUP (do this once):
 *  1. Open your Google Sheet
 *  2. Extensions → Apps Script
 *  3. Delete any existing code, paste this entire file
 *  4. Click Save (Ctrl+S / Cmd+S)
 *  5. Click Deploy → New deployment
 *     - Type: Web app
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  6. Click Deploy → copy the Web app URL
 *  7. In Vercel: Settings → Environment Variables
 *     - Add  GOOGLE_APPS_SCRIPT_URL = <paste URL here>
 *  8. Redeploy your Vercel project (or it picks it up on next push)
 *
 * The script creates two tabs automatically on first run:
 *   "Snapshot Skills"  — one row per child × skill observation
 *   "Assessments"      — one row per student × week assessment
 */

// ─── Sheet names ───────────────────────────────────────────────────────────────

var SNAPSHOT_SHEET  = "Snapshot Skills";
var ASSESSMENT_SHEET = "Assessments";

// ─── Column headers ────────────────────────────────────────────────────────────
// Must match the order in app/api/submit/route.ts exactly.

var SNAPSHOT_HEADERS = [
  "Submitted At", "State", "Teacher Name", "School Name", "Classroom Name", "Child Name",
  "Domain", "Skill Group", "Skill Name",
  "Observation Date 1", "Observation Note 1", "Observation Score 1",
  "Observation Date 2", "Observation Note 2", "Observation Score 2",
  "Follow-Up Learning Plan"
];

var ASSESSMENT_HEADERS = [
  "Submitted At", "State", "Teacher Name", "School Name", "Classroom Name",
  "Domain", "Week", "Assessment Name", "Child Name",
  "Score", "Reassessment Date", "Reassessment Score", "Notes",
  "Correct Responses", "Items Missed",
  "Uppercase Known", "Lowercase Known",
  "Highest Count", "Numerals Correct"
];

// ─── Main entry point ──────────────────────────────────────────────────────────

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Write snapshot rows
    if (payload.snapshots && payload.snapshots.length > 0) {
      var snapSheet = getOrCreateSheet(ss, SNAPSHOT_SHEET, SNAPSHOT_HEADERS, "#2D7D7A");
      payload.snapshots.forEach(function(row) {
        snapSheet.appendRow(row);
      });
    }

    // Write assessment rows
    if (payload.assessments && payload.assessments.length > 0) {
      var assessSheet = getOrCreateSheet(ss, ASSESSMENT_SHEET, ASSESSMENT_HEADERS, "#C06C32");
      payload.assessments.forEach(function(row) {
        assessSheet.appendRow(row);
      });
    }

    return jsonResponse({ ok: true, message: "Saved to Google Sheets." });

  } catch (err) {
    return jsonResponse({ ok: false, message: err.toString() });
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns the named sheet, creating it with styled headers if it doesn't exist.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} name
 * @param {string[]} headers
 * @param {string} headerColor  hex color for the header row background
 */
function getOrCreateSheet(ss, name, headers, headerColor) {
  var sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);

    // Write and style header row
    var range = sheet.getRange(1, 1, 1, headers.length);
    range.setValues([headers]);
    range.setBackground(headerColor);
    range.setFontColor("#FFFFFF");
    range.setFontWeight("bold");
    range.setFontSize(11);

    // Freeze header so it stays visible when scrolling
    sheet.setFrozenRows(1);

    // Set a comfortable default column width
    sheet.setColumnWidths(1, headers.length, 160);

    // Auto-resize the first few identifier columns to be a bit narrower
    sheet.setColumnWidth(1, 200); // Submitted At
    sheet.setColumnWidth(2, 80);  // State
    sheet.setColumnWidth(3, 140); // Teacher Name
    sheet.setColumnWidth(4, 140); // School Name
    sheet.setColumnWidth(5, 140); // Classroom Name
  }

  return sheet;
}

/** Returns a JSON ContentService response. */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
