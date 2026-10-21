import React, { useRef } from 'react';
import { Customer } from '../types';
import { isBirthdayToday, getMonthFromDOB, MONTH_NAMES, getDaysUntilBirthday } from '../utils/dateUtils';
import { Users, Cake, Calendar, Sparkles, Send, Gift, Clock, Flame } from 'lucide-react';
import { Upcoming7DaysBirthdays } from './Upcoming7DaysBirthdays';

interface StatsOverviewProps {
  customers: Customer[];
  onTriggerDailyAutomation: () => void;
  isAutoRunning: boolean;
  onFilterThisMonth: () => void;
  onAddNewCustomer: () => void;
  onNavigateApprovals?: () => void;
  onOpenSendGreeting?: (customer: Customer) => void;
  onShowToast?: (msg: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  customers,
  onTriggerDailyAutomation,
  isAutoRunning,
  onFilterThisMonth,
  onAddNewCustomer,
  onNavigateApprovals,
  onOpenSendGreeting,
  onShowToast
}) => {
  const currentMonthIdx = new Date().getMonth();
  const upcomingSectionRef = useRef<HTMLDivElement>(null);

  const totalCustomers = customers.length;
  const todayBirthdays = customers.filter((c) => isBirthdayToday(c.dob));
  const thisMonthBirthdays = customers.filter((c) => getMonthFromDOB(c.dob) === currentMonthIdx);
  const pendingApprovals = customers.filter((c) => c.subscriptionStatus === 'pending');

  // Next 7 Days Birthdays (Days 1 to 7)
  const upcoming7Days = customers.filter((c) => {
    const d = getDaysUntilBirthday(c.dob);
    return d >= 1 && d <= 7;
  });
  const tomorrowCount = upcoming7Days.filter((c) => getDaysUntilBirthday(c.dob) === 1).length;

  const handleScrollToUpcoming = () => {
    upcomingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-4">
      {/* 5 Stats KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* Total Customers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Customers
            </p>
            <h3 className="text-2xl font-black text-white mt-1">{totalCustomers}</h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Admin secure database</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Birthdays */}
        <div
          className={`border rounded-2xl p-4 shadow-lg flex items-center justify-between transition ${
            todayBirthdays.length > 0
              ? 'bg-gradient-to-r from-rose-950/60 to-slate-900 border-rose-500/80 shadow-rose-500/10'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Today's Birthdays</span>
              {todayBirthdays.length > 0 && <span className="animate-ping w-1.5 h-1.5 rounded-full bg-rose-400" />}
            </p>
            <h3 className="text-2xl font-black text-white mt-1">{todayBirthdays.length}</h3>
            <p className="text-[11px] text-rose-300/80 mt-1">
              {todayBirthdays.length > 0
                ? `${todayBirthdays.map((c) => c.name.split(' ')[0]).join(', ')} celebrating!`
                : 'No birthdays today'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
            <Cake className="w-6 h-6" />
          </div>
        </div>

        {/* Next 7 Days (Upcoming Birthdays) */}
        <div
          onClick={handleScrollToUpcoming}
          title="Click to view & prepare advance greetings for next 7 days"
          className={`border rounded-2xl p-4 shadow-lg flex items-center justify-between transition cursor-pointer hover:border-indigo-400 ${
            upcoming7Days.length > 0
              ? 'bg-gradient-to-r from-indigo-950/60 to-slate-900 border-indigo-500/80 shadow-indigo-500/10'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Next 7 Days</span>
              {tomorrowCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[9px] font-bold">
                  {tomorrowCount} tomorrow
                </span>
              )}
            </p>
            <h3 className="text-2xl font-black text-white mt-1">{upcoming7Days.length}</h3>
            <p className="text-[11px] text-indigo-300/80 mt-1 flex items-center gap-1">
              <span>Prepare greetings in advance &rarr;</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* This Month's Birthdays */}
        <div
          onClick={onFilterThisMonth}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg flex items-center justify-between cursor-pointer transition"
        >
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {MONTH_NAMES[currentMonthIdx]} Birthdays
            </p>
            <h3 className="text-2xl font-black text-amber-300 mt-1">{thisMonthBirthdays.length}</h3>
            <p className="text-[11px] text-amber-400/80 mt-1 flex items-center gap-1">
              <span>Click to view current month &rarr;</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Approvals Card */}
        <div
          onClick={onNavigateApprovals}
          className={`border rounded-2xl p-4 shadow-lg flex items-center justify-between transition cursor-pointer ${
            pendingApprovals.length > 0
              ? 'bg-gradient-to-r from-amber-950/60 to-slate-900 border-amber-500/80 shadow-amber-500/10'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Pending Approvals</span>
              {pendingApprovals.length > 0 && <span className="animate-ping w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </p>
            <h3 className="text-2xl font-black text-white mt-1">{pendingApprovals.length}</h3>
            <p className="text-[11px] text-amber-300/80 mt-1">
              {pendingApprovals.length > 0
                ? `${pendingApprovals.length} plan requests waiting &rarr;`
                : 'All requests reviewed'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Gift className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Dedicated Upcoming 7-Days Birthdays & Advance Greeting Studio */}
      <div ref={upcomingSectionRef}>
        <Upcoming7DaysBirthdays
          customers={customers}
          onOpenSendGreeting={onOpenSendGreeting}
          onShowToast={onShowToast}
        />
      </div>

      {/* Automated Dispatch Trigger Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">
            <strong>Automated WhatsApp OTP &amp; Greeting System:</strong> Evaluates customer birthdays daily and dispatches personalized wishes with 20% discount coupons.
          </span>
        </div>

        <button
          onClick={onTriggerDailyAutomation}
          disabled={isAutoRunning}
          className="px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isAutoRunning ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Run Automated Birthday Dispatch Now</span>
        </button>
      </div>
    </div>
  );
};
