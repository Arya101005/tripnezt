# WhatsApp Business API Setup Guide

This guide explains how to set up WhatsApp Business API to send messages directly from your Tripnezt website using the business account number (8150040327) that your friend added.

## Prerequisites

1. **WhatsApp Business Account** - Your friend must have added 8150040327 as a WhatsApp Business number
2. **Meta Business Account** - You need access to Meta Business Manager
3. **Firebase Project** - Already set up for your Tripnezt website
4. **Firebase CLI** - Installed and configured on your machine

---

## Step 1: Get WhatsApp Business Credentials from Your Friend

Your friend needs to provide you with the following information:

### From Meta Business Suite:
1. **Phone Number ID** - Found in WhatsApp > Phone Numbers > API Setup
2. **WhatsApp Business Account ID** - Found in WhatsApp > Account > Business Information
3. **Access Token** - Created in Meta for Developers > My Apps > Tools > Access Token Tool

**Important:** Your friend should create a permanent access token with these permissions:
- `whatsapp_business_management`
- `whatsapp_business_messaging`

---

## Step 2: Set Up Firebase Cloud Functions

### Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### Login to Firebase
```bash
firebase login
```

### Initialize Firebase Functions (if not already done)
```bash
cd functions
npm install
firebase init functions
```

Select your Firebase project when prompted.

---

## Step 3: Configure WhatsApp Credentials

### Option 1: Using Firebase CLI (Recommended)
```bash
firebase functions:config:set whatsapp.access_token="YOUR_ACCESS_TOKEN"
firebase functions:config:set whatsapp.phone_number_id="YOUR_PHONE_NUMBER_ID"
firebase functions:config:set whatsapp.business_account_id="YOUR_BUSINESS_ACCOUNT_ID"
```

### Option 2: Using Environment Variables
Add to your `.env` file:
```
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```

---

## Step 4: Deploy Cloud Functions

```bash
firebase deploy --only functions
```

This will deploy the following functions:
- `sendWhatsAppMessage` - Send text messages
- `sendTemplateMessage` - Send template messages
- `getMessageStatus` - Check message delivery status
- `syncMessageStatus` - Auto-sync message status (runs every 5 minutes)

---

## Step 5: Configure Firebase for Functions

Make sure your `firebase.json` includes functions configuration:

```json
{
  "functions": {
    "source": "functions"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{
      "source": "/api/**",
      "function": "api"
    }]
  }
}
```

---

## Step 6: Verify Frontend Integration

Your Tripnezt website now has:

1. **Two WhatsApp buttons in Admin Leads:**
   - **"Send API"** - Sends messages directly from your business account (requires setup)
   - **"Web"** - Opens WhatsApp Web with pre-filled message (works without setup)

2. **Message Templates:**
   - Welcome message
   - Booking confirmation
   - Payment reminder
   - Trip reminder
   - Follow-up message
   - Custom message

---

## Step 7: Test the Integration

1. Go to Admin Dashboard > Leads
2. Click **"Send API"** on any lead
3. Select a template and click **Send Message**
4. Check if the message is delivered to the lead's WhatsApp

---

## Troubleshooting

### "WhatsApp Business credentials not configured"
- Run the `firebase functions:config:set` commands again
- Verify the credentials are correct

### "Failed to send message" error
- Check if the phone number is valid (must include country code)
- Verify the access token hasn't expired
- Check Firebase Functions logs: `firebase functions:log`

### Messages not delivered
- Check Meta Business Manager for any restrictions
- Ensure the phone number is verified
- Check if template messages need approval

---

## Costs

- **WhatsApp Business API:** Free for initiation, $0.0147 per template message sent
- **Firebase Cloud Functions:** Free tier includes 2M invocations/month
- **Firebase Storage:** Free tier includes 5GB storage

---

## Security Notes

1. **Never expose access tokens in frontend code** - All API calls go through Cloud Functions
2. **Restrict function access** - Currently configured to require authentication
3. **Monitor usage** - Check Firebase Console for function invocation logs
4. **Rotate tokens regularly** - Access tokens expire, create new ones in Meta for Developers

---

## Getting Help

- **Firebase Functions Docs:** https://firebase.google.com/docs/functions
- **WhatsApp Business API Docs:** https://developers.facebook.com/docs/whatsapp
- **Meta for Developers:** https://developers.facebook.com/

---

## Quick Reference: Required Credentials

| Credential | Where to Find | Example |
|------------|---------------|---------|
| Access Token | Meta for Developers > My Apps > Tools | EAA...long_string... |
| Phone Number ID | WhatsApp > Phone Numbers > API Setup | 123456789012345 |
| Business Account ID | WhatsApp > Account > Business Info | 987654321098765 |

**Contact your friend to get these credentials before proceeding with deployment.**
