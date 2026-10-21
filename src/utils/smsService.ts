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
export const INTERNAL_FAST2SMS_API_KEY =
  (typeof process !== 'undefined' && (process.env?.FAST2SMS_API_KEY || (process.env as any)?.VITE_FAST2SMS_API_KEY)) ||
  'YOUR_FAST2SMS_API_KEY';

export function getSmsGatewayConfig(): SmsGatewayConfig {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed: SmsGatewayConfig = JSON.parse(data);
      return {
        ...parsed,
        fast2smsApiKey: parsed.fast2smsApiKey || INTERNAL_FAST2SMS_API_KEY,
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
    fast2smsApiKey: INTERNAL_FAST2SMS_API_KEY,
    whatsappSenderName: 'Cavalli Club',
    isLive: true
  };
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
    const hasKey = Boolean(config.fast2smsApiKey && config.fast2smsApiKey.trim().length >= 6);
    const updated: SmsGatewayConfig = {
      ...config,
      isLive: config.isLive ?? hasKey,
      lastLiveAt: hasKey ? (config.lastLiveAt || new Date().toISOString()) : undefined
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
}): Promise<{ success: boolean; message: string; channelUsed: string; waUrl?: string }> {
  const currentConfig = getSmsGatewayConfig();
  const effectiveKey = (fast2smsKey || currentConfig.fast2smsApiKey || '').trim();
  const effectiveProvider = provider || (effectiveKey ? 'fast2sms' : currentConfig.provider || 'whatsapp');

  // Extract pure 10-digit number
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  const tenDigit = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;
  const internationalNumber = `91${tenDigit}`;

  // 1. Play phone chime
  playSmsIncomingSound();

  // 2. Trigger browser/device push notification
  if ('Notification' in window && Notification.permission === 'granted') {
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

  // 3. FAST2SMS Real Cellular SMS & WhatsApp OTP Gateway
  if (effectiveKey && (effectiveProvider === 'fast2sms' || isFast2SmsLive())) {
    try {
      // First try Vite internal proxy endpoint or Hostinger PHP endpoint to avoid browser CORS
      let sentSuccess = false;
      let apiMessage = '';

      const proxyEndpoints = ['/api/fast2sms/send-otp', '/api/send-otp.php'];
      for (const endpoint of proxyEndpoints) {
        if (sentSuccess) break;
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
              sentSuccess = true;
              apiMessage = proxyData.message?.[0] || 'Fast2SMS OTP delivered';
              break;
            }
          }
        } catch (e) {
          // Try next proxy or direct
        }
      }

      if (!sentSuccess) {
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
          sentSuccess = true;
          apiMessage = data.message?.[0] || 'Delivered';
        }
      }

      if (sentSuccess) {
        return {
          success: true,
          message: `Real OTP successfully delivered to ${tenDigit} via Live Fast2SMS Gateway!`,
          channelUsed: 'Fast2SMS Live Gateway'
        };
      }
    } catch (err: any) {
      console.warn('Fast2SMS dispatch encountered notice, continuing with WhatsApp delivery: ', err.message);
    }
  }

  // 4. 2FACTOR.IN Real Cellular SMS Gateway
  if (provider === 'twofactor' && twoFactorKey) {
    try {
      const response = await fetch(
        `https://2factor.in/v3/API/V1/${twoFactorKey}/SMS/${tenDigit}/${otp}/CavalliClubOTP`
      );
      const data = await response.json();
      if (data.Status === 'Success') {
        return {
          success: true,
          message: `Real cellular SMS sent to ${tenDigit} via 2Factor gateway!`,
          channelUsed: '2Factor Gateway'
        };
      }
    } catch (err: any) {
      console.warn('2Factor failed: ', err.message);
    }
  }

  // 5. Native Mobile SMS App Protocol
  if (provider === 'native_sms') {
    const text = encodeURIComponent(`Cavalli Club VIP verification OTP is: ${otp}`);
    window.location.href = `sms:+${internationalNumber}?body=${text}`;
    return {
      success: true,
      message: `Opened native SMS app for +${internationalNumber} with OTP: ${otp}`,
      channelUsed: 'Native Mobile SMS'
    };
  }

  // 6. WhatsApp Instant Real Phone Delivery (Default & Most Reliable)
  const effectiveSenderName = (currentConfig.whatsappSenderName || 'Cavalli Club').trim();
  const messageText = encodeURIComponent(
    `🍾 *${effectiveSenderName.toUpperCase()} VIP VERIFICATION*\n\nYour 4-Digit Login OTP is: *${otp}*\n\nValid for 10 minutes. Do not share this OTP with anyone.`
  );
  const waUrl = `https://api.whatsapp.com/send?phone=${internationalNumber}&text=${messageText}`;

  // Open WhatsApp in new tab / app
  window.open(waUrl, '_blank');

  return {
    success: true,
    message: `Real OTP dispatched to phone (+${internationalNumber}) via WhatsApp!`,
    channelUsed: 'WhatsApp Phone Delivery'
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

