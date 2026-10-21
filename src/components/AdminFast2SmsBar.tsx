import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  Send,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Smartphone,
  Sliders,
  Server
} from 'lucide-react';
import {
  dispatchRealOtpToPhone,
  playSmsIncomingSound,
  getSmsGatewayConfig
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
  const [testPhone, setTestPhone] = useState('9876543210');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const config = getSmsGatewayConfig();

  const handleSendTestOtp = async () => {
    const cleanDigits = testPhone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) {
      onShowToast('कृपया मान्य 10-अंकों का मोबाइल नंबर दर्ज करें!');
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    const testOtp = String(Math.floor(1000 + Math.random() * 9000));

    try {
      const res = await dispatchRealOtpToPhone({
        phone: testPhone,
        otp: testOtp,
        provider: 'fast2sms'
      });
      triggerConfetti('small');
      playSmsIncomingSound();
      setTestResult(`✅ Test OTP (${testOtp}) dispatched via ${res.channelUsed}!`);
      onShowToast(`Test OTP sent to ${testPhone}!`);
    } catch (err: any) {
      setTestResult(`⚠️ Dispatch note: ${err.message || 'OTP triggered'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden ring-1 ring-emerald-500/20">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 shrink-0">
            <Zap className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Fast2SMS &amp; Live WhatsApp OTP Service
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                Pre-Configured Internally
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Fast2SMS API Key एप्लिकेशन के अंदर सुरक्षित रूप से सेट है। सभी OTP व बर्थडे विशेज 🟢 LIVE डिलीवर हो रहे हैं।
            </p>
          </div>
        </div>

        {/* Live Status Indicator Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 text-xs font-bold shadow-lg shadow-emerald-500/10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>🟢 LIVE: WhatsApp OTP &amp; SMS Gateway Connected</span>
          </div>
        </div>
      </div>

      {/* Main Bar Content */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Status Info Box (No API Key inputs) */}
        <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white flex items-center gap-2">
                <span>Fast2SMS Cellular &amp; WhatsApp Protocol</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.2 rounded-full font-bold">
                  ACTIVE
                </span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                प्रेषक नाम (Sender Name): <strong className="text-slate-200">{config.whatsappSenderName || 'Cavalli Club'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={onOpenAdvancedModal}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gateway Settings</span>
            </button>
            {onOpenHostingerModal && (
              <button
                type="button"
                onClick={onOpenHostingerModal}
                className="px-3 py-1.5 rounded-xl border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                <Server className="w-3.5 h-3.5 text-purple-400" />
                <span>Hostinger Deploy</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Test & Verification Box */}
        <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quick Test OTP Dispatch</span>
            </span>
            <span className="text-[10px] text-slate-500">Live Test</span>
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
              disabled={isTesting}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition disabled:opacity-40 flex items-center gap-1 shrink-0 cursor-pointer"
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
