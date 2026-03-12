# Pass Faster UK Website

Production-ready static multi-page website for the Pass Faster UK learner-driver support platform.

## Core stack
- HTML pages (11 core pages + checkout/thank-you flows)
- Shared stylesheet: `styles.css`
- Shared script: `main.js`
- Runtime config: `site-config.js`

## Key pages
- `index.html`
- `theory-test.html`
- `mock-theory-test.html`
- `hazard-perception.html`
- `practical-test.html`
- `free-resources.html`
- `pass-pack.html`
- `driving-lessons.html`
- `intensive-courses.html`
- `contact.html`
- `faq.html`

## Conversion flow pages
- `checkout.html`
- `order-confirmed.html`
- `thank-you-contact.html`
- `thank-you-resources.html`
- `thank-you-lessons.html`
- `thank-you-intensive.html`
- `thank-you.html` (generic fallback)

## Configuration
Edit `site-config.js`:
- `siteUrl`
- `contactEmail`
- `contactPhone`
- `formEndpoint`
- `ga4Id`

## Forms
Forms are structured to support easy integration with:
- FormSubmit (default current setup)
- Formspree
- Netlify Forms
- Custom backend endpoint

All forms include:
- semantic labels
- required validation
- submit feedback message
- configurable redirect via `data-next`

## SEO files
- `robots.txt`
- `sitemap.xml`

## Launch notes
Use `LAUNCH-CHECKLIST.md` for final credential and deployment steps.
