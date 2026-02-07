# WhatsApp Business Credentials - Guide for Your Friend

Your friend needs to follow these steps to get the credentials needed for your Tripnezt website to send WhatsApp messages automatically.

---

## Step 1: Access Meta Business Suite

1. Go to **business.facebook.com**
2. Log in with the account that has the WhatsApp Business number (8150040327)
3. Click on **All Tools** → **WhatsApp** from the left menu

---

## Step 2: Get Phone Number ID

1. In WhatsApp, go to **Phone Numbers** tab
2. Find the number **8150040327**
3. Click on the **API Setup** tab
4. Copy the **Phone Number ID** (a long number like `123456789012345`)
5. **Send this to your developer**

---

## Step 3: Get WhatsApp Business Account ID

1. In WhatsApp, go to **Account** → **Business Information**
2. Copy the **WhatsApp Business Account ID**
3. **Send this to your developer**

---

## Step 4: Create Access Token

### Option A: Using Meta for Developers (Easiest)

1. Go to **developers.facebook.com**
2. Log in with the same Facebook account
3. Click **My Apps** → **Create App** (if not already created)
4. Select **Business** as app type
5. Once app is created, go to **Settings** → **Advanced** → **Security**
6. Scroll down to **Access Token Tool** or go to: `https://developers.facebook.com/tools/explorer/`

**In the Graph API Explorer:**
1. Select your app from the dropdown
2. Click **Add Permission** → select:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
3. Click **Generate Access Token**
4. Copy the **User Access Token** (starts with `EAA...`)
5. **Send this to your developer**

### Option B: Create a System User Token (More Permanent)

1. Go to **business.facebook.com**
2. Click **Settings** → **Users** → **System Users**
3. Click **Add** → Create a new system user
4. Assign these roles:
   - **WhatsApp Business Manager** app
   - **Admin** role on WhatsApp Business Account
5. After creating, click **Generate Token**
6. Copy the **System User Access Token**
7. **Send this to your developer**

---

## Quick Reference - What to Send

Your friend needs to send you these **3 items**:

| Credential | Where to Find | Example |
|------------|---------------|---------|
| **1. Access Token** | Meta for Developers > Graph API Explorer | `EAA...` (very long string) |
| **2. Phone Number ID** | WhatsApp > Phone Numbers > API Setup | `123456789012345` |
| **3. Business Account ID** | WhatsApp > Account > Business Info | `987654321098765` |

---

## Developer Will Run These Commands

Once you send the credentials, your developer will run:

```bash
firebase functions:config:set \
  whatsapp.access_token="YOUR_ACCESS_TOKEN" \
  whatsapp.phone_number_id="YOUR_PHONE_NUMBER_ID" \
  whatsapp.business_account_id="YOUR_BUSINESS_ACCOUNT_ID"

firebase deploy --only functions
```

---

## Important Notes

✅ **Your friend should:**
- Use the same Facebook account that owns the WhatsApp Business number
- Generate a token with both `whatsapp_business_management` and `whatsapp_business_messaging` permissions
- Keep the token secure - don't share publicly

❌ **Your friend should NOT:**
- Share their Facebook password
- Share tokens in public channels
- Use temporary test tokens

---

## Troubleshooting

**"Token doesn't have required permissions"**
→ Make sure to add both permissions in Graph API Explorer

**"Phone number not found"**
→ The account needs to be the owner of the WhatsApp Business number

**"Access denied"**
→ Your friend needs admin access to the WhatsApp Business Account

---

## Need Help?

- **Meta for Developers:** https://developers.facebook.com/docs/whatsapp
- **Firebase Functions:** https://firebase.google.com/docs/functions
