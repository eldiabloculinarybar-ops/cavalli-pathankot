import React, { useState } from 'react';
import { Customer, SubscriptionTierId } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/initialData';
import { calculateAge, formatDOB, getDaysUntilBirthday, isBirthdayToday } from '../utils/dateUtils';
import { triggerConfetti } from './CelebrationConfetti';
import {
  Cake,
  Gift,
  Clock,
  CheckCircle,
  Sparkles,
  LogOut,
  Calendar,
  ShieldCheck,
  Check,
  Crown,
  Copy,
  Share2,
  Download,
  PartyPopper,
  Zap,
  ArrowRight
} from 'lucide-react';

interface CustomerPortalProps {
  customer: Customer;
  onUpdateSubscriptionRequest: (customerId: string, planId: SubscriptionTierId) => void;
  onLogout: () => void;
  onSwitchToAdmin: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  customer,
  onUpdateSubscriptionRequest,
  onLogout,
  onSwitchToAdmin
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTierId>(
    customer.requestedPlanId || customer.subscriptionTier || '1month'
  );
  const [copiedCode, setCopiedCode] = useState(false);

  const isToday = isBirthdayToday(customer.dob);
  const daysUntil = getDaysUntilBirthday(customer.dob);
  const ageInfo = calculateAge(customer.dob);

  const activePlan = SUBSCRIPTION_PLANS[customer.subscriptionTier] || SUBSCRIPTION_PLANS['1month'];
  const requestedPlan = SUBSCRIPTION_PLANS[customer.requestedPlanId || selectedPlan] || SUBSCRIPTION_PLANS['1month'];

  const isPending = customer.subscriptionStatus === 'pending';
  const isApproved = customer.subscriptionStatus === 'approved' || customer.subscriptionStatus === 'active';

  const couponCode = activePlan.id === '3month' ? 'QUARTER20' : 'MONTH20';

  const handleSelectPlan = (planId: SubscriptionTierId) => {
    setSelectedPlan(planId);
    onUpdateSubscriptionRequest(customer.id, planId);
    triggerConfetti('grand');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(true);
    triggerConfetti('small');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Cake className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-tight">
                Cavalli Club VIP Lounge
              </span>
              <p className="text-[11px] text-amber-400 font-medium">
                Verified Phone: {customer.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onSwitchToAdmin}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition hidden sm:inline-flex"
            >
              Back to Admin Portal &rarr;
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-800 transition cursor-pointer flex items-center gap-1.5 text-xs"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Welcome & Birthday Countdown Hero Card */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Customer Member Portal</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                नमस्ते, {customer.name}! 🎉
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                आपकी जन्म तिथि: <strong className="text-white">{formatDOB(customer.dob)}</strong> (Turning {ageInfo.turningAge} years)
              </p>

              {/* Status Pill */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {isPending && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold animate-pulse">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Subscription Status: Pending Admin Approval (एडमिन मंज़ूरी का इंतज़ार)</span>
                  </span>
                )}
                {isApproved && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-xs font-extrabold shadow-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Membership Status: APPROVED &amp; ACTIVE ✅ ({activePlan.name})</span>
                  </span>
                )}
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 text-center min-w-[200px] shadow-lg">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Birthday Countdown
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                {isToday ? 'TODAY! 🎂' : `${daysUntil} Days`}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isToday ? 'Happy Birthday! Automated wish sent' : 'Until your special celebration'}
              </p>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* OFFICIAL DIGITAL MEMBERSHIP CARD (SHOWS ONCE APPROVED!) */}
        {/* ------------------------------------------------------------- */}
        {isApproved && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>आपका डिजिटल मेंबरशिप कार्ड (Your Approved Membership Pass)</span>
              </h2>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Verified</span>
              </span>
            </div>

            {/* Holographic / Luxury Member Card */}
            <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-purple-950 border-2 border-amber-400/80 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden text-slate-100">
              {/* Card Background Glow & Watermark */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
                <Cake className="w-64 h-64 text-amber-300" />
              </div>

              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                      CAVALLI CLUB OFFICIAL VIP PASS
                    </span>
                    <h3 className="text-xl font-black text-white tracking-tight">
                      {activePlan.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />
                    <span>APPROVED BY ADMIN</span>
                  </span>
                </div>
              </div>

              {/* Card Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 relative z-10 text-xs">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                    Member Name
                  </span>
                  <p className="text-base font-bold text-white mt-0.5">{customer.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{customer.phone}</p>
                </div>

                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                    Birthday &amp; Special Day
                  </span>
                  <p className="text-base font-bold text-rose-300 mt-0.5">{formatDOB(customer.dob)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Automated Wish Configured ✉️</p>
                </div>

                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                    Membership ID &amp; Validity
                  </span>
                  <p className="text-base font-bold text-amber-300 font-mono mt-0.5">
                    MEM-{customer.id.replace(/[^0-9]/g, '').slice(-6) || '202688'}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Valid: {customer.subscriptionStartDate || '2026-10-19'} &rarr; {customer.subscriptionEndDate || '2026-11-19'}
                  </p>
                </div>
              </div>

              {/* Coupon Code Strip */}
              <div className="mt-2 p-4 rounded-2xl bg-slate-950/80 border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Your Exclusive 20% Discount Voucher
                    </span>
                    <div className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>Code:</span>
                      <span className="font-mono text-base text-amber-300 font-black tracking-wider">
                        {couponCode}
                      </span>
                      <span className="text-xs text-emerald-400 font-bold">(Flat 20% OFF)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
                  >
                    {copiedCode ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'Copied Code!' : 'Copy 20% Coupon'}</span>
                  </button>
                  <button
                    onClick={() => triggerConfetti('grand')}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    title="Celebrate"
                  >
                    <PartyPopper className="w-4 h-4 text-pink-400" />
                  </button>
                </div>
              </div>

              {/* Card Perks Footer */}
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 relative z-10">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>20% Discount Activated</span>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Automated Email Wish Enabled</span>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>WhatsApp Greeting Ready</span>
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  Plan Value: <strong className="text-white">{activePlan.price}</strong> ({activePlan.period})
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Approval Status Banner for PENDING */}
        {isPending && (
          <div className="bg-amber-500/10 border-2 border-amber-500/50 rounded-2xl p-5 flex items-start gap-4 text-xs animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Subscription Request Submitted to Admin!
              </h3>
              <p className="text-amber-200 mt-1 leading-relaxed">
                You have requested the <strong className="text-white">{requestedPlan.name} ({requestedPlan.price}) with 20% Birthday Discount</strong>.
                Store Admin has been notified to review and approve your membership. As soon as the Admin clicks <strong>"Approve Plan"</strong>, your digital membership card and 20% discount coupon will immediately unlock here.
              </p>
            </div>
          </div>
        )}

        {/* CHOOSE OR UPGRADE SUBSCRIPTION PLAN SECTION */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>
                  {isApproved
                    ? 'Available Membership Plans (Switch or Renew Plan)'
                    : 'Choose Your Birthday Subscription Plan (सब्सक्रिप्शन चुनें)'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select between our 1-Month Plan (₹500, 20% discount) or 3-Month Plan (₹1000, 20% discount). Admin approves your subscription immediately.
              </p>
            </div>
          </div>

          {/* 1 Month vs 3 Month Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* PLAN 1: 1 Month Plan (₹500, 20% Discount) */}
            <div
              className={`rounded-3xl border-2 p-6 transition-all flex flex-col justify-between relative ${
                (isApproved && activePlan.id === '1month') || (!isApproved && selectedPlan === '1month')
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-400 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-400/40'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
                20% Birthday Discount
              </span>

              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">1-Month Celebration Plan</h3>
                    <p className="text-xs text-slate-400 mt-0.5">1 Month active birthday privileges</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                    1M
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">₹500</span>
                  <span className="text-xs text-slate-400">/ 1 Month</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                    Includes 20% OFF Coupon
                  </span>
                </div>

                <div className="mt-5 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Flat 20% Discount</strong> on your birthday order</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Automated special email wish sent on your birthday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Personalized digital birthday card with name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Admin verification &amp; approval workflow</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSelectPlan('1month')}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                    isApproved && activePlan.id === '1month'
                      ? 'bg-emerald-500 text-slate-950 opacity-90'
                      : isPending && selectedPlan === '1month'
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isApproved && activePlan.id === '1month'
                      ? 'Current Active Membership Plan ✅'
                      : isPending && selectedPlan === '1month'
                      ? '1-Month Request Pending Approval ⏳'
                      : 'Choose 1-Month Plan (₹500 with 20% OFF)'}
                  </span>
                </button>
              </div>
            </div>

            {/* PLAN 2: 3 Month Plan (₹1,000, 20% Discount) */}
            <div
              className={`rounded-3xl border-2 p-6 transition-all flex flex-col justify-between relative ${
                (isApproved && activePlan.id === '3month') || (!isApproved && selectedPlan === '3month')
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 border-indigo-400 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-400/40'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow">
                Best Value VIP &bull; 20% OFF
              </span>

              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">3-Month Premium Plan</h3>
                    <p className="text-xs text-slate-400 mt-0.5">3 Months continuous celebratory perks</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
                    3M
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">₹1,000</span>
                  <span className="text-xs text-slate-400">/ 3 Months</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-xs">
                    Flat 20% OFF Coupon
                  </span>
                </div>

                <div className="mt-5 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>Flat 20% Discount</strong> valid for 3 full months</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Automated VIP morning email with digital confetti card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Priority order delivery on your birthday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Admin verification &amp; fast-track approval</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSelectPlan('3month')}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                    isApproved && activePlan.id === '3month'
                      ? 'bg-indigo-500 text-white opacity-90'
                      : isPending && selectedPlan === '3month'
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/20'
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  <span>
                    {isApproved && activePlan.id === '3month'
                      ? 'Current Active Membership Plan ✅'
                      : isPending && selectedPlan === '3month'
                      ? '3-Month Request Pending Approval ⏳'
                      : 'Choose 3-Month Plan (₹1000 with 20% OFF)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
