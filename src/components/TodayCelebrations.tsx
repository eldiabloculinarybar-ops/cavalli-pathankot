import React from 'react';
import { Customer } from '../types';
import { calculateAge, formatDOB } from '../utils/dateUtils';
import { SUBSCRIPTION_PLANS } from '../data/initialData';
import { triggerConfetti } from './CelebrationConfetti';
import { Cake, Sparkles, Send, Mail, MessageCircle, PartyPopper, Gift } from 'lucide-react';

interface TodayCelebrationsProps {
  todayBirthdays: Customer[];
  onOpenSendWhatsApp: (customer: Customer) => void;
  onSendAllToday: (customers: Customer[]) => void;
}

export const TodayCelebrations: React.FC<TodayCelebrationsProps> = ({
  todayBirthdays,
  onOpenSendWhatsApp,
  onSendAllToday
}) => {
  if (todayBirthdays.length === 0) {
    return (
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <Cake className="w-4 h-4 text-slate-500" />
          <span>आज किसी भी ग्राहक का जन्मदिन नहीं है (No birthdays today). All upcoming celebrations are listed in the Month-wise view.</span>
        </div>
        <button
          onClick={() => triggerConfetti('small')}
          className="text-slate-400 hover:text-white underline cursor-pointer"
        >
          Test Confetti 🎉
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-rose-950/80 via-purple-950/80 to-slate-900 border-2 border-emerald-500/70 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-500/30">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30 animate-bounce font-black">
            <Cake className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>आज का जन्मदिन उत्सव! (Today's WhatsApp Celebrations)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-black shadow">
                  {todayBirthdays.length} Special Day{todayBirthdays.length > 1 ? 's' : ''}
                </span>
              </h2>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              WhatsApp Birthday Wishes &amp; 4-Digit VIP OTPs are ready to be dispatched to these valued members.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => triggerConfetti('grand')}
            className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium cursor-pointer transition flex items-center gap-1.5"
            title="Celebrate!"
          >
            <PartyPopper className="w-4 h-4 text-emerald-400" />
            <span>Celebrate Confetti</span>
          </button>

          <button
            onClick={() => onSendAllToday(todayBirthdays)}
            className="px-4 py-2.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 hover:from-emerald-300 hover:to-amber-300 shadow-lg shadow-emerald-500/30 flex items-center gap-2 text-xs cursor-pointer active:scale-95 transition"
          >
            <MessageCircle className="w-4 h-4 fill-slate-950" />
            <span>Send WhatsApp Wishes &amp; OTP to All ({todayBirthdays.length})</span>
          </button>
        </div>
      </div>

      {/* Birthday Celebrants Cards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 relative z-10">
        {todayBirthdays.map((customer) => {
          const plan = SUBSCRIPTION_PLANS[customer.subscriptionTier] || SUBSCRIPTION_PLANS['1month'];
          const { turningAge } = calculateAge(customer.dob);

          return (
            <div
              key={customer.id}
              className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 backdrop-blur-sm flex flex-col justify-between hover:border-emerald-400 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                      <span>{customer.name}</span>
                      <span className="text-amber-400 text-xs">🎂</span>
                    </h3>
                    <p className="text-xs text-emerald-300 font-medium mt-0.5">
                      Turning {turningAge} today! (Born {customer.dob.split('-')[0]})
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${plan.badgeColor}`}>
                    {plan.name}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 text-xs space-y-1.5 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">WhatsApp Mobile:</span>
                    <span className="font-mono text-emerald-300 font-bold">{customer.phone}</span>
                  </div>
                  <div className="flex items-center justify-between text-amber-300">
                    <span className="flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5" />
                      <span>Gift Privileges:</span>
                    </span>
                    <span className="font-bold">{plan.discountPercent}% OFF + Birthday OTP</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => onOpenSendWhatsApp(customer)}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950" />
                  <span>Send WhatsApp Wish &amp; VIP OTP</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
