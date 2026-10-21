<?php
/**
 * Hostinger Root Entry & Forwarder
 * If the user uploaded the whole repository into public_html without extracting dist/,
 * this script automatically serves the compiled dist/index.html or displays clear instructions.
 */

// 1. If compiled dist/ exists, serve the Single Page App directly
if (file_exists(__DIR__ . '/dist/index.html')) {
    $requestUri = $_SERVER['REQUEST_URI'] ?? '/';
    
    // Check if requesting static assets inside dist/
    $distFilePath = __DIR__ . '/dist' . strtok($requestUri, '?');
    if (file_exists($distFilePath) && !is_dir($distFilePath)) {
        $ext = pathinfo($distFilePath, PATHINFO_EXTENSION);
        $mimeTypes = [
            'js' => 'application/javascript',
            'css' => 'text/css',
            'svg' => 'image/svg+xml',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'json' => 'application/json',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2'
        ];
        if (isset($mimeTypes[$ext])) {
            header('Content-Type: ' . $mimeTypes[$ext]);
        }
        readfile($distFilePath);
        exit;
    }

    // Serve main HTML
    include __DIR__ . '/dist/index.html';
    exit;
}

// 2. If dist/ is missing, show a helpful Hostinger message
?>
<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cavalli Club - Hostinger Deployment Setup</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 1rem; max-width: 600px; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
        h1 { color: #38bdf8; font-size: 1.5rem; margin-top: 0; }
        .badge { background: #0284c7; color: white; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: bold; }
        ol { padding-left: 1.2rem; line-height: 1.8; color: #cbd5e1; }
        code { background: #0f172a; color: #f43f5e; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-size: 0.85rem; }
        .tip { background: #064e3b; border: 1px solid #059669; padding: 1rem; border-radius: 0.5rem; color: #a7f3d0; margin-top: 1rem; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="card">
        <h1>🚀 Hostinger Deployment Notice <span class="badge">Next Step</span></h1>
        <p>Aapne website files ko Hostinger <code>public_html</code> me upload kiya hai.</p>
        <p>Website live karne ke do aasan tarike hain:</p>
        <ol>
            <li><strong>Sabse Simple Tarika (2 minute):</strong><br>
                Apne computer pe <code>npm run build</code> chalayein. Jo <code>dist</code> folder banega, uske andar ke saare files ko Hostinger ke <code>public_html</code> folder me direct upload karein (dist folder ke andar ke files, poora project nahi).
            </li>
            <li><strong>Hostinger Node.js Application me:</strong><br>
                Hostinger hPanel &rarr; <strong>Node.js</strong> &rarr; Application Startup File me <code>server.js</code> likhein aur Run Build dabayein.
            </li>
        </ol>
        <div class="tip">
            💡 <strong>Note:</strong> Agar aapne <code>dist</code> folder bhi upload kiya hai, toh <code>public_html</code> ke andar <code>dist</code> folder se files nikal kar seedhe <code>public_html</code> me rakh dein.
        </div>
    </div>
</body>
</html>
