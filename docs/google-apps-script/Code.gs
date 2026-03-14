/**
 * Pass Faster UK - Free lead backend
 * Stack: Google Apps Script + Google Sheets + MailApp
 */

const OWNER_EMAIL = 'infopassfasteruk@gmail.com';
const SHEET_NAME = 'Pass Faster UK Leads';
const SITE_BASE_URL = 'https://passfasteruk.co.uk';
const SHEET_ID = '1vWf_JWZlRJdPm6lG53Y9kpon34Zua6pvdhPE69daga4';

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, service: 'pass-faster-uk-leads', timestamp: new Date().toISOString() })
  ).setMimeType(ContentService.MimeType.JSON);
}

// Run this manually once from Apps Script to create/check the lead sheet headers.
function setupLeadsSheet() {
  const sheet = getOrCreateSheet_();
  SpreadsheetApp.flush();
  return `Ready: ${sheet.getName()}`;
}

function doPost(e) {
  try {
    const payload = normalizePayload(e && e.parameter ? e.parameter : {});

    // Honeypot: silently accept but do not process spam.
    if (payload.website) {
      return renderRedirect(getRedirectUrl_(payload.next_url, '/thank-you-support.html'));
    }

    const validationError = validatePayload(payload);
    if (validationError) {
      return renderError(validationError);
    }

    const sheet = getOrCreateSheet_();
    const timestamp = new Date();

    sheet.appendRow([
      timestamp, // timestamp
      payload.form_type,
      payload.source_page,
      payload.resource_type,
      payload.intent_stage,
      payload.full_name,
      payload.email,
      payload.mobile_number,
      payload.postcode,
      payload.transmission,
      payload.help_with,
      payload.message,
      'new', // status
      '' // notes
    ]);

    sendOwnerNotification_(timestamp, payload);
    sendUserConfirmation_(payload);

    const nextPath =
      payload.form_type === 'free_pdf'
        ? '/thank-you-free-pdf.html'
        : payload.form_type === 'waitlist_request'
          ? '/thank-you-waitlist.html'
          : '/thank-you-support.html';
    const redirectUrl = getRedirectUrl_(payload.next_url, nextPath);
    return renderRedirect(redirectUrl);
  } catch (err) {
    return renderError(`Submission failed: ${err && err.message ? err.message : 'Unknown error'}`);
  }
}

function normalizePayload(params) {
  const clean = (value) => String(value || '').trim();

  const formType = clean(params.form_type);
  const inferredHelpWith = inferHelpWith_(params, clean);
  const inferredMessage = inferMessage_(params, clean);

  return {
    form_type: formType,
    source_page: clean(params.source_page || 'unknown'),
    resource_type: clean(params.resource_type || 'none'),
    intent_stage: clean(params.intent_stage || 'unknown'),
    full_name: clean(params.full_name || params.name),
    email: clean(params.email).toLowerCase(),
    mobile_number: clean(params.mobile_number || params.phone || params.mobile),
    postcode: clean(params.postcode),
    transmission: clean(params.transmission),
    help_with: inferredHelpWith,
    message: inferredMessage,
    website: clean(params.website || params._honey),
    next_url: clean(params.next_url)
  };
}

function validatePayload(data) {
  if (!data.form_type) return 'Missing form_type.';
  if (!data.full_name) return 'Full name is required.';
  if (!data.email) return 'Email is required.';
  if (!data.help_with) return 'Help with is required.';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) return 'Invalid email format.';

  if (!['free_pdf', 'support_request', 'waitlist_request'].includes(data.form_type)) {
    return 'Invalid form_type.';
  }

  return '';
}

function inferHelpWith_(params, clean) {
  const candidates = [
    params.help_with,
    params.interest,
    params.lesson_type,
    params.challenge,
    params.focus,
    params.theory_passed,
    params.experience_level,
    params.target_timescale,
    params.pack
  ]
    .map(clean)
    .filter(Boolean);

  return candidates.join(' | ');
}

function inferMessage_(params, clean) {
  const baseMessage = clean(params.message);

  const extras = [];
  const appendExtra = (label, value) => {
    const safeValue = clean(value);
    if (safeValue) extras.push(`${label}: ${safeValue}`);
  };

  appendExtra('Lesson type', params.lesson_type);
  appendExtra('Challenge', params.challenge);
  appendExtra('Focus', params.focus);
  appendExtra('Theory passed', params.theory_passed);
  appendExtra('Experience level', params.experience_level);
  appendExtra('Target timescale', params.target_timescale);
  appendExtra('Pack', params.pack);

  if (!extras.length) return baseMessage;
  if (!baseMessage) return extras.join(' | ');
  return `${baseMessage} | ${extras.join(' | ')}`;
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  const headers = [
    'timestamp',
    'form_type',
    'source_page',
    'resource_type',
    'intent_stage',
    'full_name',
    'email',
    'mobile_number',
    'postcode',
    'transmission',
    'help_with',
    'message',
    'status',
    'notes'
  ];

  if (!sheet) {
    // If the first tab is an empty default sheet (often gid=0), reuse it so data
    // appears where the owner is already looking.
    const firstSheet = ss.getSheets()[0];
    const hasAnyData = firstSheet.getLastRow() > 1 || firstSheet.getLastColumn() > 1;
    if (!hasAnyData) {
      firstSheet.setName(SHEET_NAME);
      sheet = firstSheet;
      sheet.clear();
      sheet.appendRow(headers);
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(headers);
    }
  } else {
    // Do not clear lead data if header order changes; just rewrite row 1.
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  // Ensure header row is frozen for visibility.
  sheet.setFrozenRows(1);

  return sheet;
}

function sendOwnerNotification_(timestamp, data) {
  const isFreePdf = data.form_type === 'free_pdf';
  const subject = isFreePdf
    ? 'New Free PDF Lead - Pass Faster UK'
    : data.form_type === 'waitlist_request'
      ? 'New Waitlist Request - Pass Faster UK'
      : 'New Support Request - Pass Faster UK';

  const lines = [
    'New form submission received:',
    '',
    `Timestamp: ${timestamp.toISOString()}`,
    `Form type: ${data.form_type}`,
    `Source page: ${data.source_page}`,
    `Full name: ${data.full_name}`,
    `Email: ${data.email}`,
    `Mobile: ${data.mobile_number || '-'}`,
    `Postcode: ${data.postcode || '-'}`,
    `Transmission: ${data.transmission || '-'}`,
    `Help with: ${data.help_with || '-'}`,
    `Message: ${data.message || '-'}`,
    `Resource type: ${data.resource_type || '-'}`,
    `Intent stage: ${data.intent_stage || '-'}`
  ];

  MailApp.sendEmail({
    to: OWNER_EMAIL,
    subject,
    body: lines.join('\n'),
    replyTo: data.email || OWNER_EMAIL,
    name: 'Pass Faster UK Leads'
  });
}

function sendUserConfirmation_(data) {
  if (!data.email) return;

  if (data.form_type === 'free_pdf') {
    MailApp.sendEmail({
      to: data.email,
      subject: 'Your Free Pass Faster UK Revision Guide',
      body: [
        `Hi ${data.full_name || 'there'},`,
        '',
        'Thanks for requesting your free Pass Faster UK revision guide.',
        'Your download page is ready:',
        `${SITE_BASE_URL}/thank-you-free-pdf.html`,
        '',
        `You can also visit ${SITE_BASE_URL} for mock tests and learner support.`,
        '',
        'Pass Faster UK'
      ].join('\n')
    });
    return;
  }

  MailApp.sendEmail({
    to: data.email,
    subject: "We've received your request - Pass Faster UK",
    body: [
      `Hi ${data.full_name || 'there'},`,
      '',
      'Thanks for your support request. We have received your details.',
      'Our team will review your stage and recommend your best next step.',
      '',
      'Useful links while you wait:',
      `${SITE_BASE_URL}/free-resources.html`,
      `${SITE_BASE_URL}/mock-theory-test.html`,
      '',
      'Pass Faster UK'
    ].join('\n')
  });
}

function getRedirectUrl_(submittedNextUrl, fallbackPath) {
  const fallback = `${SITE_BASE_URL}${fallbackPath}`;
  const url = String(submittedNextUrl || '').trim();
  if (!url) return fallback;

  const allowedPrefixes = [
    SITE_BASE_URL,
    'http://localhost:4173',
    'http://127.0.0.1:4173'
  ];

  const isAllowed = allowedPrefixes.some((prefix) => url.indexOf(prefix) === 0);
  return isAllowed ? url : fallback;
}

function renderRedirect(url) {
  return HtmlService.createHtmlOutput(`<!doctype html>
<html><head>
<meta charset="utf-8" />
<meta http-equiv="refresh" content="0; url=${url}" />
<title>Redirecting...</title>
</head><body>
<p>Redirecting... <a href="${url}">Continue</a></p>
<script>window.location.replace(${JSON.stringify(url)});</script>
</body></html>`);
}

function renderError(message) {
  const safeMessage = String(message || 'Something went wrong. Please try again in a moment.');
  return HtmlService.createHtmlOutput(`<!doctype html>
<html><head>
<meta charset="utf-8" />
<title>Submission Error</title>
<style>body{font-family:Arial,sans-serif;padding:24px;line-height:1.5}a{display:inline-block;margin-top:12px}</style>
</head><body>
<h1>Submission error</h1>
<p>${safeMessage}</p>
<p><a href="${SITE_BASE_URL}">Return to website</a></p>
</body></html>`);
}
