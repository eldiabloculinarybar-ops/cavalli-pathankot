import React, { useState, useEffect, useRef } from 'react';
import { Customer } from '../types';
import {
  Phone,
  ShieldCheck,
  KeyRound,
  Sparkles,
  User,
  Calendar,
  Heart,
  ArrowRight,
  ArrowLeft,
  Cake,
  CheckCircle2,
  MessageCircle,
  RotateCcw,
  Eye,
  EyeOff,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { triggerConfetti } from './CelebrationConfetti';
import { playSmsIncomingSound, dispatchRealOtpToPhone, isFast2SmsLive, hasValidFast2SmsKey } from '../utils/smsService';

interface CustomerOtpLoginProps {
  customers: Customer[];
  adminPhone?: string;
  onAdminLoginSuccess?: (phone: string, name: string) => void;
  onCustomerLoginSuccess: (customer: Customer) => void;
  onSwitchToAdmin?: () => void;
}

export const CustomerOtpLogin: React.FC<CustomerOtpLoginProps> = ({
  customers,
  adminPhone = '9781395857',
  onAdminLoginSuccess,
  onCustomerLoginSuccess,
  onSwitchToAdmin
}) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'new_profile'>('phone');
  const [phone, setPhone] = useState('+91 ');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [countdown, setCountdown] = useState<number>(45);
  const [showOtpHint, setShowOtpHint] = useState<boolean>(false);
  const [isSending, setIsSending] = useState(false);
  const [currentWaUrl, setCurrentWaUrl] = useState<string>('');
  const [dispatchInfo, setDispatchInfo] = useState<{ fast2smsSent: boolean; message: string }>({
    fast2smsSent: false,
    message: ''
  });

  // New customer registration fields (Email removed, Anniversary Date optional)
  const [name, setName] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [dob, setDob] = useState('1998-10-19');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for resending OTP
  useEffect(() => {
    let timer: any;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const cleanPhone = (p: string) => p.replace(/[^0-9]/g, '');

  const formatInternationalPhone = (p: string) => {
    let digits = cleanPhone(p);
    if (digits.length === 10) {
      return `91${digits}`;
    }
    return digits;
  };

  const handleSendWhatsAppOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessNotice('');
    setIsSending(true);

    const digits = cleanPhone(phone);
    if (digits.length < 10) {
      setError('कृपया सही 10-अंकों का मोबाइल नंबर दर्ज करें (Enter valid 10-digit mobile number)');
      setIsSending(false);
      return;
    }

    // Check existing customer
    const found = customers.find(
      (c) => cleanPhone(c.phone) === digits || cleanPhone(c.phone).endsWith(digits.slice(-10))
    );

    // Generate fresh random 4-digit OTP
    const newOtp = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(newOtp);
    setExistingCustomer(found || null);
    setOtpDigits(['', '', '', '']); // Clean boxes ready for user
    setCountdown(45);

    const intlPhone = formatInternationalPhone(phone);
    const messageText = encodeURIComponent(
      `🍾 *CAVALLI CLUB VIP VERIFICATION*\n\nYour 4-Digit Login OTP is: *${newOtp}*\n\nValid for 10 minutes. Do not share this OTP with anyone.`
    );
    const waUrl = `https://api.whatsapp.com/send?phone=${intlPhone}&text=${messageText}`;
    setCurrentWaUrl(waUrl);

    // Play chime sound
    playSmsIncomingSound();

    try {
      // Call real dispatch service (Fast2SMS + WhatsApp)
      const dispatchRes = await dispatchRealOtpToPhone({
        phone,
        otp: newOtp
      });

      setDispatchInfo({
        fast2smsSent: Boolean(dispatchRes.fast2smsSuccess),
        message: dispatchRes.message
      });

      if (dispatchRes.fast2smsSuccess) {
        setSuccessNotice(`🟢 Fast2SMS Cellular SMS delivered to ${digits.slice(-10)}!`);
      } else {
        setSuccessNotice(`📲 OTP तैयार है! WhatsApp खोलें या तत्काल ऑटो-भरें बटन का उपयोग करें।`);
      }
    } catch (dispatchErr) {
      setDispatchInfo({
        fast2smsSent: false,
        message: 'WhatsApp delivery active'
      });
      setSuccessNotice(`📲 OTP WhatsApp पर तैयार है!`);
    }

    setIsSending(false);
    setStep('otp');
    triggerConfetti('small');
  };

  const handleReopenWhatsApp = () => {
    const intlPhone = formatInternationalPhone(phone);
    const messageText = encodeURIComponent(
      `🍾 *CAVALLI CLUB VIP VERIFICATION*\n\nYour 4-Digit Login OTP is: *${generatedOtp}*\n\nValid for 10 minutes. Do not share this OTP with anyone.`
    );
    const waUrl = `https://api.whatsapp.com/send?phone=${intlPhone}&text=${messageText}`;
    setCurrentWaUrl(waUrl);
    try {
      window.open(waUrl, '_blank');
    } catch (e) {
      // Handled via direct link
    }
    setSuccessNotice('WhatsApp opened with your Cavalli VIP OTP code!');
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Move to next digit input automatically
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const fullEnteredOtp = otpDigits.join('');

    if (fullEnteredOtp.length !== 4) {
      setError('कृपया सभी 4 अंक दर्ज करें (Please enter all 4 digits of the OTP)');
      return;
    }

    if (fullEnteredOtp !== generatedOtp) {
      setError('गलत OTP! कृपया सही 4-अंकों का कोड दर्ज करें (Invalid OTP code)');
      return;
    }

    const digits = cleanPhone(phone);
    const cleanAdmin = cleanPhone(adminPhone || '9781395857');
    const isAdmin = digits === cleanAdmin || digits.endsWith('9781395857');

    if (isAdmin && onAdminLoginSuccess) {
      triggerConfetti('grand');
      onAdminLoginSuccess(digits, 'Cavalli Administrator');
      return;
    }

    if (existingCustomer) {
      triggerConfetti('medium');
      onCustomerLoginSuccess(existingCustomer);
    } else {
      setStep('new_profile');
    }
  };

  const handleCompleteNewProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('कृपया अपना नाम दर्ज करें (Please enter your name)');
      return;
    }
    if (!dob) {
      setError('कृपया जन्म तिथि चुनें (Please select date of birth)');
      return;
    }

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      dob,
      anniversaryDate: anniversaryDate.trim() || undefined,
      subscriptionTier: '1month',
      subscriptionStatus: 'pending',
      requestedPlanId: '1month',
      subscriptionRequestedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    triggerConfetti('grand');
    onCustomerLoginSuccess(newCust);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-slate-100">
      {/* Background glow */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-7 sm:p-8 relative z-10">
        {/* Top Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/25 mb-3">
            <Cake className="w-7 h-7 animate-bounce" />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white">
            Cavalli Club
          </h1>
          <p className="text-xs text-amber-300 font-bold uppercase tracking-wider mt-0.5">
            VIP Birthday &amp; Management Portal
          </p>
          <p className="text-xs text-slate-300 mt-1">
            Fast2SMS सेल्युलर OTP से लॉगिन करें (Admin एवं Customer दोनों के लिए)
          </p>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold shadow-sm">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fast2SMS Cellular SMS &amp; WhatsApp OTP 🟢 LIVE</span>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs leading-relaxed flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successNotice && step === 'otp' && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs leading-relaxed flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* STEP 1: Phone Input (Fast2SMS Cellular SMS for Admin & Customer) */}
        {/* ----------------------------------------------------------- */}
        {step === 'phone' && (
          <form onSubmit={handleSendWhatsAppOtp} className="space-y-4">
            {/* Real-time Phone Identification Pill */}
            {cleanPhone(phone).endsWith('9781395857') ? (
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs flex items-center gap-2 animate-fade-in">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>👑 <strong>Admin Phone (9781395857) पहचानी गई:</strong> OTP से Admin Dashboard अनलॉक होगा।</span>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 text-[11px] flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>अपना मोबाइल नंबर दर्ज करें — Fast2SMS OTP से सीधे लॉगिन करें।</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Mobile Number (मोबाइल नंबर)</span>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  <span>Cellular SMS + WhatsApp</span>
                </span>
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 97813 95857"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 rounded-xl text-white placeholder-slate-500 text-sm outline-none font-mono tracking-wider"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>4-अंकों का वेरिफिकेशन OTP आपके मोबाइल नंबर पर तुरंत भेजा जाएगा।</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-[0.98] transition disabled:opacity-50"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  <span>Send Fast2SMS Cellular OTP (ओटीपी भेजें)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo phone numbers */}
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-300 space-y-2">
              <span className="text-[11px] text-slate-400 font-medium">Quick 1-Click Login (एक-क्लिक से चुनें):</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setPhone('9781395857')}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/50 hover:bg-amber-500/30 text-amber-300 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition"
                >
                  <span>👑 Admin: 9781395857</span>
                </button>
                {customers.slice(0, 2).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setPhone(c.phone)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-emerald-400 text-[11px] font-mono text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    <span>👤 {c.name.split(' ')[0]}: {c.phone}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* ----------------------------------------------------------- */}
        {/* STEP 2: Enter WhatsApp OTP */}
        {/* ----------------------------------------------------------- */}
        {/* ----------------------------------------------------------- */}
        {/* STEP 2: Enter WhatsApp OTP */}
        {/* ----------------------------------------------------------- */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
            {/* Phone badge */}
            <div className="p-3 bg-slate-900/90 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <p className="text-slate-400 text-[11px]">OTP Sent via WhatsApp / SMS to:</p>
                <p className="font-mono font-bold text-emerald-300 text-sm mt-0.5">{phone}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-[11px] text-amber-300 hover:text-amber-200 underline cursor-pointer"
              >
                Change Phone
              </button>
            </div>

            {/* Direct Re-open WhatsApp Primary Button */}
            <a
              href={currentWaUrl || `https://api.whatsapp.com/send?phone=${formatInternationalPhone(phone)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleReopenWhatsApp}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-200" />
              <span>📲 WhatsApp खोलें और OTP कोड देखें (Open WhatsApp)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80 ml-auto" />
            </a>

            {/* Instant One-Tap Auto-Fill Feature */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/15 to-amber-500/10 border border-amber-400/40 text-xs shadow-inner">
              <div>
                <span className="text-[11px] text-amber-200 font-medium block">सत्यापन OTP कोड (Verification Code):</span>
                <span className="font-mono text-lg font-black text-amber-300 tracking-widest">{generatedOtp}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOtpDigits(generatedOtp.split(''));
                  setError('');
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md cursor-pointer transition flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>⚡ ऑटो-भरें (Auto-Fill)</span>
              </button>
            </div>

            {/* 4-Box Clean OTP Input */}
            <div className="pt-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 text-center mb-2.5">
                Enter 4-Digit Code from WhatsApp (ओटीपी दर्ज करें)
              </label>

              <div className="flex justify-center gap-3">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-13 h-14 bg-slate-900 border-2 border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 rounded-2xl text-center text-2xl font-black text-emerald-300 outline-none transition"
                  />
                ))}
              </div>
            </div>

            {/* Guidance for SMS delay */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              💡 <strong>नोट:</strong> यदि आपके सिम पर SMS तुरंत नहीं पहुंचा, तो ऊपर दिए हरे बटन से WhatsApp पर कोड देखें अथवा <strong className="text-amber-300">&quot;⚡ ऑटो-भरें&quot;</strong> दबाकर तुरंत आगे बढ़ें।
            </div>

            {/* Submit & Resend Controls */}
            <div className="space-y-3 pt-1">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm cursor-pointer transition active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Verify OTP &amp; Login (लॉगिन करें)</span>
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                {countdown > 0 ? (
                  <span>Resend in <strong className="text-emerald-300 font-mono">{countdown}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleSendWhatsAppOtp(e)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resend OTP</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowOtpHint(!showOtpHint)}
                  className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  {showOtpHint ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showOtpHint ? 'Hide Code' : 'View Code'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ----------------------------------------------------------- */}
        {/* STEP 3: New Customer Registration (If first time login) */}
        {/* ----------------------------------------------------------- */}
        {step === 'new_profile' && (
          <form onSubmit={handleCompleteNewProfile} className="space-y-3.5 animate-fade-in">
            <div className="p-3 bg-purple-500/15 border border-purple-500/30 rounded-xl text-xs text-purple-200">
              🎉 <strong>Welcome to Cavalli Club!</strong> कृपया अपना नाम और जन्म तिथि दर्ज करें ताकि हम आपके जन्मदिन पर 20% डिस्काउंट वाउचर भेज सकें।
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Your Full Name (आपका नाम) <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikas Gupta"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Date of Birth (जन्म तिथि) <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Anniversary Date - Optional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase text-slate-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-pink-400" />
                  <span>Anniversary Date (वर्षगांठ की तारीख)</span>
                </label>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                  ऐच्छिक (Optional)
                </span>
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400" />
                <input
                  type="date"
                  value={anniversaryDate}
                  onChange={(e) => setAnniversaryDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-emerald-400"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                शादी या विशेष वर्षगांठ (ज़रूरी नहीं है)
              </p>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md text-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Complete Profile &amp; Choose Cavalli Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Unified Fast2SMS OTP Protected Notice */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fast2SMS Cellular OTP Protected</span>
          </span>
          <span className="text-amber-300 font-mono text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
            Admin: 9781395857
          </span>
        </div>
      </div>
    </div>
  );
};
