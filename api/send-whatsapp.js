import axios from 'axios';

// WhatsApp Business API Configuration
const WHATSAPP_CONFIG = {
  version: 'v18.0',
  baseUrl: 'https://graph.facebook.com',
  timeout: 10000, // 10 second timeout
  maxRetries: 3, // Maximum retry attempts
  retryDelay: 1000, // Base delay between retries (ms)
};

// Rate limiting configuration
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 10; // Max requests per window per IP

// Get credentials from environment variables
const getWhatsAppCredentials = () => ({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
});

// Validate and sanitize phone number
function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }

  // Remove whitespace and special characters
  let cleaned = phone.trim().replace(/[\s\-()]/g, '');

  // Validate phone format
  if (!/^\d{10,15}$/.test(cleaned)) {
    return { valid: false, error: 'Invalid phone number format' };
  }

  return { valid: true, cleaned };
}

// Format phone number for WhatsApp API
function formatPhoneNumber(phone) {
  let cleaned = phone.replace(/\D/g, '');
  
  // Add Indian country code if 10-digit number
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  // Ensure it starts with country code
  if (!cleaned.startsWith('91') && cleaned.length > 10) {
    // Keep as is if already has country code
  }
  
  // Add + prefix for API
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

// Sanitize message content to prevent injection attacks
function sanitizeMessage(message) {
  if (!message || typeof message !== 'string') {
    return '';
  }
  
  // Remove potential harmful characters while preserving emojis and formatting
  return message
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .trim();
}

// Generate default message based on template name
function generateDefaultMessage(templateName) {
  const templates = {
    'welcome': 'Namaste! 🙏\n\nGreetings from Tripnezt - Your Trusted Travel Partner!\n\nThank you for your interest in our travel packages.\n\nHow can I assist you today?',
    'booking_confirmed': 'Your booking has been confirmed! 🎉\n\nThank you for choosing Tripnezt for your travel adventure.\n\nWe will send you detailed information shortly.',
    'payment_reminder': 'Payment Reminder 💰\n\nThis is a friendly reminder regarding your pending payment.\n\nPlease let us know if you have any questions.',
    'trip_reminder': 'Trip Reminder ✈️\n\nYour exciting journey is just around the corner!\n\nPlease ensure all your travel documents are ready.',
    'follow_up': 'Following up on your inquiry 👋\n\nWe wanted to check if you have any questions about our travel packages.\n\nFeel free to reach out!',
    'custom': 'Thank you for contacting Tripnezt!\n\nWe will get back to you shortly.\n\n- Tripnezt Team'
  };
  
  return templates[templateName] || templates['welcome'];
}

// Check rate limit for an IP
function checkRateLimit(ip) {
  const now = Date.now();
  const windowData = rateLimit.get(ip);
  
  if (!windowData || now - windowData.firstRequest > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { count: 1, firstRequest: now });
    return { allowed: true };
  }
  
  if (windowData.count >= MAX_REQUESTS_PER_WINDOW) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((windowData.firstRequest + RATE_LIMIT_WINDOW - now) / 1000) 
    };
  }
  
  windowData.count++;
  return { allowed: true };
}

// Sleep function for retry delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Exponential backoff retry logic
async function sendWithRetry(axiosInstance, url, payload, headers, maxRetries = WHATSAPP_CONFIG.maxRetries) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axiosInstance.post(url, payload, { headers });
      return response;
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      // Log retry attempt
      console.log(`Retry attempt ${attempt}/${maxRetries}:`, error.message);
      
      // Wait before next retry with exponential backoff
      if (attempt < maxRetries) {
        const delay = WHATSAPP_CONFIG.retryDelay * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

// Validate request body
function validateRequestBody(body) {
  const errors = [];
  
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }
  
  const { phoneNumber, message, templateName, templateData } = body;
  
  // Validate phone number
  if (!phoneNumber) {
    errors.push('Phone number is required');
  } else {
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.valid) {
      errors.push(phoneValidation.error);
    }
  }
  
  // Validate message content
  if (!message && !templateName) {
    errors.push('Message or template name is required');
  }
  
  if (message && typeof message !== 'string') {
    errors.push('Message must be a string');
  }
  
  if (message && message.length > 4096) {
    errors.push('Message too long (max 4096 characters)');
  }
  
  if (templateName && typeof templateName !== 'string') {
    errors.push('Template name must be a string');
  }
  
  if (templateName && !/^[a-z0-9_]+$/.test(templateName)) {
    errors.push('Invalid template name format (only lowercase letters, numbers, and underscores allowed)');
  }
  
  return { valid: errors.length === 0, errors };
}

export default async function handler(req, res) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Check rate limit (using X-Forwarded-For for Vercel deployments)
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  const rateLimitResult = checkRateLimit(clientIp);
  
  if (!rateLimitResult.allowed) {
    res.setHeader('Retry-After', rateLimitResult.retryAfter);
    return res.status(429).json({ 
      error: 'Too many requests',
      retryAfter: rateLimitResult.retryAfter
    });
  }
  
  // Validate request body
  const validation = validateRequestBody(req.body);
  if (!validation.valid) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: validation.errors
    });
  }
  
  try {
    const { phoneNumber, message, templateName, templateData } = req.body;
    
    const credentials = getWhatsAppCredentials();
    
    if (!credentials.accessToken || !credentials.phoneNumberId) {
      console.error('WhatsApp credentials not configured');
      return res.status(500).json({ 
        error: 'WhatsApp Business credentials not configured',
        hint: 'Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables'
      });
    }
    
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const sanitizedMessage = sanitizeMessage(message);
    const finalMessage = sanitizedMessage || generateDefaultMessage(templateName);
    
    // Determine message type and prepare payload
    let messagePayload;
    
    if (templateName && !message) {
      // Template message
      messagePayload = {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: templateData?.languageCode || 'en' },
          components: templateData?.components || []
        }
      };
    } else {
      // Text message
      messagePayload = {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: { body: finalMessage }
      };
    }
    
    // Create axios instance with timeout
    const axiosInstance = axios.create({
      timeout: WHATSAPP_CONFIG.timeout
    });
    
    // Send message with retry logic
    const response = await sendWithRetry(
      axiosInstance,
      `${WHATSAPP_CONFIG.baseUrl}/${WHATSAPP_CONFIG.version}/${credentials.phoneNumberId}/messages`,
      messagePayload,
      {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json'
      }
    );
    
    console.log('WhatsApp message sent successfully:', response.data.messages?.[0]?.id);
    
    res.json({
      success: true,
      messageId: response.data.messages?.[0]?.id,
      phone: formattedPhone,
      type: templateName ? 'template' : 'text'
    });

  } catch (error) {
    console.error('WhatsApp API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // Determine appropriate status code
    let statusCode = 500;
    let errorMessage = 'Failed to send WhatsApp message';
    let errorDetails = error.response?.data?.error?.message || error.message;
    
    if (error.response?.status === 400) {
      statusCode = 400;
      errorMessage = 'Invalid request to WhatsApp API';
    } else if (error.response?.status === 401) {
      statusCode = 401;
      errorMessage = 'WhatsApp API authentication failed';
      errorDetails = 'Access token may be expired or invalid';
    } else if (error.response?.status === 403) {
      statusCode = 403;
      errorMessage = 'WhatsApp API access denied';
      errorDetails = 'Check permissions for your WhatsApp Business account';
    } else if (error.response?.status === 404) {
      statusCode = 404;
      errorMessage = 'WhatsApp Business phone number not found';
      errorDetails = 'Verify the phone number ID is correct';
    } else if (error.code === 'ECONNABORTED') {
      statusCode = 504;
      errorMessage = 'WhatsApp API request timed out';
      errorDetails = 'Please try again';
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: errorDetails,
      ...(process.env.NODE_ENV === 'development' && { debug: error.message })
    });
  }
}
