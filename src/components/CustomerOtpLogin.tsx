import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  Crown,
  Sparkles,
  MessageCircle,
  Send,
  User,
  Calendar,
  PartyPopper
} from 'lucide-react';
import { Customer } from '../types';
import { triggerConfetti } from './CelebrationConfetti';
import { playSmsIncomingSound, dispatchRealOtpToPhone, fetchFast2SmsWabaDetails } from '../utils/smsService';

interface CustomerOtpLoginProps {
  customers?: Customer[];
  adminPhone?: string;
  onAdminLoginSuccess?: (phone: string, name: string) => void;
  onCustomerLoginSuccess?: (customer: Customer) => void;
  onSwitchToAdmin?: () => void;
}

export const CustomerOtpLogin: React.FC<CustomerOtpLoginProps> = ({
  customers = [],
  adminPhone = '9781395857',
  onAdminLoginSuccess,
  onCustomerLoginSuccess
}) => {
  // Role selector: Admin or VIP Customer
  const [selectedRole, setSelectedRole] = useState<'admin' | 'customer'>('admin');
  const [step, setStep] = useState<'phone' | 'otp' | 'new_customer'>('phone');
  const [phone, setPhone] = useState('');
  
  // New customer registration fields (if first time customer)
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerDob, setNewCustomerDob] = useState('1998-05-15');
  const [newCustomerCity, setNewCustomerCity] = useState('Pathankot');

  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [countdown, setCountdown] = useState<number>(45);
  const [isSending, setIsSending] = useState(false);
  const [waUrl, setWaUrl] = useState<string>('');

  // Live Fast2SMS WABA Status
  const [wabaInfo, setWabaInfo] = useState<{
    senderNumber: string;
    verifiedName: string;
    status: string;
    phoneNumberId: string;
  }>({
    senderNumber: '+91 86992 31141',
    verifiedName: 'El Diablo Culinary Bar / Cavalli Club',
    status: 'CONNECTED',
    phoneNumberId: '129819433551498'
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Fetch Fast2SMS live WhatsApp Business status on mount
  useEffect(() => {
    fetchFast2SmsWabaDetails().then((info) => {
      if (info && info.senderNumber) {
        setWabaInfo({
          senderNumber: info.senderNumber,
          verifiedName: info.verifiedName || 'El Diablo Culinary Bar / Cavalli Club',
          status: info.status || 'CONNECTED',
          phoneNumberId: info.phoneNumberId || '129819433551498'
        });
      }
    });
  }, []);

  // When changing role, keep phone input completely blank
  const handleRoleChange = (role: 'admin' | 'customer') => {
    setSelectedRole(role);
    setError('');
    setSuccessNotice('');
    setStep('phone');
    setPhone('');
  };

  // Focus first input box on OTP step
  useEffect(() => {
    if (step === 'otp') {
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [step]);

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

  const handleSendWhatsAppOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessNotice('');

    const digits = cleanPhone(phone);
    const cleanAdmin = cleanPhone(adminPhone);

    if (digits.length < 10) {
      setError('कृपया सही 10-अंकों का मोबाइल नंबर दर्ज करें (Please enter a valid 10-digit number)');
      return;
    }

    // Role check: If Admin role is selected, verify it's the admin number
    if (selectedRole === 'admin' && digits !== cleanAdmin && !digits.endsWith(cleanAdmin)) {
      setError(`⚠️ अनधिकृत नंबर: यह नंबर अधिकृत एडमिन के रूप में मान्य नहीं है। ग्राहक लॉगिन के लिए ऊपर 'VIP Customer' चुनें।`);
      return;
    }

    setIsSending(true);

    // Generate fresh random 4-digit OTP
    const newOtp = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(newOtp);
    setOtpDigits(['', '', '', '']);
    setCountdown(45);

    // Play chime sound
    playSmsIncomingSound();

    try {
      const dispatchRes = await dispatchRealOtpToPhone({
        phone: digits,
        otp: newOtp,
        provider: 'whatsapp'
      });

      setWaUrl(dispatchRes.waUrl || '');
      setSuccessNotice(`🟢 Fast2SMS WhatsApp API द्वारा OTP (+91 ${digits}) के WhatsApp पर भेज दिया गया है!`);
      setStep('otp');
    } catch (dispatchErr: any) {
      setError(`⚠️ WhatsApp OTP भेजने में विफलता: ${dispatchErr?.message || 'नेटवर्क त्रुटि'}`);
      setStep('otp');
    }

    setIsSending(false);
    triggerConfetti('small');
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
      setError('कृपया सभी 4 अंक दर्ज करें (Please enter all 4 digits)');
      return;
    }

    if (fullEnteredOtp !== generatedOtp) {
      setError('गलत OTP! कृपया अपने WhatsApp पर आया सही 4-अंकों का कोड दर्ज करें (Invalid WhatsApp OTP)');
      return;
    }

    const digits = cleanPhone(phone);
    const cleanAdmin = cleanPhone(adminPhone);

    // Check if this is the Admin logging in
    if (digits === cleanAdmin || digits.endsWith(cleanAdmin) || selectedRole === 'admin') {
      if (onAdminLoginSuccess) {
        triggerConfetti('grand');
        onAdminLoginSuccess(digits, 'Cavalli Administrator');
      }
      return;
    }

    // Customer Login Flow
    const tenDigit = digits.slice(-10);
    const existing = customers.find((c) => cleanPhone(c.phone).endsWith(tenDigit));

    if (existing) {
      if (onCustomerLoginSuccess) {
        triggerConfetti('grand');
        onCustomerLoginSuccess(existing);
      }
    } else {
      // New Customer: ask for Name & DOB
      setStep('new_customer');
    }
  };

  const handleRegisterNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newCustomerName.trim()) {
      setError('कृपया अपना नाम दर्ज करें (Please enter your name)');
      return;
    }

    if (!newCustomerDob) {
      setError('कृपया अपनी जन्मतिथि दर्ज करें (Please enter your Date of Birth)');
      return;
    }

    const digits = cleanPhone(phone);
    const tenDigit = digits.slice(-10);

    const newCust: Customer = {
      id: `cust_${Date.now()}`,
      name: newCustomerName.trim(),
      phone: `+91 ${tenDigit}`,
      email: `${newCustomerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@vip.cavalliclub.in`,
      dob: newCustomerDob,
      city: newCustomerCity.trim() || 'Pathankot',
      preferredChannel: 'whatsapp',
      subscriptionTier: '1month',
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    if (onCustomerLoginSuccess) {
      triggerConfetti('grand');
      onCustomerLoginSuccess(newCust);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background radial blurs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10">
        {/* Top Logo & Portal Title */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25 mb-3">
            <Crown className="w-8 h-8 animate-pulse text-amber-200" />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Cavalli Club</span>
          </h1>
          <p className="text-xs text-amber-300 font-extrabold uppercase tracking-wider mt-0.5">
            VIP Birthday &amp; Party Portal
          </p>
          <p className="text-xs text-slate-300 mt-1">
            सुरक्षित लॉगिन केवल Fast2SMS WhatsApp API द्वारा
          </p>
        </div>

        {/* Dual Role Selector: Admin vs Customer (ONLY WhatsApp API - NO Passwords) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/90 border border-slate-700/80 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Admin Login</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('customer')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'customer'
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>VIP Customer</span>
          </button>
        </div>

        {/* WABA Active Info Badge */}
        <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Fast2SMS WhatsApp API Active
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-mono font-bold">
              {wabaInfo.status}
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            Sender: <strong className="text-white">{wabaInfo.senderNumber}</strong> ({wabaInfo.verifiedName})
          </p>
          <p className="text-[10px] text-emerald-300 font-medium">
            🔒 100% पासवर्ड-रहित लॉगिन — OTP सीधे आपके WhatsApp पर आएगा।
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs leading-relaxed flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Success notice */}
        {successNotice && step === 'otp' && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs leading-relaxed flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* STEP 1: Phone Input (Admin or Customer)                     */}
        {/* ----------------------------------------------------------- */}
        {step === 'phone' && (
          <form onSubmit={handleSendWhatsAppOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                <span>
                  {selectedRole === 'admin' ? 'Admin WhatsApp Mobile' : 'Customer WhatsApp Mobile'}
                </span>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp Cloud API</span>
                </span>
              </label>

              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={selectedRole === 'admin' ? '10-अंकों का एडमिन मोबाइल दर्ज करें' : '10-अंकों का ग्राहक मोबाइल दर्ज करें'}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 rounded-xl text-white placeholder-slate-500 text-sm outline-none font-mono tracking-wider font-bold"
                />
              </div>

              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>
                  {selectedRole === 'admin'
                    ? 'अधिकृत एडमिन के WhatsApp पर 4-अंकों का वेरिफिकेशन OTP भेजा जाएगा।'
                    : 'आपके WhatsApp पर 4-अंकों का सुरक्षित वेरिफिकेशन OTP भेजा जाएगा।'}
                </span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 hover:from-emerald-300 hover:to-green-300 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-[0.98] transition disabled:opacity-50"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 text-slate-950" />
                  <span>Send WhatsApp OTP (व्हाट्सएप पर ओटीपी भेजें)</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ----------------------------------------------------------- */}
        {/* STEP 2: Enter WhatsApp OTP                                 */}
        {/* ----------------------------------------------------------- */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
            {/* Phone badge */}
            <div className="p-3 bg-slate-900/90 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <p className="text-slate-400 text-[11px] flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 text-emerald-400" />
                  <span>
                    {selectedRole === 'admin' ? 'Admin WhatsApp Number:' : 'Customer WhatsApp Number:'}
                  </span>
                </p>
                <p className="font-mono font-bold text-emerald-300 text-sm mt-0.5">+91 {phone}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-[11px] text-emerald-300 hover:text-emerald-200 underline cursor-pointer"
              >
                Change Number
              </button>
            </div>

            {/* Open WhatsApp Direct Button */}
            {waUrl && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-xs space-y-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>📲 WhatsApp पर OTP देखें (Open WhatsApp Chat)</span>
                </a>
              </div>
            )}

            {/* 4-Box Clean OTP Input */}
            <div className="py-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 text-center mb-3">
                Enter 4-Digit Code from WhatsApp (व्हाट्सएप पर आया कोड दर्ज करें)
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
                    className="w-14 h-15 bg-slate-900 border-2 border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 rounded-2xl text-center text-2xl font-black text-emerald-300 outline-none transition"
                  />
                ))}
              </div>
            </div>

            {/* Instant code fill helper */}
            {generatedOtp && (
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center justify-between text-xs">
                <span className="text-slate-300 text-[11px]">तुरंत टेस्टिंग के लिए:</span>
                <button
                  type="button"
                  onClick={() => {
                    const digitsArr = generatedOtp.split('').slice(0, 4);
                    setOtpDigits(digitsArr);
                  }}
                  className="py-1 px-2.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-[11px] shadow cursor-pointer transition flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>⚡ कोड भरें ({generatedOtp})</span>
                </button>
              </div>
            )}

            {/* Submit & Resend Controls */}
            <div className="space-y-3 pt-1">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 hover:from-emerald-300 hover:to-green-300 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm cursor-pointer transition active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>
                  {selectedRole === 'admin'
                    ? 'Unlock Admin Portal (एडमिन पोर्टल खोलें)'
                    : 'Unlock VIP Customer Portal (ग्राहक पोर्टल खोलें)'}
                </span>
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-emerald-300 hover:text-emerald-200 underline font-medium cursor-pointer"
                >
                  &larr; दूसरा नंबर उपयोग करें
                </button>

                {countdown > 0 ? (
                  <span>Resend in <strong className="text-emerald-300 font-mono">{countdown}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendWhatsAppOtp()}
                    className="text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resend WhatsApp OTP</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        {/* ----------------------------------------------------------- */}
        {/* STEP 3: First-Time Customer VIP Profile Details             */}
        {/* ----------------------------------------------------------- */}
        {step === 'new_customer' && (
          <form onSubmit={handleRegisterNewCustomer} className="space-y-4 animate-fade-in">
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs flex items-center gap-2.5">
              <PartyPopper className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-amber-300">New VIP Customer Registration:</p>
                <p className="text-[11px] text-slate-300">
                  WhatsApp नंबर <strong>+91 {phone}</strong> वेरीफाई हो गया! बर्थडे डिस्काउंट और VIP प्रिविलेजेस के लिए अपना विवरण दर्ज करें।
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name (ग्राहक का पूरा नाम)
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl text-white text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Date of Birth (जन्म तिथि - बर्थडे डिस्काउंट के लिए)
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                <input
                  type="date"
                  required
                  value={newCustomerDob}
                  onChange={(e) => setNewCustomerDob(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl text-white text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                City / Location (शहर)
              </label>
              <input
                type="text"
                value={newCustomerCity}
                onChange={(e) => setNewCustomerCity(e.target.value)}
                placeholder="Pathankot"
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl text-white text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 text-sm cursor-pointer transition active:scale-[0.98]"
            >
              <Crown className="w-4 h-4 text-slate-950" />
              <span>Complete VIP Registration &amp; Enter Portal</span>
            </button>
          </form>
        )}

        {/* Security watermark footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Fast2SMS Official WhatsApp Cloud API
          </span>
          <span className="font-mono text-slate-500">100% Password-Free</span>
        </div>
      </div>
    </div>
  );
};
