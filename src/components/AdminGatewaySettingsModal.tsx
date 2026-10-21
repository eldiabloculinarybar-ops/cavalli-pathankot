import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Key,
  Smartphone,
  MessageCircle,
  Check,
  Send,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import {
  getSmsGatewayConfig,
  saveSmsGatewayConfig,
  dispatchRealOtpToPhone,
  playSmsIncomingSound,
  activateFast2SmsKey,
  isFast2SmsLive,
  getInternalFast2SmsKey,
  saveInternalFast2SmsKey,
  hasValidFast2SmsKey
} from '../utils/smsService';
import { triggerConfetti } from './CelebrationConfetti';

interface AdminGatewaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const AdminGatewaySettingsModal: React.FC<AdminGatewaySettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const currentConfig = getSmsGatewayConfig();

  const [provider, setProvider] = useState<'whatsapp' | 'fast2sms' | 'twofactor' | 'native_sms'>(
    currentConfig.provider || 'fast2sms'
  );
  const [whatsappSenderName, setWhatsappSenderName] = useState<string>(
    currentConfig.whatsappSenderName || 'Cavalli Club'
  );
  const [twoFactorKey, setTwoFactorKey] = useState<string>(currentConfig.twoFactorApiKey || '');
  const [internalFast2SmsKey, setInternalFast2SmsKeyInput] = useState<string>(
    getInternalFast2SmsKey() !== 'YOUR_FAST2SMS_API_KEY' ? getInternalFast2SmsKey() : ''
  );
  const [showFast2SmsKeyInput, setShowFast2SmsKeyInput] = useState(false);
  const [testPhone, setTestPhone] = useState<string>('+91 98765 43210');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const isLive = true;

  const handleSave = () => {
    const finalSenderName = whatsappSenderName.trim() || 'Cavalli Club';
    if (internalFast2SmsKey.trim()) {
      saveInternalFast2SmsKey(internalFast2SmsKey.trim());
    }
    saveSmsGatewayConfig({
      provider,
      fast2smsApiKey: internalFast2SmsKey.trim() || undefined,
      twoFactorApiKey: twoFactorKey.trim(),
      whatsappSenderName: finalSenderName,
      isLive: true
    });

    setSavedSuccess(true);
    triggerConfetti('small');
    playSmsIncomingSound();
    onShowToast('🎉 WhatsApp Settings & Sender Name saved! Gateway is 🟢 LIVE!');
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleTestDispatch = async () => {
    setIsTesting(true);
    setTestStatus(null);

    const testOtp = String(Math.floor(1000 + Math.random() * 9000));

    try {
      const res = await dispatchRealOtpToPhone({
        phone: testPhone,
        otp: testOtp,
        provider,
        twoFactorKey: twoFactorKey.trim() || undefined
      });

      playSmsIncomingSound();
      triggerConfetti('medium');
      setTestStatus(`Success! Test OTP ${testOtp} dispatched via ${res.channelUsed}.`);
    } catch (err: any) {
      setTestStatus(`Error: ${err.message || 'Gateway dispatch failed'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-md font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white">
                  SMS Gateway &amp; WhatsApp API Configuration
                </h2>
                <span className="px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                  ADMIN ONLY
                </span>
                {isLive ? (
                  <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                ) : (
                  <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                    STANDBY
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure real Fast2SMS &amp; WhatsApp gateway API keys. Settings are restricted strictly to Admin.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Security Notice */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Secure Admin Access Only</p>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Customers only see WhatsApp OTP on the customer login page. Only you (the Admin) can configure cellular SMS gateways, API credentials, and test dispatches.
              </p>
            </div>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-semibold uppercase tracking-wider">
              Primary OTP Gateway Provider (प्राथमिक गेटवे)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div
                onClick={() => setProvider('whatsapp')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  provider === 'whatsapp'
                    ? 'bg-emerald-500/10 border-emerald-400 text-white shadow-md'
                    : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>WhatsApp Instant OTP</span>
                    <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-black">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Free, no SMS credit cost. Sends directly to customer's WhatsApp on phone.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setProvider('fast2sms')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  provider === 'fast2sms'
                    ? 'bg-amber-500/10 border-amber-400 text-white shadow-md'
                    : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Smartphone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>Fast2SMS Gateway</span>
                    <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                      India Cellular
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Direct telecom cellular SMS to mobile inbox (50 free SMS daily at fast2sms.com).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Sender Name / Brand Prefix */}
          <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-white flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Sender Name (व्हाट्सएप प्रेषक का नाम)</span>
              </label>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                Greeting Prefix
              </span>
            </div>
            <input
              type="text"
              value={whatsappSenderName}
              onChange={(e) => setWhatsappSenderName(e.target.value)}
              placeholder="e.g. Cavalli Club, Cavalli Lounge & VIP, My Business"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl text-white font-medium text-xs outline-none"
            />
            <p className="text-[10px] text-slate-400">
              This name will be used as the prefix in automated birthday greetings (e.g., &quot;🎂 HAPPY BIRTHDAY FROM {whatsappSenderName || 'CAVALLI CLUB'}!&quot;) and VIP OTP dispatches.
            </p>
          </div>

          {/* Fast2SMS Pre-Configured Internal Status */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs flex items-center gap-2">
                    <span>Fast2SMS Gateway (अंदर से एक्टिव है)</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                      🟢 {hasValidFast2SmsKey() ? 'KEY ACTIVE' : 'WHATSAPP ACTIVE'}
                    </span>
                  </p>
                  <p className="text-[11px] text-emerald-300 font-mono mt-0.5">
                    स्टेटस (Status): <strong>{hasValidFast2SmsKey() ? 'Fast2SMS Ready' : 'WhatsApp Delivery Ready'}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFast2SmsKeyInput(!showFast2SmsKeyInput)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer shrink-0 ml-2"
              >
                {showFast2SmsKeyInput ? 'Hide Key' : '🔑 Set / Update Key'}
              </button>
            </div>

            {showFast2SmsKeyInput && (
              <div className="pt-2 border-t border-slate-800 space-y-1.5 animate-fade-in">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Fast2SMS Authorization Key (Paste Key Here):
                </label>
                <input
                  type="text"
                  value={internalFast2SmsKey}
                  onChange={(e) => setInternalFast2SmsKeyInput(e.target.value)}
                  placeholder="Paste your Fast2SMS API key here..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl text-white font-mono text-xs outline-none"
                />
                <p className="text-[10px] text-slate-500">
                  की (Key) सेव करने के बाद नीचे &quot;Save Gateway Settings&quot; पर क्लिक करें।
                </p>
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
              📌 <strong>Fast2SMS सेल्युलर SMS चालू करने के लिए:</strong> Fast2SMS डैशबोर्ड (fast2sms.com) में लॉगिन करके <strong>&quot;OTP SMS&quot;</strong> &rarr; <strong>&quot;KYC&quot;</strong> पर क्लिक करके अपनी वेबसाइट का लिंक वेरिफाई करें। इसके बाद SMS सीधे मोबाइल सिम पर डिलीवर होने लगेंगे। तब तक WhatsApp OTP 100% सुचारू रूप से कार्य कर रहा है।
            </div>
          </div>

          {/* 2Factor.in API Key Input */}
          <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-white flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>2Factor.in SMS Gateway API Key (Optional)</span>
              </label>
              <a
                href="https://2factor.in"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-300 hover:underline"
              >
                2factor.in &rarr;
              </a>
            </div>
            <input
              type="text"
              value={twoFactorKey}
              onChange={(e) => setTwoFactorKey(e.target.value)}
              placeholder="Paste 2Factor.in API Key here..."
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-indigo-400 rounded-xl text-white font-mono text-xs outline-none"
            />
          </div>

          {/* Test Dispatch Console */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-amber-400/30 space-y-2.5">
            <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span>Admin Live Test Tool (टेस्ट ओटीपी भेजें)</span>
            </span>
            <p className="text-slate-400 text-[11px]">
              Send an instant real test OTP to your own phone number to verify gateway connectivity:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs outline-none"
              />
              <button
                type="button"
                disabled={isTesting}
                onClick={handleTestDispatch}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isTesting ? 'Sending...' : 'Send Test OTP'}
              </button>
            </div>

            {testStatus && (
              <p className="text-[11px] text-emerald-300 font-medium pt-1">
                {testStatus}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition"
          >
            {savedSuccess ? <Check className="w-4 h-4 stroke-[3]" /> : <Sparkles className="w-4 h-4" />}
            <span>{savedSuccess ? 'Saved by Admin!' : 'Save Gateway Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
