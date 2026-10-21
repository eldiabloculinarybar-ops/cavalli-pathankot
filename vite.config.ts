import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

function fast2smsProxyPlugin(): Plugin {
  return {
    name: 'fast2sms-proxy-middleware',
    configureServer(server) {
      server.middlewares.use('/api/fast2sms/send-otp', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: Buffer) => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body || '{}');
            const { apiKey, numbers, otp } = parsed;
            if (!apiKey || !numbers || !otp) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ return: false, message: 'Missing required fields: apiKey, numbers, otp' }));
              return;
            }

            // Call real Fast2SMS API
            const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
              method: 'POST',
              headers: {
                authorization: apiKey,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                route: 'otp',
                variables_values: otp,
                numbers: String(numbers).slice(-10)
              })
            });

            const data = await response.json();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ return: false, message: err.message || 'Fast2SMS proxy dispatch error' }));
          }
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), fast2smsProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

