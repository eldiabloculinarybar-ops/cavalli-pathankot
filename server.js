import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const DEFAULT_FAST2SMS_KEY = 'yRP80QNreiC1ku6XqsD7mtKdIOFU9YgElJnZz3M5V4xBHoWbGctGaQcfmsZgv0n9OJz7DARSpIw5eW3U';

// Fast2SMS API Proxy to avoid browser CORS issues on Hostinger
app.post('/api/fast2sms/send-otp', async (req, res) => {
  try {
    const { apiKey, numbers, otp } = req.body || {};
    const effectiveKey = (apiKey && apiKey !== 'YOUR_FAST2SMS_API_KEY') ? apiKey : (process.env.FAST2SMS_API_KEY || DEFAULT_FAST2SMS_KEY);
    if (!numbers || !otp) {
      return res.status(400).json({
        return: false,
        message: 'Missing required fields: numbers, otp'
      });
    }

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: effectiveKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: String(otp),
        numbers: String(numbers).replace(/[^0-9]/g, '').slice(-10)
      })
    });

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({
      return: false,
      message: err?.message || 'Fast2SMS proxy dispatch error'
    });
  }
});

// Fast2SMS Official WhatsApp Business API Proxy
app.post('/api/fast2sms/send-whatsapp-otp', async (req, res) => {
  try {
    const { apiKey, numbers, otp, messageId, phoneNumberId } = req.body || {};
    const effectiveKey = (apiKey && apiKey !== 'YOUR_FAST2SMS_API_KEY') ? apiKey : (process.env.FAST2SMS_API_KEY || DEFAULT_FAST2SMS_KEY);
    const effectivePhoneId = phoneNumberId || '129819433551498';
    const effectiveMsgId = messageId || '43436';
    const cleanNumbers = String(numbers || '').replace(/[^0-9]/g, '').slice(-10);

    if (!cleanNumbers || !otp) {
      return res.status(400).json({
        return: false,
        message: 'Missing required fields: numbers, otp'
      });
    }

    // Try Fast2SMS WhatsApp Template API
    const fast2smsUrl = `https://www.fast2sms.com/dev/whatsapp?message_id=${effectiveMsgId}&phone_number_id=${effectivePhoneId}&numbers=${cleanNumbers}&variables_values=${otp}`;
    const response = await fetch(fast2smsUrl, {
      method: 'GET',
      headers: {
        authorization: effectiveKey
      }
    });

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({
      return: false,
      message: err?.message || 'Fast2SMS WhatsApp API dispatch error'
    });
  }
});

// Get Fast2SMS WABA Status and Templates
app.get('/api/fast2sms/whatsapp-details', async (req, res) => {
  try {
    const apiKey = (req.query.apiKey && typeof req.query.apiKey === 'string') ? req.query.apiKey : (process.env.FAST2SMS_API_KEY || DEFAULT_FAST2SMS_KEY);
    const response = await fetch('https://www.fast2sms.com/dev/dlt_manager/whatsapp?type=template&phone_number_id=129819433551498', {
      headers: {
        authorization: apiKey
      }
    });
    const data = await response.json();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.message || 'Failed to fetch Fast2SMS WABA details'
    });
  }
});

// Serve static assets from 'dist' folder or current directory
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.use(express.static(__dirname));

// Single Page Application (SPA) routing fallback for React
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'index.html'), (err2) => {
        if (err2) {
          res.status(404).send('Build files not found. Please run: npm run build');
        }
      });
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Hostinger Server] Listening on http://0.0.0.0:${PORT}`);
});
