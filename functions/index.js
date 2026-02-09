const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

// WhatsApp Business API Configuration
const WHATSAPP_CONFIG = {
  version: 'v18.0',
  baseUrl: 'https://graph.facebook.com',
};

// Environment variables for WhatsApp Business credentials
const getWhatsAppCredentials = () => ({
  accessToken: functions.config().whatsapp?.access_token || process.env.WHATSAPP_ACCESS_TOKEN,
  phoneNumberId: functions.config().whatsapp?.phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID,
  businessAccountId: functions.config().whatsapp?.business_account_id || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
});

/**
 * Send WhatsApp message using WhatsApp Business API
 * 
 * Required environment variables (set via firebase functions:set):
 * - whatsapp.access_token: Meta Access Token
 * - whatsapp.phone_number_id: WhatsApp Phone Number ID
 * - whatsapp.business_account_id: WhatsApp Business Account ID
 */
exports.sendWhatsAppMessage = functions.https.onCall(async (data, context) => {
  console.log('sendWhatsAppMessage called with data:', JSON.stringify(data));
  console.log('Auth UID:', context.auth?.uid);
  
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to send WhatsApp messages'
    );
  }

  const { phoneNumber, message, templateName } = data;

  // Validate input
  if (!phoneNumber) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Phone number is required'
    );
  }

  if (!message && !templateName) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Message or template name is required'
    );
  }

  const credentials = getWhatsAppCredentials();
  console.log('Phone Number ID:', credentials.phoneNumberId ? 'set' : 'NOT SET');
  console.log('Access Token:', credentials.accessToken ? 'set (' + credentials.accessToken.substring(0, 20) + '...)' : 'NOT SET');

  if (!credentials.accessToken || !credentials.phoneNumberId) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'WhatsApp Business credentials not configured. Please set up environment variables.'
    );
  }

  try {
    // Format phone number (remove any non-digits and add country code if needed)
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log('Sending to phone:', formattedPhone);

    // Prepare message payload
    const messagePayload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'text',
      text: { body: message || generateDefaultMessage(templateName) }
    };

    // Send message via WhatsApp Business API
    const response = await axios.post(
      `${WHATSAPP_CONFIG.baseUrl}/${WHATSAPP_CONFIG.version}/${credentials.phoneNumberId}/messages`,
      messagePayload,
      {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('WhatsApp API response:', JSON.stringify(response.data));

    // Log the message to Firestore for tracking
    const messageLog = {
      phoneNumber: formattedPhone,
      message: message || generateDefaultMessage(templateName),
      messageId: response.data.messages[0].id,
      sentBy: context.auth.uid,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'sent',
      templateName: templateName || null
    };

    await admin.firestore().collection('whatsappMessages').add(messageLog);

    return {
      success: true,
      messageId: response.data.messages[0].id
    };

  } catch (error) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
    console.error('Full error:', error.toString());

    // Log failed attempt
    await admin.firestore().collection('whatsappMessages').add({
      phoneNumber,
      message: message || generateDefaultMessage(templateName),
      sentBy: context.auth.uid,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'failed',
      error: error.response?.data?.error?.message || error.message
    });

    throw new functions.https.HttpsError(
      'internal',
      'Failed to send WhatsApp message: ' + (error.response?.data?.error?.message || error.message)
    );
  }
});

/**
 * Send template message (pre-approved templates)
 */
exports.sendTemplateMessage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to send template messages'
    );
  }

  const { phoneNumber, templateName, languageCode, components } = data;

  if (!phoneNumber || !templateName) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Phone number and template name are required'
    );
  }

  const credentials = getWhatsAppCredentials();

  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);

    const messagePayload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode || 'en' },
        components: components || []
      }
    };

    const response = await axios.post(
      `${WHATSAPP_CONFIG.baseUrl}/${WHATSAPP_CONFIG.version}/${credentials.phoneNumberId}/messages`,
      messagePayload,
      {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Log template message
    await admin.firestore().collection('whatsappMessages').add({
      phoneNumber: formattedPhone,
      templateName,
      messageId: response.data.messages[0].id,
      sentBy: context.auth.uid,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'sent',
      type: 'template'
    });

    return {
      success: true,
      messageId: response.data.messages[0].id
    };

  } catch (error) {
    console.error('Template Message Error:', error.response?.data || error.message);
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send template message'
    );
  }
});

/**
 * Get message status from WhatsApp Business API
 */
exports.getMessageStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  const { messageId } = data;

  if (!messageId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Message ID is required'
    );
  }

  const credentials = getWhatsAppCredentials();

  try {
    const response = await axios.get(
      `${WHATSAPP_CONFIG.baseUrl}/${WHATSAPP_CONFIG.version}/${messageId}`,
      {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`
        }
      }
    );

    return {
      success: true,
      status: response.data.status
    };

  } catch (error) {
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get message status'
    );
  }
});

/**
 * Scheduled function to sync message status (runs every 5 minutes)
 */
exports.syncMessageStatus = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  const credentials = getWhatsAppCredentials();

  if (!credentials.accessToken) {
    console.log('WhatsApp credentials not configured, skipping sync');
    return null;
  }

  try {
    // Get messages with status 'sent' that haven't been checked recently
    const pendingMessages = await admin.firestore()
      .collection('whatsappMessages')
      .where('status', '==', 'sent')
      .orderBy('sentAt', 'desc')
      .limit(100)
      .get();

    const batch = admin.firestore().batch();

    for (const doc of pendingMessages.docs) {
      const messageData = doc.data();
      
      if (messageData.messageId) {
        try {
          const response = await axios.get(
            `${WHATSAPP_CONFIG.baseUrl}/${WHATSAPP_CONFIG.version}/${messageData.messageId}`,
            {
              headers: {
                'Authorization': `Bearer ${credentials.accessToken}`
              }
            }
          );

          const newStatus = response.data.status;
          
          if (newStatus !== messageData.status) {
            batch.update(doc.ref, {
              status: newStatus,
              lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            });
          }
        } catch (error) {
          console.log(`Failed to sync message ${messageData.messageId}`);
        }
      }
    }

    await batch.commit();
    return null;

  } catch (error) {
    console.error('Error syncing message statuses:', error);
    return null;
  }
});

// Helper function to format phone numbers
function formatPhoneNumber(phone) {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present (assuming India +91 if starts with 6-9)
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  // Add + if not present
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

// Helper function to generate default messages based on template name
function generateDefaultMessage(templateName) {
  const templates = {
    'welcome': 'Namaste! 🙏\n\nGreetings from Tripnezt - Your Trusted Travel Partner!\n\nThank you for your interest in our travel packages.\n\nHow can I assist you today?',
    'booking_confirmed': 'Your booking has been confirmed! 🎉\n\nThank you for choosing Tripnezt for your travel adventure.\n\nWe will send you detailed information shortly.',
    'payment_reminder': 'Payment Reminder 💰\n\nThis is a friendly reminder regarding your pending payment.\n\nPlease let us know if you have any questions.',
    'trip_reminder': 'Trip Reminder ✈️\n\nYour exciting journey is just around the corner!\n\nPlease ensure all your travel documents are ready.',
    'follow_up': 'Following up on your inquiry 👋\n\nWe wanted to check if you have any questions about our travel packages.\n\nFeel free to reach out!'
  };

  return templates[templateName] || templates['welcome'];
}
