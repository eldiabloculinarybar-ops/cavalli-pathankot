import React, { useState } from 'react';
import { Customer, EmailLog, EmailTemplate } from '../types';
import { SUBSCRIPTION_PLANS, DEFAULT_EMAIL_TEMPLATES } from '../data/initialData';
import { isBirthdayToday, formatDOB } from '../utils/dateUtils';
import { triggerConfetti } from './CelebrationConfetti';
import {
  Bell,
  Clock,
  Sparkles,
  CheckCircle,
  Play,
  Settings2,
  Send,
  Zap,
  ShieldCheck
} from 'lucide-react';

interface AutomationSchedulerControlProps {
  customers: Customer[];
  templates: EmailTemplate[];
  autoSendEnabled: boolean;
  onToggleAutoSend: (enabled: boolean) => void;
  onBatchLogSentEmails: (newLogs: EmailLog[]) => void;
}

export const AutomationSchedulerControl: React.FC<AutomationSchedulerControlProps> = ({
  customers,
  templates,
  autoSendEnabled,
  onToggleAutoSend,
  onBatchLogSentEmails
}) => {
  const [isRunningSim, setIsRunningSim] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<string>('Today at 08:00 AM');
  const [lastRunResult, setLastRunResult] = useState<string | null>(null);

  const todayCelebrants = customers.filter((c) => isBirthdayToday(c.dob));

  const handleSimulateDailyCron = () => {
    setIsRunningSim(true);
    setLastRunResult(null);

    setTimeout(() => {
      const generatedLogs: EmailLog[] = [];

      todayCelebrants.forEach((customer) => {
        const tier = customer.subscriptionTier || '1month';
        const plan = SUBSCRIPTION_PLANS[tier] || SUBSCRIPTION_PLANS['1month'];
        const bdayOtp = String(Math.floor(1000 + Math.random() * 9000));
        const discountCode = tier === '3month' ? `QUARTER20-${bdayOtp}` : `MONTH20-${bdayOtp}`;

        generatedLogs.push({
          id: `log-auto-${Date.now()}-${customer.id}`,
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone,
          subject: `🎂 WhatsApp Birthday Wish & OTP (${bdayOtp})`,
          messageBody: `WhatsApp Birthday wish & OTP ${bdayOtp} dispatched to ${customer.phone} with ${plan.name} discount code ${discountCode}`,
          sentAt: new Date().toISOString(),
          status: 'delivered',
          tierUsed: customer.subscriptionTier,
          automationType: 'automated_cron',
          discountCode,
          birthdayOtp: bdayOtp,
          channel: 'whatsapp'
        });
      });

      if (generatedLogs.length > 0) {
        onBatchLogSentEmails(generatedLogs);
        triggerConfetti('grand');
        setLastRunResult(`Success: Dispatched ${generatedLogs.length} WhatsApp birthday wishes with VIP OTPs to today's celebrants!`);
      } else {
        setLastRunResult('WhatsApp Automation evaluated: No birthdays scheduled for today. All upcoming celebrants remain queued.');
      }

      setLastRunTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsRunningSim(false);
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Engine Details */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 shrink-0 mt-0.5 font-bold">
            <Zap className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>WhatsApp Automated Birthday &amp; OTP Dispatch Engine</span>
                <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  Cron Scheduler Active
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Scans birthdays daily at 08:00 AM and dispatches VIP Birthday Wishes with 4-Digit OTP and 20% discount vouchers directly to customer WhatsApp phones.
            </p>
            <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Last Run: <strong className="text-slate-300">{lastRunTime}</strong></span>
              </span>
              <span>&bull;</span>
              <span>Today's WhatsApp Queue: <strong className="text-emerald-400">{todayCelebrants.length} celebrant(s)</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Toggle & Manual Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Toggle Switch */}
          <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-300 font-medium">Auto-Send:</span>
            <button
              onClick={() => onToggleAutoSend(!autoSendEnabled)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                autoSendEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  autoSendEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Trigger button */}
          <button
            onClick={handleSimulateDailyCron}
            disabled={isRunningSim}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/25 cursor-pointer disabled:opacity-50 transition active:scale-95"
          >
            {isRunningSim ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Trigger Engine Now</span>
          </button>
        </div>
      </div>

      {lastRunResult && (
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{lastRunResult}</span>
          </div>
          <button
            onClick={() => setLastRunResult(null)}
            className="text-[11px] underline opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
