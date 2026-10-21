import React, { useState, useEffect } from 'react';
import { Customer, SubscriptionTierId } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/initialData';
import { calculateAge, formatDOB, getZodiacSign } from '../utils/dateUtils';
import { triggerConfetti } from './CelebrationConfetti';
import {
  X,
  User,
  Phone,
  Heart,
  Calendar,
  MapPin,
  FileText,
  Check,
  Sparkles,
  Crown,
  Gift,
  ArrowRight,
  ArrowLeft,
  PartyPopper
} from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomer: (customer: Customer) => void;
  initialCustomer?: Customer | null;
  defaultStep?: 1 | 2;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomer,
  initialCustomer,
  defaultStep = 1
}) => {
  const [step, setStep] = useState<1 | 2>(defaultStep);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [dob, setDob] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTierId>('1month');
  const [preferredChannel, setPreferredChannel] = useState<'email' | 'whatsapp' | 'both'>('whatsapp');
  const [validationError, setValidationError] = useState('');

  // Populate if editing
  useEffect(() => {
    if (initialCustomer) {
      setName(initialCustomer.name);
      setPhone(initialCustomer.phone);
      setAnniversaryDate(initialCustomer.anniversaryDate || '');
      setDob(initialCustomer.dob);
      setCity(initialCustomer.city || '');
      setNotes(initialCustomer.notes || '');
      setSubscriptionTier(initialCustomer.subscriptionTier || '1month');
      setPreferredChannel(initialCustomer.preferredChannel || 'whatsapp');
      setStep(defaultStep);
    } else {
      // Default reset for new customer
      setName('');
      setPhone('+91 ');
      setAnniversaryDate('');
      setDob('1998-10-19');
      setCity('');
      setNotes('');
      setSubscriptionTier('1month');
      setPreferredChannel('whatsapp');
      setStep(1);
    }
    setValidationError('');
  }, [initialCustomer, isOpen, defaultStep]);

  if (!isOpen) return null;

  const handleStepOneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError('कृपया ग्राहक का नाम दर्ज करें (Please enter customer name)');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setValidationError('कृपया मान्य फोन नंबर दर्ज करें (Please enter a valid phone number)');
      return;
    }
    if (!dob) {
      setValidationError('कृपया जन्म तिथि (Date of Birth) चुनें');
      return;
    }

    // Step 1 validated -> Proceed straight to Step 2 (Choose Subscription)!
    setStep(2);
  };

  const handleFinalSave = () => {
    const customerData: Customer = {
      id: initialCustomer?.id || `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: initialCustomer?.email || undefined,
      dob,
      anniversaryDate: anniversaryDate.trim() || undefined,
      subscriptionTier,
      subscriptionStatus: 'active',
      subscriptionStartDate: initialCustomer?.subscriptionStartDate || new Date().toISOString().split('T')[0],
      city: city.trim() || undefined,
      notes: notes.trim() || undefined,
      preferredChannel,
      createdAt: initialCustomer?.createdAt || new Date().toISOString()
    };

    onSaveCustomer(customerData);
    triggerConfetti('grand');
    onClose();
  };

  // Age preview helper
  const ageInfo = dob ? calculateAge(dob) : null;
  const zodiac = dob ? getZodiacSign(dob) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              {step === 1 ? <User className="w-5 h-5" /> : <Crown className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {initialCustomer ? 'ग्राहक जानकारी संपादित करें (Edit Customer)' : 'नया ग्राहक जोड़ें (Add Customer)'}
              </h2>
              <p className="text-xs text-slate-400">
                {step === 1
                  ? 'Step 1 of 2: नाम, फ़ोन नंबर, जन्म तिथि एवं संपर्क विवरण'
                  : 'Step 2 of 2: ग्राहक के लिए Subscription Plan चुनें (Pick Subscription Tier)'}
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

        {/* Step Indicator Progress Bar */}
        <div className="grid grid-cols-2 bg-slate-950/70 border-b border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-2.5 px-4 text-center font-medium flex items-center justify-center gap-2 transition ${
              step === 1
                ? 'text-rose-400 border-b-2 border-rose-500 bg-rose-500/10'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Customer Info (नाम, फ़ोन, DOB)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (name && phone && dob) setStep(2);
            }}
            className={`py-2.5 px-4 text-center font-medium flex items-center justify-center gap-2 transition ${
              step === 2
                ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/10'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Subscription Tier Selection</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {validationError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{validationError}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Basic Information */
            <form onSubmit={handleStepOneSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Customer Full Name (ग्राहक का नाम) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 rounded-xl text-white placeholder-slate-500 text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone Number (फ़ोन नंबर) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 rounded-xl text-white placeholder-slate-500 text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Anniversary Date (Optional - वर्षगांठ की तारीख) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-pink-400" />
                      <span>Anniversary Date (वर्षगांठ)</span>
                    </label>
                    <span className="text-[10px] text-slate-400 lowercase bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                      ऐच्छिक (Optional)
                    </span>
                  </div>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400" />
                    <input
                      type="date"
                      value={anniversaryDate}
                      onChange={(e) => setAnniversaryDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-pink-400 focus:ring-1 focus:ring-pink-400 rounded-xl text-white placeholder-slate-500 text-sm outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    शादी या विशेष वर्षगांठ (ज़रूरी नहीं है)
                  </p>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Date of Birth (जन्म तिथि) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 rounded-xl text-white placeholder-slate-500 text-sm outline-none"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    City / Location (शहर)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai, Delhi, Jaipur"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 rounded-xl text-white placeholder-slate-500 text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Customer Preferences / Notes (पसंदीदा उपहार / नोट)
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Prefers morning wishes, loves artisanal cakes, vegetarian"
                      className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 rounded-xl text-white placeholder-slate-500 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Real-time DOB Preview Badge */}
              {dob && ageInfo && (
                <div className="mt-2 p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <PartyPopper className="w-4 h-4 text-pink-400" />
                    <span>Birthday: <strong className="text-white">{formatDOB(dob)}</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-300 font-medium">
                      Next Age: {ageInfo.turningAge} yrs
                    </span>
                    {zodiac && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {zodiac.symbol} {zodiac.sign}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                >
                  रद्द करें (Cancel)
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-500/25 flex items-center gap-2 text-sm cursor-pointer"
                >
                  <span>अगला: Subscription चुनें (Choose Plan)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: Choose Subscription Tier! */
            <div className="space-y-5 animate-fade-in">
              <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3">
                <Gift className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-white">
                    {name} के लिए Subscription Plan चुनें
                  </p>
                  <p className="text-slate-300 mt-0.5">
                    जन्मदिन पर जाने वाले स्वचालित ईमेल (Automated Email Greetings), डिस्काउंट वाउचर और सेलिब्रेशन फीचर्स इस प्लान के अनुसार भेजे जाएंगे।
                  </p>
                </div>
              </div>

              {/* 4 Subscription Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {Object.values(SUBSCRIPTION_PLANS).map((plan) => {
                  const isSelected = subscriptionTier === plan.id;
                  const isGold = plan.id === 'gold';
                  const isPlatinum = plan.id === 'platinum';

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSubscriptionTier(plan.id)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 border-amber-400 shadow-lg shadow-amber-500/15 ring-1 ring-amber-400/50'
                          : 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/60'
                      }`}
                    >
                      {/* Popular / VIP badge */}
                      {isGold && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider shadow">
                          Most Popular VIP
                        </span>
                      )}
                      {isPlatinum && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-[10px] uppercase tracking-wider shadow">
                          Royal Luxury
                        </span>
                      )}

                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">{plan.name}</span>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-xl font-extrabold text-amber-300">{plan.price}</span>
                            <span className="text-xs text-slate-400">/{plan.period}</span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${plan.badgeColor}`}>
                          {plan.discountPercent}% OFF Code
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                        {plan.description}
                      </p>

                      <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-1.5 text-xs">
                        {plan.perks.slice(0, 3).map((perk, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-slate-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Notification Channel Selection */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Automated Birthday Dispatch Channel (सूचना माध्यम)
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreferredChannel('email')}
                    className={`p-2.5 rounded-lg border text-center transition ${
                      preferredChannel === 'email'
                        ? 'bg-rose-500/20 border-rose-500 text-white font-medium'
                        : 'border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    ✉️ Email Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredChannel('whatsapp')}
                    className={`p-2.5 rounded-lg border text-center transition ${
                      preferredChannel === 'whatsapp'
                        ? 'bg-emerald-500/20 border-emerald-500 text-white font-medium'
                        : 'border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    💬 WhatsApp Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredChannel('both')}
                    className={`p-2.5 rounded-lg border text-center transition ${
                      preferredChannel === 'both'
                        ? 'bg-purple-500/20 border-purple-500 text-white font-medium'
                        : 'border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    ✨ Both Email &amp; WhatsApp
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>पिछला (Back to Info)</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalSave}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 flex items-center gap-2 text-sm cursor-pointer active:scale-95 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ग्राहक और Subscription सुरक्षित करें (Save Customer &amp; Plan)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
