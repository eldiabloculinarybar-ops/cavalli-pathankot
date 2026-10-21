import React, { useState, useEffect } from 'react';
import { Customer, EmailLog, EmailTemplate } from '../types';
import { SUBSCRIPTION_PLANS, DEFAULT_EMAIL_TEMPLATES } from '../data/initialData';
import { calculateAge, formatDOB } from '../utils/dateUtils';
import { triggerConfetti } from './CelebrationConfetti';
import {
  X,
  Mail,
  Send,
  Sparkles,
  Check,
  Copy,
  Cake,
  Gift,
  ExternalLink,
  MessageCircle,
  Eye,
  Edit3
} from 'lucide-react';

interface EmailAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  templates: EmailTemplate[];
  onLogSentEmail: (log: EmailLog) => void;
  storeName?: string;
  senderEmail?: string;
}

export const EmailAutomationModal: React.FC<EmailAutomationModalProps> = ({
  isOpen,
  onClose,
  customer,
  templates,
  onLogSentEmail,
  storeName = 'Cavalli Club',
  senderEmail = 'celebrations@cavalliclub.com'
}) => {
  const [subject, setSubject] = useState('');
  const [heading, setHeading] = useState('');
  const [message, setMessage] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSentSuccess, setIsSentSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [previewTab, setPreviewTab] = useState<'preview' | 'edit'>('preview');

  useEffect(() => {
    if (customer) {
      const tier = customer.subscriptionTier || 'basic';
      const template =
        templates.find((t) => t.tierId === tier) ||
        DEFAULT_EMAIL_TEMPLATES.find((t) => t.tierId === tier) ||
        DEFAULT_EMAIL_TEMPLATES[0];

      const plan = SUBSCRIPTION_PLANS[tier] || SUBSCRIPTION_PLANS.basic;

      // Generate dynamic discount code
      const generatedCode = `${tier.toUpperCase()}${plan.discountPercent}_${customer.name.slice(0, 3).toUpperCase()}`;

      // Populate text with replacements
      const finalSubject = template.subject.replace('{name}', customer.name);
      setSubject(finalSubject);
      setHeading(template.heading);
      setMessage(
        `Dear ${customer.name},\n\n${template.message}\n\nOn this momentous occasion, we thank you for being a cherished member of our family. Enjoy your birthday privileges!`
      );
      setDiscountCode(generatedCode);
      setIsSentSuccess(false);
      setPreviewTab('preview');
    }
  }, [customer, templates, isOpen]);

  if (!isOpen || !customer) return null;

  const plan = SUBSCRIPTION_PLANS[customer.subscriptionTier] || SUBSCRIPTION_PLANS.basic;
  const ageInfo = calculateAge(customer.dob);

  const handleSendEmail = () => {
    setIsSending(true);

    setTimeout(() => {
      const newLog: EmailLog = {
        id: `log-${Date.now()}`,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        subject,
        messageBody: message,
        sentAt: new Date().toISOString(),
        status: 'delivered',
        tierUsed: customer.subscriptionTier,
        automationType: 'manual_one_click',
        discountCode
      };

      onLogSentEmail(newLog);
      setIsSending(false);
      setIsSentSuccess(true);
      triggerConfetti('grand');
    }, 800);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(discountCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const mailtoUrl = `mailto:${encodeURIComponent(customer.email || '')}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(message + `\n\nBirthday Discount Code: ${discountCode} (${plan.discountPercent}% OFF)\nWith warm regards,\n${storeName}`)}`;

  const whatsappUrl = `https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `🎉 Happy Birthday ${customer.name}! 🎂\n\n${heading}\n\n${message}\n\n🎁 Your Exclusive ${plan.name} Code: ${discountCode} (${plan.discountPercent}% OFF)\nWarm wishes from ${storeName}!`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>स्वचालित जन्मदिन ईमेल (Automated Birthday Email)</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${plan.badgeColor}`}>
                  {plan.name}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                To: <strong className="text-slate-200">{customer.name}</strong> ({customer.email})
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

        {/* View / Edit Mode Switcher */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewTab('preview')}
              className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                previewTab === 'preview'
                  ? 'bg-rose-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Email Card Live Preview</span>
            </button>
            <button
              onClick={() => setPreviewTab('edit')}
              className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                previewTab === 'edit'
                  ? 'bg-rose-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Customize Content</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            From: <span className="font-mono text-slate-300">{senderEmail}</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {isSentSuccess ? (
            /* SUCCESS CONFIRMATION */
            <div className="py-8 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">
                  ईमेल सफलतापूर्वक भेजा गया! (Birthday Wish Sent!)
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                  A personalized celebratory email with voucher code <strong className="text-amber-300 font-mono">{discountCode}</strong> has been logged and delivered to <span className="text-rose-300 font-medium">{customer.email}</span>.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send on WhatsApp also</span>
                </a>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700"
                >
                  Close &amp; Back to Dashboard
                </button>
              </div>
            </div>
          ) : previewTab === 'preview' ? (
            /* LIVE EMAIL CARD PREVIEW */
            <div className="space-y-4">
              {/* Email Envelope Header */}
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 text-xs space-y-1">
                <div>
                  <span className="text-slate-400">Subject: </span>
                  <span className="font-bold text-white">{subject}</span>
                </div>
                <div>
                  <span className="text-slate-400">Recipient: </span>
                  <span className="text-rose-300 font-medium">{customer.name}</span> &lt;{customer.email}&gt;
                </div>
              </div>

              {/* Rendered Email Card (How recipient sees it) */}
              <div className="bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 rounded-2xl border-2 border-purple-500/40 p-6 shadow-2xl relative overflow-hidden text-center">
                {/* Festive Balloons / Cake Banner */}
                <div className="flex justify-center mb-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-xl">
                      <Cake className="w-8 h-8 animate-bounce" />
                    </div>
                    <span className="absolute -top-1 -right-1 text-base">✨</span>
                  </div>
                </div>

                <div className="inline-block px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
                  🎉 Special Birthday Greetings 🎉
                </div>

                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  {heading}
                </h2>

                <p className="text-xs text-rose-200 mt-1">
                  Turning {ageInfo.turningAge} on {formatDOB(customer.dob)}
                </p>

                {/* Body Message */}
                <div className="my-5 p-4 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs md:text-sm leading-relaxed text-left whitespace-pre-line">
                  {message}
                </div>

                {/* Exclusive Voucher Code Box */}
                <div className="my-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 border-2 border-dashed border-amber-400/60 relative">
                  <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
                    <Gift className="w-4 h-4" />
                    <span>Exclusive {plan.discountPercent}% Birthday Voucher</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="px-4 py-2 bg-slate-950 border border-amber-400/50 rounded-lg font-mono text-base font-extrabold text-amber-300 tracking-wider">
                      {discountCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition cursor-pointer"
                      title="Copy Voucher Code"
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    *Valid for 30 days on your special birthday month!
                  </p>
                </div>

                {/* Footer Signature */}
                <div className="pt-3 border-t border-white/10 text-xs text-slate-400">
                  <p>Warmest regards &amp; blessings,</p>
                  <p className="font-bold text-white text-sm mt-0.5">{storeName}</p>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT / CUSTOMIZE CONTENT FORM */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Card Heading
                </label>
                <input
                  type="text"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Personal Message
                </label>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-rose-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Birthday Discount Coupon Code
                </label>
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-amber-300 outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        {!isSentSuccess && (
          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <a
                href={mailtoUrl}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
                title="Send using native mail app"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Mail App</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Wish</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                disabled={isSending}
                onClick={handleSendEmail}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-500/20 cursor-pointer active:scale-95 transition disabled:opacity-60"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Automated Birthday Email Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
