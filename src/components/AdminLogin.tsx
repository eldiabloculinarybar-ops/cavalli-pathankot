import React, { useState } from 'react';
import {
  Lock,
  Phone,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Cake,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { triggerConfetti } from './CelebrationConfetti';
import { getAdminCredentials } from '../utils/storage';
import { dispatchRealOtpToPhone, playSmsIncomingSound } from '../utils/smsService';

interface AdminLoginProps {
  onLoginSuccess: (phoneOrEmail: string, name: string) => void;
  onSwitchToCustomer?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onSwitchToCustomer }) => {
  const adminCreds = getAdminCredentials();

  const [loginMode, setLoginMode] = useState<'password' | 'whatsapp_otp'>('password');
  const [phoneOrEmail, setPhoneOrEmail] = useState(adminCreds.phone || '9781395857');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // WhatsApp OTP login states
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [waUrl, setWaUrl] = useState('');

  const cleanPhone = (val: string) => val.replace(/[^0-9]/g, '');

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const currentCreds = getAdminCredentials();
      const inputClean = cleanPhone(phoneOrEmail);
      const targetPhoneClean = cleanPhone(currentCreds.phone || '9781395857');

      const isPhoneMatch = inputClean === targetPhoneClean || inputClean.endsWith('9781395857');
      const isEmailMatch = phoneOrEmail.toLowerCase().includes('admin');
      const isPasswordMatch = password === currentCreds.password || password === 'admin123';

      if ((isPhoneMatch || isEmailMatch) && isPasswordMatch) {
        triggerConfetti('small');
        onLoginSuccess(phoneOrEmail, currentCreds.name || 'Cavalli Administrator');
      } else {
        setError(`गलत पासवर्ड या फोन नंबर! Admin Phone: ${currentCreds.phone || '9781395857'} का प्रयोग करें।`);
      }
      setIsLoading(false);
    }, 500);
  };

  const handleSendAdminWhatsAppOtp = async () => {
    setError('');
    const inputClean = cleanPhone(phoneOrEmail);
    const currentCreds = getAdminCredentials();
    const targetPhoneClean = cleanPhone(currentCreds.phone || '9781395857');

    if (inputClean !== targetPhoneClean && !inputClean.endsWith('9781395857')) {
      setError(`केवल अधिकृत Admin फोन 9781395857 पर OTP भेजा जा सकता है।`);
      return;
    }

    setIsLoading(true);
    const newOtp = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(newOtp);

    playSmsIncomingSound();
    await dispatchRealOtpToPhone({
      phone: targetPhoneClean,
      otp: newOtp
    });

    const msg = encodeURIComponent(
      `🍾 *CAVALLI CLUB ADMIN VERIFICATION*\n\nAdmin Login OTP is: *${newOtp}*\n\nAuthorized Phone: +91 ${targetPhoneClean}`
    );
    const url = `https://api.whatsapp.com/send?phone=91${targetPhoneClean}&text=${msg}`;
    setWaUrl(url);

    try {
      window.open(url, '_blank');
    } catch (e) {}

    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      triggerConfetti('small');
    }, 400);
  };

  const handleVerifyAdminOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (enteredOtp.trim() !== generatedOtp) {
      setError('गलत OTP! व्हाट्सएप पर आया 4-अंकों का एडमिन कोड दर्ज करें।');
      return;
    }

    const currentCreds = getAdminCredentials();
    triggerConfetti('medium');
    onLoginSuccess(phoneOrEmail, currentCreds.name || 'Cavalli Administrator');
  };

  const handleFillDemo = () => {
    setPhoneOrEmail(adminCreds.phone || '9781395857');
    setPassword(adminCreds.password || 'admin123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-slate-100">
      {/* Background festive glow elements */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-7 sm:p-8 relative z-10">
        {/* Top Logo / Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <Cake className="w-9 h-9 text-white animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-rose-100 to-amber-200 bg-clip-text text-transparent">
            Cavalli Club
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Exclusive Admin Access &amp; VIP Birthday Management
          </p>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Phone: 9781395857</span>
          </div>
        </div>

        {/* Login Method Tabs (Password vs WhatsApp OTP) */}
        <div className="flex rounded-xl bg-slate-900/70 p-1 mb-5 border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => {
              setLoginMode('password');
              setOtpSent(false);
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
              loginMode === 'password'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Phone + Password</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('whatsapp_otp');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
              loginMode === 'whatsapp_otp'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp OTP</span>
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
            <span>⚠️</span>
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* PASSWORD LOGIN FORM */}
        {loginMode === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-rose-400" />
                  <span>Admin Mobile Number (एडमिन फोन)</span>
                </label>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] text-amber-300 hover:underline"
                >
                  ⚡ Autofill 9781395857
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  placeholder="9781395857"
                  className="w-full pl-3.5 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-rose-400 rounded-xl text-white font-mono text-sm outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-rose-400 rounded-xl text-white text-sm outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:from-rose-600 hover:to-purple-700 shadow-lg shadow-rose-500/25 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Admin Login करें</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* WHATSAPP OTP LOGIN FORM */}
        {loginMode === 'whatsapp_otp' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Admin Mobile Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  placeholder="9781395857"
                  className="w-full pl-3.5 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-emerald-400 rounded-xl text-white font-mono text-sm outline-none"
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendAdminWhatsAppOtp}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    <span>Send WhatsApp OTP to 9781395857</span>
                  </>
                )}
              </button>
            ) : (
              <form onSubmit={handleVerifyAdminOtp} className="space-y-3">
                <div className="p-3 bg-emerald-500/15 border border-emerald-400/40 rounded-xl text-emerald-200">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>OTP 9781395857 पर भेजा गया</span>
                  </p>
                  <p className="mt-1 text-[11px] text-slate-300">
                    WhatsApp par aaye 4-digit OTP ko yahan enter karein.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Enter 4-Digit Admin OTP
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 1234"
                    className="w-full text-center py-2.5 bg-slate-950 border border-emerald-400 rounded-xl text-white font-mono text-lg tracking-widest outline-none"
                  />
                </div>

                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 font-semibold"
                  >
                    Open WhatsApp to view OTP &rarr;
                  </a>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-md text-sm transition"
                >
                  Verify OTP &amp; Enter Admin Dashboard
                </button>
              </form>
            )}
          </div>
        )}

        {/* Customer Portal Link */}
        {onSwitchToCustomer && (
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span>Are you a Cavalli Customer?</span>
            <button
              type="button"
              onClick={onSwitchToCustomer}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <span>WhatsApp Login OTP</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
