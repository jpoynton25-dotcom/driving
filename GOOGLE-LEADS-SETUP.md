# Pass Faster UK - Google Sheets Lead System Setup

## 1. Create the Google Sheet
1. In Google Drive, create a new Google Sheet named `Pass Faster UK Leads`.
2. Open `Extensions -> Apps Script`.
3. Replace the default script with the contents of [`docs/google-apps-script/Code.gs`](docs/google-apps-script/Code.gs).
4. Save.
5. The provided code is already pinned to your sheet ID:
   `1vWf_JWZlRJdPm6lG53Y9kpon34Zua6pvdhPE69daga4`

## 2. Deploy the Apps Script web app
1. Click `Deploy -> New deployment`.
2. Type: `Web app`.
3. Execute as: `Me`.
4. Who has access: `Anyone`.
5. Click `Deploy`.
6. Copy the `Web app URL`.

## 3. Connect website forms to the endpoint
1. Open [`site-config.js`](site-config.js).
2. Set `leadFormEndpoint` to your deployed Web app URL.
3. Keep `contactEmail` as `infopassfasteruk@gmail.com`.

## 4. Forms covered
- Free PDF signup form on [`free-resources.html`](free-resources.html):
  - `form_type = free_pdf`
  - redirects to `/thank-you-free-pdf.html`
- Support/recommendation form on [`index.html`](index.html):
  - `form_type = support_request`
  - redirects to `/thank-you-support.html`

Both include hidden tracking fields:
- `form_type`
- `source_page`
- `resource_type`
- `intent_stage`
- honeypot field `website`

## 5. Sheet columns (exact order)
The script automatically creates/repairs these columns:
1. `timestamp`
2. `form_type`
3. `source_page`
4. `resource_type`
5. `intent_stage`
6. `full_name`
7. `email`
8. `mobile_number`
9. `postcode`
10. `transmission`
11. `help_with`
12. `message`
13. `status`
14. `notes`

Defaults:
- `status = new`
- `notes = blank`

## 6. Testing checklist
1. Start local site and open `/free-resources.html`.
2. Submit the free PDF form with real test details.
3. Confirm redirect to `/thank-you-free-pdf.html`.
4. Check:
   - New row appears in Google Sheet.
   - Email notification received at `infopassfasteruk@gmail.com`.
   - User confirmation email received by submitter.
5. Open homepage and submit support form.
6. Confirm redirect to `/thank-you-support.html`.
7. Check sheet and owner email again.

## 7. Troubleshooting
- If forms do not submit, verify `leadFormEndpoint` is set in [`site-config.js`](site-config.js).
- If script throws auth errors, re-open Apps Script and grant requested permissions.
- If emails fail, ensure Apps Script deployment is still active and using your account.
- If rows do not appear, confirm the `SHEET_ID` in `Code.gs` matches your target sheet.
