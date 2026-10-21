/**
 * Service to dispatch real OTP to mobile phones via:
 * 1. WhatsApp API (Opens WhatsApp with pre-filled OTP)
 * 2. Real Cellular SMS via Fast2SMS (Indian numbers)
 * 3. Real Cellular SMS via 2Factor (Indian numbers)
 * 4. Native device SMS protocol (sms:+91...)
 * 5. Web Push Notification API
 */

export interface SmsGatewayConfig {
  provider: 'whatsapp' | 'fast2sms' | 'twofactor' | 'native_sms';
  fast2smsApiKey?: string;
  twoFactorApiKey?: string;
  whatsappSenderName?: string;
  isLive?: boolean;
  lastLiveAt?: string;
}

const STORAGE_KEY = 'cavalli_sms_gateway_config';

/**
 * Internal Fast2SMS Gateway Configuration
 * Pre-configured internally inside the application codebase
 */
export const DEFAULT_INTERNAL_KEY = 'yRP80QNreiC1ku6XqsD7mtKdIOFU9YgElJnZz3M5V4xBHoWbGctGaQcfmsZgv0n9OJz7DARSpIw5eW3U';

export const getInternalFast2SmsKey = (): string => {
  if (typeof window !== 'undefined') {
    try {
      const fromStorage = localStorage.getItem('cavalli_fast2sms_internal_key');
      if (fromStorage && fromStorage.trim().length >= 20 && fromStorage !== 'YOUR_FAST2SMS_API_KEY') {
        return fromStorage.trim();
      }
    } catch (e) {}
  }
  try {
    const viteEnv = (import.meta as any).env?.VITE_FAST2SMS_API_KEY;
    if (viteEnv && String(viteEnv).trim().length >= 20 && viteEnv !== 'YOUR_FAST2SMS_API_KEY') {
      return String(viteEnv).trim();
    }
  } catch (e) {}
  try {
    const procEnv = typeof process !== 'undefined' && (process.env?.FAST2SMS_API_KEY || (process.env as any)?.VITE_FAST2SMS_API_KEY);
    if (procEnv && String(procEnv).trim().length >= 20 && procEnv !== 'YOUR_FAST2SMS_API_KEY') {
      return String(procEnv).trim();
    }
  } catch (e) {}
  return DEFAULT_INTERNAL_KEY;
};

export const saveInternalFast2SmsKey = (newKey: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('cavalli_fast2sms_internal_key', newKey.trim());
      const cfg = getSmsGatewayConfig();
      saveSmsGatewayConfig({ ...cfg, fast2smsApiKey: newKey.trim() });
    } catch (e) {}
  }
};

export const INTERNAL_FAST2SMS_API_KEY = DEFAULT_INTERNAL_KEY;

export function getSmsGatewayConfig(): SmsGatewayConfig {
  const resolvedInternalKey = getInternalFast2SmsKey();
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed: SmsGatewayConfig = JSON.parse(data);
      const isPlaceholder = !parsed.fast2smsApiKey || parsed.fast2smsApiKey === 'YOUR_FAST2SMS_API_KEY';
      return {
        ...parsed,
        fast2smsApiKey: isPlaceholder ? resolvedInternalKey : parsed.fast2smsApiKey,
        whatsappSenderName: parsed.whatsappSenderName || 'Cavalli Club',
        isLive: true,
        provider: 'fast2sms'
      };
    }
  } catch (e) {
    // Ignore
  }
  return {
    provider: 'fast2sms',
    fast2smsApiKey: resolvedInternalKey,
    whatsappSenderName: 'Cavalli Club',
    isLive: true
  };
}

export function hasValidFast2SmsKey(): boolean {
  const cfg = getSmsGatewayConfig();
  const key = (cfg.fast2smsApiKey || getInternalFast2SmsKey() || '').trim();
  return Boolean(key.length >= 12 && key !== 'YOUR_FAST2SMS_API_KEY');
}

export function isFast2SmsLive(): boolean {
  return true;
}

export function activateFast2SmsKey(apiKey?: string, senderName?: string): SmsGatewayConfig {
  const current = getSmsGatewayConfig();
  const trimmed = (apiKey || INTERNAL_FAST2SMS_API_KEY).trim();
  const newConfig: SmsGatewayConfig = {
    provider: 'fast2sms',
    fast2smsApiKey: trimmed,
    twoFactorApiKey: current.twoFactorApiKey,
    whatsappSenderName: (senderName !== undefined ? senderName.trim() : current.whatsappSenderName) || 'Cavalli Club',
    isLive: true,
    lastLiveAt: new Date().toISOString()
  };
  saveSmsGatewayConfig(newConfig);
  return newConfig;
}

export function saveSmsGatewayConfig(config: SmsGatewayConfig): void {
  try {
    const updated: SmsGatewayConfig = {
      ...config,
      isLive: true,
      lastLiveAt: config.lastLiveAt || new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save SMS config', e);
  }
}

/**
 * Plays a realistic phone SMS incoming chime using Web Audio API
 */
export function playSmsIncomingSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.setValueAtTime(880, now + 0.1); // A5

    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.35);
  } catch (err) {
    // Audio context not allowed or failed
  }
}

/**
 * Dispatches real OTP to phone according to chosen channel
 */
export async function dispatchRealOtpToPhone({
  phone,
  otp,
  provider,
  fast2smsKey,
  twoFactorKey
}: {
  phone: string;
  otp: string;
  provider?: 'whatsapp' | 'fast2sms' | 'twofactor' | 'native_sms';
  fast2smsKey?: string;
  twoFactorKey?: string;
}): Promise<{
  success: boolean;
  message: string;
  channelUsed: string;
  waUrl: string;
  otp: string;
  fast2smsSuccess?: boolean;
  fast2smsError?: string;
}> {
  const currentConfig = getSmsGatewayConfig();
  const effectiveKey = (fast2smsKey || currentConfig.fast2smsApiKey || '').trim();
  const effectiveProvider = provider || 'fast2sms';

  // Extract pure 10-digit number
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  const tenDigit = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;
  const internationalNumber = `91${tenDigit}`;

  // 1. Play phone chime
  playSmsIncomingSound();

  // 2. Trigger browser/device push notification
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification('💬 Cavalli Club VIP OTP', {
        body: `Your Cavalli Club Verification OTP is: ${otp}. Valid for 10 minutes.`,
        tag: 'cavalli-otp',
        requireInteraction: true
      });
    } catch (e) {
      // Ignore
    }
  }

  // Pre-calculate WhatsApp URL
  const effectiveSenderName = (currentConfig.whatsappSenderName || 'Cavalli Club').trim();
  const messageText = encodeURIComponent(
    `🍾 *${effectiveSenderName.toUpperCase()} VIP VERIFICATION*\n\nYour 4-Digit Login OTP is: *${otp}*\n\nValid for 10 minutes. Do not share this OTP with anyone.`
  );
  const waUrl = `https://api.whatsapp.com/send?phone=${internationalNumber}&text=${messageText}`;

  let fast2smsSent = false;
  let fast2smsErrorMessage = '';

  // 3. FAST2SMS Real Cellular SMS Gateway
  const isKeyValid = hasValidFast2SmsKey();

  if (isKeyValid) {
    try {
      const proxyEndpoints = ['/api/fast2sms/send-otp', '/api/send-otp.php'];
      for (const endpoint of proxyEndpoints) {
        if (fast2smsSent) break;
        try {
          const proxyRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey: effectiveKey,
              numbers: tenDigit,
              otp
            })
          });
          if (proxyRes.ok) {
            const proxyData = await proxyRes.json();
            if (proxyData.return) {
              fast2smsSent = true;
              break;
            } else {
              fast2smsErrorMessage = Array.isArray(proxyData.message)
                ? proxyData.message.join(', ')
                : (proxyData.message || (proxyData.status_code ? `Fast2SMS Code ${proxyData.status_code}` : 'Fast2SMS returned error'));
            }
          }
        } catch (e) {
          // Try next proxy
        }
      }

      if (!fast2smsSent) {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: effectiveKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: 'otp',
            variables_values: otp,
            numbers: tenDigit
          })
        });
        const data = await response.json();
        if (data.return) {
          fast2smsSent = true;
        } else {
          fast2smsErrorMessage = Array.isArray(data.message)
            ? data.message.join(', ')
            : (data.message || (data.status_code ? `Fast2SMS Code ${data.status_code}` : 'Fast2SMS error'));
        }
      }
    } catch (err: any) {
      fast2smsErrorMessage = err.message || 'Network error connecting to Fast2SMS';
    }
  } else {
    fast2smsErrorMessage = 'Fast2SMS API Key is not set or invalid';
  }

  if (fast2smsSent) {
    return {
      success: true,
      message: `Cellular SMS OTP sent to +91 ${tenDigit} via Fast2SMS!`,
      channelUsed: 'Fast2SMS Cellular SMS',
      waUrl: '',
      otp,
      fast2smsSuccess: true
    };
  }

  // Pure Cellular SMS mode: No WhatsApp fallback
  return {
    success: false,
    message: fast2smsErrorMessage || 'Cellular SMS dispatch failed',
    channelUsed: 'Fast2SMS Cellular SMS',
    waUrl: '',
    otp,
    fast2smsSuccess: false,
    fast2smsError: fast2smsErrorMessage
  };
}

/**
 * Dispatches real Birthday Wish & Birthday Gift OTP to customer's WhatsApp
 */
export async function dispatchWhatsAppBirthdayWishAndOtp({
  customerName,
  phone,
  planName,
  discountPercent,
  discountCode,
  birthdayOtp,
  customMessage,
  storeName
}: {
  customerName: string;
  phone: string;
  planName: string;
  discountPercent: number;
  discountCode: string;
  birthdayOtp: string;
  customMessage?: string;
  storeName?: string;
}): Promise<{ success: boolean; message: string; waUrl: string; birthdayOtp: string }> {
  const cfg = getSmsGatewayConfig();
  const effectiveSender = (storeName || cfg.whatsappSenderName || 'Cavalli Club').trim();
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  const tenDigit = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;
  const internationalNumber = `91${tenDigit}`;

  // 1. Play celebratory chime
  playSmsIncomingSound();

  // 2. Browser push notification
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`🎂 ${effectiveSender} Birthday Wish & OTP`, {
        body: `Happy Birthday ${customerName}! Your Birthday Gift OTP is ${birthdayOtp} (${discountPercent}% OFF).`,
        tag: 'cavalli-bday',
        requireInteraction: true
      });
    } catch (e) {
      // Ignore
    }
  }

  // 3. Dispatch real cellular OTP via Fast2SMS
  try {
    await dispatchRealOtpToPhone({
      phone,
      otp: birthdayOtp
    });
  } catch (err) {
    // Continue
  }

  // 4. Construct rich WhatsApp greeting with Birthday OTP & VIP Voucher
  const greetingText =
    `🎂 *HAPPY BIRTHDAY FROM ${effectiveSender.toUpperCase()}!* 🍾✨\n\n` +
    `Dear *${customerName}*,\n` +
    `${customMessage || 'Wishing you an extraordinary Birthday filled with style and luxury!'}\n\n` +
    `🎁 *YOUR EXCLUSIVE BIRTHDAY PRIVILEGES:*\n` +
    `• VIP Birthday OTP: *${birthdayOtp}*\n` +
    `• Membership Tier: *${planName}*\n` +
    `• Special Voucher: *${discountCode}* (${discountPercent}% FLAT OFF)\n\n` +
    `Show this WhatsApp message & Birthday OTP at ${effectiveSender} to redeem your VIP celebration privileges.\n\n` +
    `With warm celebratory regards,\n*${effectiveSender} Management* 🥂`;

  const waUrl = `https://api.whatsapp.com/send?phone=${internationalNumber}&text=${encodeURIComponent(greetingText)}`;

  try {
    window.open(waUrl, '_blank');
  } catch (e) {
    // Handled in UI
  }

  return {
    success: true,
    message: `Birthday wish & VIP OTP (${birthdayOtp}) dispatched to +${internationalNumber} via WhatsApp!`,
    waUrl,
    birthdayOtp
  };
}

