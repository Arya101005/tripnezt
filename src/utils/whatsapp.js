import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

// Vercel API URL (for free tier)
const VERCEL_API_URL = import.meta.env.VITE_VERCEL_API_URL || '';

/**
 * Send a WhatsApp message to a lead using WhatsApp Business API
 * 
 * @param {string} phoneNumber - The recipient's phone number (with country code)
 * @param {string} message - The message to send
 * @param {string} templateName - Optional template name for default messages
 * @returns {Promise<Object>} Response with success status and messageId
 */
export const sendWhatsAppMessage = async (phoneNumber, message, templateName = null) => {
  // Try Vercel API first (free tier), fall back to Firebase functions
  if (VERCEL_API_URL) {
    try {
      const response = await fetch(`${VERCEL_API_URL}/api/send-whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, message, templateName }),
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return await response.json();
    } catch (error) {
      console.error('Vercel API Error, falling back to Firebase:', error);
    }
  }
  
  // Fall back to Firebase functions
  try {
    const sendMessage = httpsCallable(functions, 'sendWhatsAppMessage');
    const result = await sendMessage({ phoneNumber, message, templateName });
    return result.data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

/**
 * Send a pre-approved template message
 * 
 * @param {string} phoneNumber - The recipient's phone number
 * @param {string} templateName - The name of the approved template
 * @param {string} languageCode - Template language code (default: 'en')
 * @param {Array} components - Template components (buttons, parameters, etc.)
 * @returns {Promise<Object>} Response with success status and messageId
 */
export const sendTemplateMessage = async (phoneNumber, templateName, languageCode = 'en', components = []) => {
  try {
    const sendTemplate = httpsCallable(functions, 'sendTemplateMessage');
    const result = await sendTemplate({ phoneNumber, templateName, languageCode, components });
    return result.data;
  } catch (error) {
    console.error('Error sending template message:', error);
    throw error;
  }
};

/**
 * Check the status of a sent message
 * 
 * @param {string} messageId - The message ID returned from send operations
 * @returns {Promise<Object>} Response with message status
 */
export const getMessageStatus = async (messageId) => {
  try {
    const getStatus = httpsCallable(functions, 'getMessageStatus');
    const result = await getStatus({ messageId });
    return result.data;
  } catch (error) {
    console.error('Error getting message status:', error);
    throw error;
  }
};

/**
 * Pre-defined message templates for common scenarios
 */
export const MESSAGE_TEMPLATES = {
  welcome: {
    name: 'welcome',
    text: `Namaste {name}! 🙏

Greetings from *Tripnezt* - Your Trusted Travel Partner!

Thank you for your interest in our travel packages.

How can I assist you today?

*Why Choose Tripnezt?*
✓ Authentic India Experiences
✓ Best Prices Guaranteed
✓ 24/7 Support
✓ Verified Local Partners

Looking forward to plan your next adventure! 🌍✈️`
  },
  
  booking_confirmed: {
    name: 'booking_confirmed',
    text: `🎉 Your booking has been confirmed!

Dear {name},

Thank you for choosing Tripnezt for your travel adventure.

*Booking Details:*
📍 Trip: {tripName}
📅 Date: {date}
👥 Guests: {guests}

We will send you detailed information shortly.

For any queries, feel free to reach out!`
  },

  payment_reminder: {
    name: 'payment_reminder',
    text: `💰 Payment Reminder

Dear {name},

This is a friendly reminder regarding your pending payment for {tripName}.

*Amount Due: {amount}*

Please complete the payment to confirm your booking.

If you have any questions, please let us know!`
  },

  trip_reminder: {
    name: 'trip_reminder',
    text: `✈️ Trip Reminder

Dear {name},

Your exciting journey ({tripName}) is just around the corner!

📅 Departure: {date}
📍 Meeting Point: {location}

*Please ensure:*
✓ All travel documents are ready
✓ Payment is completed
✓ Packing is done

See you soon! 🌍`
  },

  follow_up: {
    name: 'follow_up',
    text: `👋 Following up on your inquiry

Dear {name},

We wanted to check if you have any questions about our travel packages.

Our team is here to help you plan the perfect trip!

*Special Offer:* Book within 48 hours and get 10% off on select packages.

Feel free to reach out!`
  },

  custom: {
    name: 'custom',
    text: ''
  }
};

/**
 * Format phone number for WhatsApp API
 * 
 * @param {string} phone - Raw phone number
 * @returns {string} Formatted phone number with country code
 */
export const formatPhoneForWhatsApp = (phone) => {
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
};

/**
 * Send a quick message from Admin Leads panel
 * 
 * @param {Object} lead - Lead object containing phone and name
 * @param {string} templateKey - Template key from MESSAGE_TEMPLATES
 * @param {Object} customData - Data to replace placeholders in template
 * @returns {Promise<Object>} Result of the send operation
 */
export const sendLeadMessage = async (lead, templateKey, customData = {}) => {
  const template = MESSAGE_TEMPLATES[templateKey];
  
  if (!template) {
    throw new Error(`Template '${templateKey}' not found`);
  }

  let message = template.text;
  
  // Replace placeholders with actual data
  Object.keys(customData).forEach(key => {
    message = message.replace(new RegExp(`{${key}}`, 'g'), customData[key]);
  });

  const phoneNumber = formatPhoneForWhatsApp(lead.whatsappNumber || lead.phoneNumber);
  
  return await sendWhatsAppMessage(phoneNumber, message, template.name);
};
