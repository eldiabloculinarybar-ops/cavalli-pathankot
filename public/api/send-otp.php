<?php
/**
 * Hostinger PHP API Proxy for Fast2SMS OTP Dispatch
 * Handles CORS and sends server-to-server request to Fast2SMS Bulk V2 API.
 */

// Allow CORS from your frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'return' => false,
        'message' => ['Method Not Allowed. Use POST.']
    ]);
    exit();
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    http_response_code(400);
    echo json_encode([
        'return' => false,
        'message' => ['Invalid JSON payload.']
    ]);
    exit();
}

$defaultApiKey = 'yRP80QNreiC1ku6XqsD7mtKdIOFU9YgElJnZz3M5V4xBHoWbGctGaQcfmsZgv0n9OJz7DARSpIw5eW3U';
$apiKey = trim($data['apiKey'] ?? '');
if (empty($apiKey) || $apiKey === 'YOUR_FAST2SMS_API_KEY') {
    $apiKey = $defaultApiKey;
}
$numbers = trim($data['numbers'] ?? '');
$otp = trim($data['otp'] ?? '');

if (empty($numbers) || empty($otp)) {
    http_response_code(400);
    echo json_encode([
        'return' => false,
        'message' => ['numbers and otp are required parameters.']
    ]);
    exit();
}

// Clean phone number (extract last 10 digits)
$cleanPhone = preg_replace('/[^0-9]/', '', $numbers);
if (strlen($cleanPhone) > 10) {
    $cleanPhone = substr($cleanPhone, -10);
}

$type = strtolower(trim($data['type'] ?? 'whatsapp'));
$messageId = trim($data['messageId'] ?? '43436');
$phoneNumberId = trim($data['phoneNumberId'] ?? '129819433551498');

if ($type === 'whatsapp') {
    // Fast2SMS WhatsApp Business API
    $waUrl = 'https://www.fast2sms.com/dev/whatsapp?message_id=' . urlencode($messageId) .
             '&phone_number_id=' . urlencode($phoneNumberId) .
             '&numbers=' . urlencode($cleanPhone) .
             '&variables_values=' . urlencode((string)$otp);

    $ch = curl_init($waUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'authorization: ' . $apiKey
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
} else {
    // Send request to Fast2SMS Bulk V2 API via cURL
    $ch = curl_init('https://www.fast2sms.com/dev/bulkV2');

    $payload = json_encode([
        'route' => 'otp',
        'variables_values' => (string)$otp,
        'numbers' => (string)$cleanPhone
    ]);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'authorization: ' . $apiKey,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
}

if ($response === false) {
    http_response_code(502);
    echo json_encode([
        'return' => false,
        'message' => ['Fast2SMS gateway connection failed: ' . $curlError]
    ]);
    exit();
}

http_response_code($httpCode >= 200 && $httpCode < 300 ? 200 : $httpCode);
echo $response;
?>
