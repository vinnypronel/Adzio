# GoHighLevel Webhook Integration Guide

This document outlines the current setup for the Adzio contact/assessment quiz integration with GoHighLevel (GHL) and details how to manage or deploy it in the future.

---

## 🚀 Status: Integration Complete

The multi-step assessment quiz on both the **Home** (`index.html`) and **Services** (`services.html`) pages is now fully integrated with GoHighLevel via an **Inbound Webhook**. 

All form values are captured, formatted to match GHL dropdown options, and sent via an outbound API request from the user's browser.

---

## 📂 Code Reference

* **Source File**: [`js/main.js`](./js/main.js) (Line 880 onwards)
* **Webhook URL**: `https://services.leadconnectorhq.com/hooks/0NOG0PbsEDx8HtLNhpXY/webhook-trigger/ab7a6108-f2f9-482f-859b-bb7edea11140`

### Mapped Payload Structure
To prevent matching errors in GoHighLevel, raw slug values from the HTML inputs are mapped to the exact dropdown text choices set up in the GHL Custom Fields:

```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "(555) 123-4567",
  "email": "john@example.com",
  "website": "www.yourbusiness.com",
  "business": "I'm just getting started and need customers.",
  "service": "Meta Ad Management", // Or list: "Multiple Services: Meta Ad Management, Website Development"
  "revenue": "$10,000 – $25,000",
  "timeline": "Immediately",
  "message": "We want to scale our leads next quarter."
}
```

---

## 📋 What to Do When Launching the Site

When you are ready to publish the website live:

1. **Deploy/Upload the Updated Code**: Ensure that the latest copy of [`js/main.js`](./js/main.js) is uploaded to your hosting provider (e.g., Vercel, Netlify, GoDaddy, Hostinger).
2. **Nothing Else is Required**: Because the integration communicates directly with GoHighLevel's cloud webhook URL, the form will function exactly the same on the live domain as it did during local testing.

---

## 🔄 How to Change or Swap the Webhook in the Future

If you ever need to connect a different GoHighLevel account, Zapier, or another CRM:

1. Open [`js/main.js`](./js/main.js) in your text editor.
2. Locate the `submitQuizForm()` function (around line 880).
3. Find the `fetch` statement:
   ```javascript
   const response = await fetch('https://services.leadconnectorhq.com/hooks/0NOG0PbsEDx8HtLNhpXY/webhook-trigger/ab7a6108-f2f9-482f-859b-bb7edea11140', {
   ```
4. Replace the URL with your new Webhook URL.
5. Save, commit, and redeploy the file.
