# Pass Faster UK Launch Checklist

## 1) Domain and DNS
- Point your domain to hosting.
- Ensure HTTPS is active.
- Confirm `robots.txt` and `sitemap.xml` are publicly reachable.

## 2) Contact Details
- Keep email as `infopassfasteruk@gmail.com` or replace with your live inbox.

## 3) Forms (already wired)
- Current provider: FormSubmit (`formsubmit.co`).
- First submission requires inbox confirmation from FormSubmit.
- Form redirects now route by intent:
  - `thank-you-resources.html`
  - `thank-you-contact.html`
  - `thank-you-lessons.html`
  - `thank-you-intensive.html`
  - Checkout redirects to `order-confirmed.html`.

## 4) Bank Transfer Checkout (no Stripe)
- Checkout page: `/checkout.html`.
- Flow: user submits order request -> you send bank details -> confirm payment -> deliver product.
- Optional next step: add an automated payment-link provider (PayPal/SumUp/Revolut Business) later.

## 5) Analytics
- Open `site-config.js` and set `ga4Id`, for example:
  - `ga4Id: 'G-XXXXXXXXXX'`
- The site will auto-load GA4 and track CTA clicks/form submissions.

## 6) Optional Payment Automation (still bank-account friendly)
- Use bank-account payout providers with payment links:
  - PayPal Payment Links
  - SumUp Payment Links
  - Revolut Business Payment Links
- Set `checkoutLinks.starter` and `checkoutLinks.pro` in `site-config.js` to swap checkout links globally.

## 7) Final QA
- Test all nav links and footer links.
- Submit every form once on desktop/mobile.
- Verify thank-you redirects.
- Verify checkout enquiry arrives in email.
