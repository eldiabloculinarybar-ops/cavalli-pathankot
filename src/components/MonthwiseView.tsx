import React, { useState } from 'react';
import { Customer } from '../types';
import { MONTH_NAMES, MONTH_HINDI, getMonthFromDOB, getDayFromDOB, formatDayMonth, calculateAge, getDaysUntilBirthday, isBirthdayToday } from '../utils/dateUtils';
import { SUBSCRIPTION_PLANS } from '../data/initialData';
import {
  Calendar,
  Sparkles,
  Mail,
  MessageCircle,
  Edit2,
  Trash2,
  Gift,
  Clock,
  Cake,
  Filter,
  Search,
  CheckCircle,
  Crown
} from 'lucide-react';

interface MonthwiseViewProps {
  customers: Customer[];
  onOpenSendWhatsApp: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onAddNewCustomer: () => void;
}

export const MonthwiseView: React.FC<MonthwiseViewProps> = ({
  customers,
  onOpenSendWhatsApp,
  onEditCustomer,
  onDeleteCustomer,
  onAddNewCustomer
}) => {
  const currentMonthIndex = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIndex);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [displayMode, setDisplayMode] = useState<'single' | 'grid'>('single');

  // Group customers by birth month
  const customersByMonth = React.useMemo(() => {
    const map: Record<number, Customer[]> = {};
    for (let i = 0; i < 12; i++) {
      map[i] = [];
    }

    customers.forEach((c) => {
      const monthIdx = getMonthFromDOB(c.dob);
      if (map[monthIdx]) {
        map[monthIdx].push(c);
      }
    });

    // Sort each month's customers by day of month (ascending 1..31)
    Object.keys(map).forEach((m) => {
      const idx = Number(m);
      map[idx].sort((a, b) => getDayFromDOB(a.dob) - getDayFromDOB(b.dob));
    });

    return map;
  }, [customers]);

  // Filter current selected month's customers
  const filteredCustomers = React.useMemo(() => {
    let list = customersByMonth[selectedMonth] || [];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.phone.includes(query) ||
          (c.email || '').toLowerCase().includes(query) ||
          (c.city && c.city.toLowerCase().includes(query))
      );
    }

    if (tierFilter !== 'all') {
      list = list.filter((c) => c.subscriptionTier === tierFilter);
    }

    return list;
  }, [customersByMonth, selectedMonth, searchQuery, tierFilter]);

  return (
    <div className="space-y-6">
      {/* View Header with Month Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-rose-400" />
              <span>Month-Wise Birthday Explorer (माह अनुसार जन्मदिन)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select any month to view all customer birthdays, upcoming celebrations, and trigger automated wishes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDisplayMode(displayMode === 'single' ? 'grid' : 'single')}
              className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition flex items-center gap-1.5"
            >
              {displayMode === 'single' ? 'View All 12 Months' : 'View Selected Month'}
            </button>
            <button
              onClick={onAddNewCustomer}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-semibold shadow-md shadow-rose-500/20 cursor-pointer transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Add Customer</span>
            </button>
          </div>
        </div>

        {/* 12 Months Horizontal Selector Bar */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {MONTH_NAMES.map((month, idx) => {
            const count = customersByMonth[idx]?.length || 0;
            const isCurrentMonth = idx === currentMonthIndex;
            const isSelected = selectedMonth === idx && displayMode === 'single';

            return (
              <button
                key={month}
                onClick={() => {
                  setSelectedMonth(idx);
                  setDisplayMode('single');
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition cursor-pointer relative ${
                  isSelected
                    ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30'
                    : isCurrentMonth
                    ? 'bg-slate-800/90 text-rose-300 border-rose-500/60 ring-1 ring-rose-500/40'
                    : 'bg-slate-800/50 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                {isCurrentMonth && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full uppercase tracking-tighter shadow">
                    Current
                  </span>
                )}
                <span className="text-xs font-bold">{month.slice(0, 3)}</span>
                <span className={`text-[10px] mt-0.5 px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-white/20 text-white font-bold'
                    : count > 0
                    ? 'bg-rose-500/20 text-rose-300 font-bold'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SINGLE MONTH FOCUSED VIEW */}
      {displayMode === 'single' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl space-y-5">
          {/* Active Month Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                <Cake className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{MONTH_NAMES[selectedMonth]} Celebrations</span>
                  <span className="text-sm font-normal text-slate-400">
                    ({MONTH_HINDI[selectedMonth]})
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Total Birthdays in this month: <strong className="text-rose-400">{filteredCustomers.length}</strong>
                </p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="नाम या फ़ोन खोजें..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="all">All Subscriptions</option>
                  <option value="basic">Basic (Free)</option>
                  <option value="silver">Silver Delight</option>
                  <option value="gold">Gold VIP</option>
                  <option value="platinum">Platinum Royal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Cards Grid for Selected Month */}
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl">
              <Cake className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-white">
                {MONTH_NAMES[selectedMonth]} में कोई जन्मदिन नहीं मिला
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No customer birthdays found for this month matching your search. Add customers with birthday in {MONTH_NAMES[selectedMonth]}.
              </p>
              <button
                onClick={onAddNewCustomer}
                className="mt-4 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold cursor-pointer shadow"
              >
                + Add Customer in {MONTH_NAMES[selectedMonth]}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => {
                const plan = SUBSCRIPTION_PLANS[customer.subscriptionTier] || SUBSCRIPTION_PLANS.basic;
                const isToday = isBirthdayToday(customer.dob);
                const daysRemaining = getDaysUntilBirthday(customer.dob);
                const { currentAge, turningAge } = calculateAge(customer.dob);

                return (
                  <div
                    key={customer.id}
                    className={`rounded-2xl border p-4.5 transition-all flex flex-col justify-between relative overflow-hidden ${
                      isToday
                        ? 'bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-900 border-rose-500 shadow-xl shadow-rose-500/10 ring-2 ring-rose-500/50'
                        : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70'
                    }`}
                  >
                    {/* Today Badge */}
                    {isToday && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-rose-500 to-pink-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow flex items-center gap-1">
                        <Sparkles className="w-3 h-3 animate-spin" />
                        <span>Today Birthday! 🎂</span>
                      </div>
                    )}

                    <div>
                      {/* Top Row: Date Badge & Tier */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          {/* Calendar Day Block */}
                          <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center text-center shadow ${
                            isToday
                              ? 'bg-rose-500 text-white border-rose-400'
                              : 'bg-slate-800 text-slate-200 border-slate-700'
                          }`}>
                            <span className="text-[10px] uppercase font-bold tracking-wider leading-none">
                              {MONTH_NAMES[selectedMonth].slice(0, 3)}
                            </span>
                            <span className="text-lg font-black leading-tight">
                              {getDayFromDOB(customer.dob)}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-bold text-white text-base leading-snug">
                              {customer.name}
                            </h4>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>Turning {turningAge} yrs</span>
                              <span>&bull;</span>
                              <span>Born {customer.dob.split('-')[0]}</span>
                            </div>
                          </div>
                        </div>

                        {!isToday && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${plan.badgeColor}`}>
                            {plan.name}
                          </span>
                        )}
                      </div>

                      {/* Contact Details */}
                      <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Phone:</span>
                          <span className="font-mono text-white font-medium">{customer.phone}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Email:</span>
                          <span className="text-white truncate max-w-[170px]" title={customer.email}>
                            {customer.email}
                          </span>
                        </div>
                        {customer.city && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">City:</span>
                            <span className="text-slate-300">{customer.city}</span>
                          </div>
                        )}
                      </div>

                      {/* Plan Perks Pill */}
                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
                        <span className="flex items-center gap-1 text-amber-300">
                          <Gift className="w-3.5 h-3.5" />
                          <span>{plan.discountPercent}% Discount Voucher</span>
                        </span>
                        <span className="text-slate-400">
                          {isToday ? (
                            <strong className="text-rose-400">Today!</strong>
                          ) : daysRemaining <= 30 ? (
                            `In ${daysRemaining} days`
                          ) : (
                            formatDayMonth(customer.dob)
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onOpenSendWhatsApp(customer)}
                          title="Send Birthday Greeting & VIP OTP via WhatsApp"
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-md"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Send WhatsApp OTP</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditCustomer(customer)}
                          title="Edit Customer & Subscription"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteCustomer(customer.id)}
                          title="Delete Customer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ALL 12 MONTHS OVERVIEW GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MONTH_NAMES.map((month, idx) => {
            const list = customersByMonth[idx] || [];
            const isCurrent = idx === currentMonthIndex;

            return (
              <div
                key={month}
                onClick={() => {
                  setSelectedMonth(idx);
                  setDisplayMode('single');
                }}
                className={`bg-slate-900 border rounded-2xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] ${
                  isCurrent
                    ? 'border-rose-500/60 ring-1 ring-rose-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{month}</span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold">
                        Current
                      </span>
                    )}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-rose-300 text-xs font-bold border border-slate-700">
                    {list.length} Birthdays
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {list.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-500">
                      No birthdays in {month}
                    </div>
                  ) : (
                    list.slice(0, 4).map((c) => {
                      const isToday = isBirthdayToday(c.dob);
                      return (
                        <div
                          key={c.id}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                            isToday ? 'bg-rose-500/20 text-rose-200 font-semibold' : 'bg-slate-800/60 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white w-6 text-center">
                              {getDayFromDOB(c.dob)}
                            </span>
                            <span className="truncate max-w-[120px]">{c.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {c.subscriptionTier}
                          </span>
                        </div>
                      );
                    })
                  )}

                  {list.length > 4 && (
                    <div className="text-center text-[11px] text-rose-400 font-medium pt-1">
                      +{list.length - 4} more in {month} &rarr;
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
