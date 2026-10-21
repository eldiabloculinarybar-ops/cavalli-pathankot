import React, { useState } from 'react';
import { EmailTemplate, SubscriptionTierId } from '../types';
import { SUBSCRIPTION_PLANS, DEFAULT_EMAIL_TEMPLATES } from '../data/initialData';
import { Sliders, Check, RotateCcw, Sparkles, Gift, Crown } from 'lucide-react';

interface EmailTemplatesModalProps {
  templates: EmailTemplate[];
  onSaveTemplates: (templates: EmailTemplate[]) => void;
}

export const EmailTemplatesModal: React.FC<EmailTemplatesModalProps> = ({
  templates,
  onSaveTemplates
}) => {
  const [activeTier, setActiveTier] = useState<SubscriptionTierId>('gold');
  const [localTemplates, setLocalTemplates] = useState<EmailTemplate[]>(templates);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentTemplate =
    localTemplates.find((t) => t.tierId === activeTier) ||
    DEFAULT_EMAIL_TEMPLATES.find((t) => t.tierId === activeTier) ||
    DEFAULT_EMAIL_TEMPLATES[0];

  const currentPlan = SUBSCRIPTION_PLANS[activeTier];

  const handleFieldChange = (field: keyof EmailTemplate, val: string) => {
    setLocalTemplates((prev) =>
      prev.map((t) => (t.tierId === activeTier ? { ...t, [field]: val } : t))
    );
    setSavedSuccess(false);
  };

  const handleSave = () => {
    onSaveTemplates(localTemplates);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetToDefault = () => {
    setLocalTemplates(DEFAULT_EMAIL_TEMPLATES);
    onSaveTemplates(DEFAULT_EMAIL_TEMPLATES);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-rose-400" />
            <span>Automated Email Templates by Subscription Tier</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Every customer automatically receives an email customized according to their chosen subscription plan on their special day.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefault}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/20 text-xs cursor-pointer transition flex items-center gap-1.5"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? 'Saved Successfully!' : 'Save All Templates'}</span>
          </button>
        </div>
      </div>

      {/* Subscription Tier Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {(Object.keys(SUBSCRIPTION_PLANS) as SubscriptionTierId[]).map((tierId) => {
          const plan = SUBSCRIPTION_PLANS[tierId];
          const isSelected = activeTier === tierId;

          return (
            <button
              key={tierId}
              onClick={() => setActiveTier(tierId)}
              className={`p-3 rounded-xl border text-left transition cursor-pointer relative ${
                isSelected
                  ? 'bg-slate-800 border-amber-400 shadow-lg ring-1 ring-amber-400/40'
                  : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{plan.name}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${plan.badgeColor}`}>
                  {plan.discountPercent}% OFF
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {plan.price} / {plan.period}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Tier Editor Card */}
      <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-5 space-y-4">
        {/* Tier Details Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-white font-bold">{currentPlan.name} Email Template</span>
            <span className="text-slate-400">&bull; Automatically sent to all {currentPlan.name} subscribers on birthday morning</span>
          </div>
          <span className="text-amber-300 font-mono font-bold">
            Voucher Incentive: {currentPlan.discountPercent}% OFF
          </span>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
              Email Subject Line (Includes Customer Name &amp; Subscription Mention)
            </label>
            <input
              type="text"
              value={currentTemplate.subject}
              onChange={(e) => handleFieldChange('subject', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-rose-400 text-xs"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Tip: Use <code className="text-amber-300">{"{name}"}</code> to dynamically insert customer full name.
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
              Celebratory Card Main Heading
            </label>
            <input
              type="text"
              value={currentTemplate.heading}
              onChange={(e) => handleFieldChange('heading', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-rose-400 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
              Body Message (Mentions Chosen Subscription &amp; Wishes)
            </label>
            <textarea
              rows={4}
              value={currentTemplate.message}
              onChange={(e) => handleFieldChange('message', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-rose-400 text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
              Complimentary Gift / Discount Voucher Description
            </label>
            <input
              type="text"
              value={currentTemplate.complimentaryGift}
              onChange={(e) => handleFieldChange('complimentaryGift', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-rose-400 text-xs font-mono text-amber-300"
            />
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Sample Live Preview as received by a {currentPlan.name} customer:
          </p>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="text-slate-400">
              <strong>Subject:</strong> {currentTemplate.subject.replace('{name}', 'Rahul Sharma')}
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-slate-200">
              <p className="font-bold text-amber-300 text-sm mb-1">{currentTemplate.heading}</p>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">{currentTemplate.message}</p>
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-amber-300 text-[11px] font-medium flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5" />
                <span>{currentTemplate.complimentaryGift}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
