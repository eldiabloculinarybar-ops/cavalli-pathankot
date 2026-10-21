import React, { useState, useEffect } from 'react';
import { Customer, WhatsAppLog, WhatsAppTemplate } from '../types';
import { SUBSCRIPTION_PLANS, DEFAULT_EMAIL_TEMPLATES } from '../data/initialData';
import { calculateAge, formatDOB } from '../utils/dateUtils';
import { triggerConfetti } from './CelebrationConfetti';
import { dispatchWhatsAppBirthdayWishAndOtp } from '../utils/smsService';
import {
  X,
  MessageCircle,
  Send,
  Sparkles,
  Check,
  Copy,
  Cake,
  Gift,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Phone
} from 'lucide-react';

interface WhatsAppBirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  templates?: WhatsAppTemplate[];
  onLogSentMessage: (log: WhatsAppLog) => void;
  storeName?: string;
}

export const WhatsAppBirthdayModal: React.FC<WhatsAppBirthdayModalProps> = ({
  isOpen,
  onClose,
  customer,
  templates = DEFAULT_EMAIL_TEMPLATES,
  onLogSentMessage,
  storeName = 'Cavalli Club'
}) => {
  const [birthdayOtp, setBirthdayOtp] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [customHeading, setCustomHeading] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSentSuccess, setIsSentSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [waUrl, setWaUrl] = useState('');

  useEffect(() => {
    if (customer && isOpen) {
      const tier = customer.subscriptionTier || '1month';
      const template =
        templates.find((t) => t.tierId === tier) ||
        DEFAULT_EMAIL_TEMPLATES.find((t) => t.tierId === tier) ||
        DEFAULT_EMAIL_TEMPLATES[0];

      const plan = SUBSCRIPTION_PLANS[tier] || SUBSCRIPTION_PLANS['1month'];

      // Generate 4-digit Birthday Verification OTP
      const newOtp = String(Math.floor(1000 + Math.random() * 9000));
      setBirthdayOtp(newOtp);

      // Generate coupon code
      const code = tier === '3month' ? `QUARTER20-${newOtp}` : `MONTH20-${newOtp}`;
      setDiscountCode(code);

      setCustomHeading(`Happy Birthday ${customer.name}! 🎂`);
      setCustomMessage(
        template.message ||
          'Cavalli Club wishes you an extraordinary Birthday filled with style and celebration!'
      );
      setIsSentSuccess(false);

      // Pre-compose WhatsApp URL
      const cleanDigits = customer.phone.replace(/[^0-9]/g, '');
      const intl = cleanDigits.length > 10 ? cleanDigits.slice(-10) : cleanDigits;
      const text =
        `🎂 *HAPPY BIRTHDAY FROM ${storeName.toUpperCase()}!* 🍾✨\n\n` +
        `Dear *${customer.name}*,\n` +
        `Cavalli Club wishes you a magnificent and stylish Birthday!\n\n` +
        `🎁 *YOUR EXCLUSIVE BIRTHDAY PRIVILEGES:*\n` +
        `• VIP Birthday OTP: *${newOtp}*\n` +
        `• Membership Tier: *${plan.name}*\n` +
        `• Special Voucher: *${code}* (20% FLAT DISCOUNT)\n\n` +
        `Show this WhatsApp message & Birthday OTP at Cavalli Club to claim your 20% celebration discount.\n\n` +
        `With warm celebratory regards,\n*Cavalli Club VIP Management* 🥂`;

      setWaUrl(`https://api.whatsapp.com/send?phone=91${intl}&text=${encodeURIComponent(text)}`);
    }
  }, [customer, isOpen, templates, storeName]);

  if (!isOpen || !customer) return null;

  const plan = SUBSCRIPTION_PLANS[customer.subscriptionTier] || SUBSCRIPTION_PLANS['1month'];
  const ageInfo = calculateAge(customer.dob);

  const handleSendWhatsAppWish = async () => {
    setIsSending(true);

    try {
      const res = await dispatchWhatsAppBirthdayWishAndOtp({
        customerName: customer.name,
        phone: customer.phone,
        planName: plan.name,
        discountPercent: plan.discountPercent || 20,
        discountCode,
        birthdayOtp,
        customMessage,
        storeName
      });

      const newLog: WhatsAppLog = {
        id: `wa-bday-${Date.now()}`,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        subject: `🎂 WhatsApp Birthday Wish & OTP (${birthdayOtp})`,
        messageBody: `WhatsApp Birthday wish & OTP ${birthdayOtp} sent to ${customer.phone} with 20% discount coupon ${discountCode}`,
        sentAt: new Date().toISOString(),
        status: 'delivered',
        tierUsed: customer.subscriptionTier,
        automationType: 'manual_one_click',
        discountCode,
        birthdayOtp,
        channel: 'whatsapp'
      };

      onLogSentMessage(newLog);
      setIsSentSuccess(true);
      triggerConfetti('grand');
    } catch (e) {
      // Continue
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(discountCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-bold">
              <MessageCircle className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  WhatsApp जन्मदिन विश और VIP OTP
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold">
                  {plan.name}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span>To: <strong className="text-white">{customer.name}</strong></span>
                <span>•</span>
                <span className="font-mono text-emerald-300">{customer.phone}</span>
                <span>•</span>
                <span>{ageInfo.turningAge} yrs ({formatDOB(customer.dob)})</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {isSentSuccess && (
            <div className="p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl text-emerald-200 flex items-center gap-3 animate-fade-in">
              <Check className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-sm">WhatsApp जन्मदिन विश और OTP सफलतापूर्वक भेज दिया गया!</p>
                <p className="text-[11px] text-emerald-300/90 mt-0.5">
                  Customer के WhatsApp पर 4-अंकों का Birthday OTP (*{birthdayOtp}*) और 20% डिस्काउंट वाउचर डिलीवर हो गया।
                </p>
              </div>
            </div>
          )}

          {/* Birthday Privileges Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="font-semibold flex items-center gap-1.5">
                  <Cake className="w-3.5 h-3.5 text-rose-400" />
                  <span>VIP Birthday OTP</span>
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-bold">
                  4 Digits
                </span>
              </div>
              <div className="font-mono text-2xl font-black text-rose-400 tracking-widest mt-1">
                {birthdayOtp}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Customer redemption code on WhatsApp
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="font-semibold flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  <span>20% Discount Voucher</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-xl font-bold text-amber-300 tracking-wider mt-1">
                {discountCode}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Flat 20% Off for {plan.period}
              </p>
            </div>
          </div>

          {/* WhatsApp Chat Bubble Card Preview */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              WhatsApp Message Preview (व्हाट्सएप मैसेज प्रीव्यू)
            </label>
            <div className="bg-[#0b141a] p-4 rounded-2xl border border-emerald-900/50 shadow-inner">
              <div className="max-w-md mx-auto bg-[#005c4b] text-white rounded-2xl p-4 shadow-md text-xs leading-relaxed space-y-2 font-sans relative">
                <p className="font-bold text-emerald-200 flex items-center gap-1.5">
                  <span>🎂 *HAPPY BIRTHDAY FROM CAVALLI CLUB!* 🍾✨</span>
                </p>
                <p>
                  Dear <strong className="text-white">{customer.name}</strong>,
                </p>
                <p className="text-slate-100">
                  Cavalli Club wishes you an extraordinary Birthday filled with style and celebration!
                </p>
                <div className="bg-black/30 p-3 rounded-xl border border-white/10 space-y-1 font-mono text-[11px]">
                  <p className="text-amber-200 font-bold">🎁 YOUR EXCLUSIVE BIRTHDAY PRIVILEGES:</p>
                  <p>• VIP Birthday OTP: <strong className="text-emerald-300 text-sm">{birthdayOtp}</strong></p>
                  <p>• Membership Tier: <span className="text-white">{plan.name}</span></p>
                  <p>• Special Voucher: <span className="text-amber-300">{discountCode}</span> (20% OFF)</p>
                </div>
                <p className="text-[11px] text-emerald-100">
                  Show this WhatsApp message &amp; Birthday OTP at Cavalli Club to redeem your 20% celebration discount.
                </p>
                <p className="text-[10px] text-emerald-300/80 pt-1 text-right">
                  Sent via Cavalli Club Fast2SMS Live Gateway ✓✓
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in WhatsApp Directly</span>
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSendWhatsAppWish}
              disabled={isSending}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4 fill-slate-950" />
              )}
              <span>Send WhatsApp Wish &amp; OTP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
