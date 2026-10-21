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
