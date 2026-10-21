import React, { useState, useEffect } from 'react';
import {
  Key,
  Zap,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Send,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import {
  getSmsGatewayConfig,
  activateFast2SmsKey,
  isFast2SmsLive,
  dispatchRealOtpToPhone,
  playSmsIncomingSound,
  type SmsGatewayConfig
} from '../utils/smsService';
import { triggerConfetti } from './CelebrationConfetti';

interface AdminFast2SmsBarProps {
  onShowToast: (msg: string) => void;
  onOpenAdvancedModal: () => void;
  onOpenHostingerModal?: () => void;
}

export const AdminFast2SmsBar: React.FC<AdminFast2SmsBarProps> = ({
  onShowToast,
  onOpenAdvancedModal,
  onOpenHostingerModal
}) => {
  const [config, setConfig] = useState<SmsGatewayConfig>(getSmsGatewayConfig());
  const [apiKeyInput, setApiKeyInput] = useState<string>(config.fast2smsApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isLive, setIsLive] = useState<boolean>(isFast2SmsLive());
  const [isSaving, setIsSaving] = useState(false);
  const [testPhone, setTestPhone] = useState('9876543210');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Sync state whenever external changes happen
  useEffect(() => {
    const handleStorageChange = () => {
      const cfg = getSmsGatewayConfig();
      setConfig(cfg);
      setApiKeyInput(cfg.fast2smsApiKey || '');
      setIsLive(isFast2SmsLive());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleActivateLive = (keyToSave?: string) => {
    const key = (keyToSave !== undefined ? keyToSave : apiKeyInput).trim();
    if (!key) {
      onShowToast('कृपया Fast2SMS API Key दर्ज करें (Please enter Fast2SMS API Key)');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const updated = activateFast2SmsKey(key);
      setConfig(updated);
      setIsLive(true);
      setIsSaving(false);
      triggerConfetti('medium');
      playSmsIncomingSound();
      onShowToast('🎉 Fast2SMS API Key सक्रिय हो गई! WhatsApp OTP Service अब 🟢 LIVE है!');
    }, 300);
  };

  const handleQuickKeyChange = (val: string) => {
    setApiKeyInput(val);
    // Instant live activation when a valid key (>=10 chars) is pasted/typed
    if (val.trim().length >= 10 && !isLive) {
      const updated = activateFast2SmsKey(val.trim());
      setConfig(updated);
      setIsLive(true);
      triggerConfetti('small');
      onShowToast('⚡ Fast2SMS API Key detect hote hi WhatsApp OTP Service 🟢 LIVE ho gayi!');
    }
  };

  const handleSendTestOtp = async () => {
    if (!apiKeyInput.trim()) {
      onShowToast('पहले Fast2SMS API Key दर्ज करें!');
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    const testOtp = String(Math.floor(1000 + Math.random() * 9000));

    try {
      const res = await dispatchRealOtpToPhone({
        phone: testPhone,
        otp: testOtp,
        fast2smsKey: apiKeyInput.trim(),
        provider: 'fast2sms'
      });
      triggerConfetti('small');
      setTestResult(`✅ Test OTP (${testOtp}) dispatched via ${res.channelUsed}!`);
      onShowToast(`Test OTP sent to ${testPhone}!`);
    } catch (err: any) {
      setTestResult(`⚠️ Dispatch note: ${err.message || 'OTP triggered'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden ring-1 ring-amber-500/20">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Zap className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Fast2SMS API &amp; Live WhatsApp OTP Service
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black uppercase tracking-wider">
                Admin Exclusive (केवल एडमिन)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              API Key dalte hi customer ke liye WhatsApp Login OTP service turant 🟢 LIVE ho jati hai.
            </p>
          </div>
        </div>

        {/* Live Status Indicator Pill */}
        <div className="flex items-center gap-2 shrink-0">
          {isLive ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 text-xs font-bold shadow-lg shadow-emerald-500/10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>🟢 LIVE: WhatsApp OTP Service Active</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/50 text-amber-300 text-xs font-bold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
              </span>
              <span>🟡 STANDBY: API Key Required to Go Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* API Key Input Section */}
        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Fast2SMS Authorization API Key</span>
              {isLive && (
                <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Live Connected
                </span>
              )}
            </label>
            <a
              href="https://www.fast2sms.com/dashboard/dev-api"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px] underline underline-offset-2"
            >
              Get Free Key at fast2sms.com <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative flex items-center">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => handleQuickKeyChange(e.target.value)}
              placeholder="Paste Fast2SMS API Key yahan dalein (jaise: X7K9L2M4P0Q1...)"
              className="w-full pl-3.5 pr-28 py-3 bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-2xl text-white font-mono text-xs sm:text-sm placeholder:text-slate-600 outline-none transition"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                title={showKey ? 'Hide Key' : 'Show Key'}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => handleActivateLive()}
                disabled={isSaving || !apiKeyInput.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isSaving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                )}
                <span>{isLive ? 'Update & Live' : 'Go Live Now'}</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            💡 <strong className="text-slate-200">Tip:</strong> API Key paste karte hi service turant live ho jati hai. Customers login page par WhatsApp OTP receive karenge.
          </p>
        </div>

        {/* Quick Test & Verification Box */}
        <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quick Test Dispatch</span>
            </span>
            <div className="flex items-center gap-2">
              {onOpenHostingerModal && (
                <button
                  type="button"
                  onClick={onOpenHostingerModal}
                  className="text-[11px] text-purple-300 hover:text-purple-200 underline font-semibold"
                >
                  Hostinger Guide 🚀
                </button>
              )}
              <button
                type="button"
                onClick={onOpenAdvancedModal}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
              >
                Settings &rarr;
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="10-digit mobile"
              className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl text-white text-xs font-mono outline-none"
            />
            <button
              type="button"
              onClick={handleSendTestOtp}
              disabled={isTesting || !apiKeyInput.trim()}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition disabled:opacity-40 flex items-center gap-1 shrink-0"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Test OTP</span>
            </button>
          </div>

          {testResult && (
            <p className="text-[10px] text-emerald-400 font-mono animate-fade-in truncate">
              {testResult}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
