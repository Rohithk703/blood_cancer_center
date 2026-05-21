# Store form submissions in Google Sheets

Follow these steps once. After that, every **Get in Touch** submission appears in your spreadsheet.

## 1. Create the spreadsheet

1. Open [Google Sheets](https://sheets.google.com) → **Blank spreadsheet**
2. Name it e.g. `AP Blood Centre — Contact Form`

## 2. Add the script

1. **Extensions** → **Apps Script**
2. Delete any code in the editor
3. Open `google-apps-script/Code.gs` from this project, copy all of it, paste into Apps Script
4. **Save** (Ctrl+S)

## 3. Create the sheet tab

1. In Apps Script, select function **`setupSheet`** from the dropdown
2. Click **Run**
3. Allow permissions when Google asks (your Google account only)

You should see a **Submissions** tab with headers: Timestamp, Name, Phone, Email, Service, Message.

## 4. Deploy as web app

1. **Deploy** → **New deployment**
2. Type: **Web app**
3. **Execute as:** Me  
4. **Who has access:** Anyone  
5. Click **Deploy** → copy the **Web app URL** (looks like `https://script.google.com/macros/s/...../exec`)

**Important:** If you change `Code.gs` later, use **Deploy → Manage deployments → Edit → New version → Deploy**. Old URLs keep working only after you publish a new version.

## 5. Connect the website

1. Open `js/config.js`
2. Paste your URL inside the quotes:

```javascript
window.SHEET_WEB_APP_URL = "https://script.google.com/macros/s/YOUR_ID/exec";
```

3. Save and **redeploy** the site on Netlify (drag folder or git push)

## 6. Test

Submit the form on your live site. A new row should appear in the **Submissions** sheet within a few seconds.

## Admin access

Share the Google Sheet with your admin Gmail (**Share** → Editor or Viewer).

## Troubleshooting

| Problem | Fix |
|--------|-----|
| Form says “not configured” | Set `SHEET_WEB_APP_URL` in `js/config.js` and redeploy |
| No new rows | In Apps Script: **Deploy → Manage deployments → Edit → New version → Deploy**. Ensure access is **Anyone**. Then redeploy the website on Netlify. |
| Still 404 after submit | Redeploy full `blood_cancer_center` folder; hard-refresh browser (Ctrl+F5) |
