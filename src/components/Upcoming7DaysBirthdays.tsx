import React, { useState, useMemo } from 'react';
import { Customer } from '../types';
import {
  getDaysUntilBirthday,
  calculateAge,
  formatUpcomingBirthdayLabel,
  formatDOB
} from '../utils/dateUtils';
import { SUBSCRIPTION_PLANS } from '../data/initialData';
import { getSmsGatewayConfig } from '../utils/smsService';
import {
  Calendar,
  Clock,
  Sparkles,
  Send,
  MessageCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  UserCheck,
  Gift,
  Phone,
  Flame,
  Cake,
  ExternalLink
} from 'lucide-react';

interface Upcoming7DaysBirthdaysProps {
  customers: Customer[];
  onOpenSendGreeting?: (customer: Customer) => void;
  onShowToast?: (msg: string) => void;
}

export const Upcoming7DaysBirthdays: React.FC<Upcoming7DaysBirthdaysProps> = ({
  customers,
  onOpenSendGreeting,
  onShowToast
}) => {
  const [filterRange, setFilterRange] = useState<'all' | 'tomorrow' | '2-3days' | '4-7days'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedPreviewId, setExpandedPreviewId] = useState<string | null>(null);
  const [isSectionOpen, setIsSectionOpen] = useState(true);

  const gatewayConfig = getSmsGatewayConfig();
  const senderName = gatewayConfig.whatsappSenderName || 'Cavalli Club';

  // Calculate upcoming birthdays within 1 to 7 days
  const upcomingCustomers = useMemo(() => {
    return customers
      .map((customer) => {
        const daysLeft = getDaysUntilBirthday(customer.dob);
        const { label, formattedDate, weekday } = formatUpcomingBirthdayLabel(customer.dob);
        const { currentAge, turningAge } = calculateAge(customer.dob);
        const plan = SUBSCRIPTION_PLANS[customer.subscriptionTier] || SUBSCRIPTION_PLANS['1month'];

        return {
          customer,
          daysLeft,
          label,
          formattedDate,
          weekday,
          currentAge,
          turningAge,
          plan
        };
      })
      .filter((item) => item.daysLeft >= 1 && item.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [customers]);

  // Counts for tabs
  const tomorrowCount = upcomingCustomers.filter((item) => item.daysLeft === 1).length;
  const next2to3Count = upcomingCustomers.filter((item) => item.daysLeft >= 2 && item.daysLeft <= 3).length;
  const next4to7Count = upcomingCustomers.filter((item) => item.daysLeft >= 4 && item.daysLeft <= 7).length;

  // Filtered list
  const filteredList = useMemo(() => {
    return upcomingCustomers.filter((item) => {
      // Range filter
      if (filterRange === 'tomorrow' && item.daysLeft !== 1) return false;
      if (filterRange === '2-3days' && (item.daysLeft < 2 || item.daysLeft > 3)) return false;
      if (filterRange === '4-7days' && (item.daysLeft < 4 || item.daysLeft > 7)) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.customer.name.toLowerCase().includes(query);
        const matchesPhone = item.customer.phone.includes(query);
        const matchesCity = item.customer.city?.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesCity) return false;
      }

      return true;
    });
  }, [upcomingCustomers, filterRange, searchQuery]);

  const generateAdvanceWishText = (item: (typeof upcomingCustomers)[0]) => {
    const { customer, formattedDate, weekday, turningAge, plan, daysLeft } = item;
    const timingPhrase = daysLeft === 1 ? 'कल (Tomorrow)' : `इस ${weekday} (${formattedDate})`;
    const voucherCode = `${customer.subscriptionTier === '3month' ? 'QUARTER20' : 'MONTH20'}-ADV`;

    return (
      `🎂 *ADVANCE BIRTHDAY GREETINGS FROM ${senderName.toUpperCase()}!* ✨🍾\n\n` +
      `Dear *${customer.name}*,\n` +
      `We noticed your special birthday is approaching ${timingPhrase}! You will be turning ${turningAge}.\n\n` +
      `As our esteemed *${plan.name}* VIP member, we are delighted to prepare your exclusive birthday privileges in advance:\n` +
      `🎁 *Early Birthday Voucher:* ${voucherCode} (Flat ${plan.discountPercent}% OFF)\n` +
      `🍾 *VIP Benefits:* Dedicated celebration perks & priority booking\n\n` +
      `We wish you an advance Happy Birthday filled with joy and celebrations!\n` +
      `Warmest regards,\n` +
      `*${senderName} Team*`
    );
  };

  const handleCopyWish = (item: (typeof upcomingCustomers)[0]) => {
    const text = generateAdvanceWishText(item);
    navigator.clipboard.writeText(text);
    setCopiedId(item.customer.id);
    if (onShowToast) {
      onShowToast(`Copied advance WhatsApp greeting for ${item.customer.name}!`);
    }
    setTimeout(() => {
      setCopiedId(null);
    }, 2200);
  };

  const handleOpenWhatsAppUrl = (item: (typeof upcomingCustomers)[0]) => {
    const text = generateAdvanceWishText(item);
    const cleanPhone = item.customer.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-slate-900 border border-indigo-500/30 hover:border-indigo-500/50 rounded-2xl shadow-xl overflow-hidden transition">
      {/* Header Bar */}
      <div className="px-5 py-4 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border-b border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-indigo-500/20">
            <Calendar className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Upcoming Birthdays (Next 7 Days)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold">
                  {upcomingCustomers.length} Upcoming
                </span>
              </h3>
              {tomorrowCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>{tomorrowCount} Tomorrow</span>
                </span>
              )}
            </div>
            <p className="text-xs text-indigo-300/80 mt-0.5">
              आगामी 7 दिनों के जन्मदिन - अग्रिम बधाई संदेश व 20% वाउचर पहले से तैयार करें (Prepare greetings in advance)
            </p>
          </div>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setIsSectionOpen(!isSectionOpen)}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            {isSectionOpen ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Collapse</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Expand ({upcomingCustomers.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Body */}
      {isSectionOpen && (
        <div className="p-5 space-y-4">
          {/* Filter Tabs & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setFilterRange('all')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                  filterRange === 'all'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All 7 Days ({upcomingCustomers.length})
              </button>

              <button
                onClick={() => setFilterRange('tomorrow')}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition cursor-pointer ${
                  filterRange === 'tomorrow'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Tomorrow ({tomorrowCount})</span>
              </button>

              <button
                onClick={() => setFilterRange('2-3days')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                  filterRange === '2-3days'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Next 2-3 Days ({next2to3Count})
              </button>

              <button
                onClick={() => setFilterRange('4-7days')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                  filterRange === '4-7days'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Days 4-7 ({next4to7Count})
              </button>
            </div>

            {/* Search Box */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search upcoming celebrants..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* List of Upcoming Celebrants */}
          {filteredList.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800 text-slate-400">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">
                {upcomingCustomers.length === 0
                  ? 'No upcoming birthdays in the next 7 days.'
                  : 'No upcoming birthdays match your selected filter.'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {upcomingCustomers.length === 0
                  ? 'All customers are up to date! Check the Month-wise celebration calendar for birthdays later in the month.'
                  : 'Try selecting "All 7 Days" or clearing your search query.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredList.map((item) => {
                const { customer, daysLeft, label, formattedDate, weekday, turningAge, plan } = item;
                const isTomorrow = daysLeft === 1;
                const isExpanded = expandedPreviewId === customer.id;

                return (
                  <div
                    key={customer.id}
                    className={`rounded-2xl p-4 border flex flex-col justify-between transition relative overflow-hidden ${
                      isTomorrow
                        ? 'bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/5'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Timing & Status Tag */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide ${
                          isTomorrow
                            ? 'bg-amber-500 text-slate-950 shadow-sm animate-pulse'
                            : daysLeft <= 3
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {label} &bull; {weekday}, {formattedDate}
                        </span>
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${plan.badgeColor}`}
                      >
                        {plan.name.split(' ')[1] || 'VIP'} ({plan.discountPercent}% OFF)
                      </span>
                    </div>

                    {/* Customer Main Info */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                            <span>{customer.name}</span>
                            <span className="text-xs" title={`Turning ${turningAge}`}>
                              🎂
                            </span>
                          </h4>
                          <p className="text-xs text-indigo-300 font-medium mt-0.5">
                            Turning <strong className="text-white">{turningAge}</strong> on {formatDOB(customer.dob)}
                          </p>
                        </div>
                      </div>

                      {/* Phone & Location */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-mono text-emerald-400">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{customer.phone}</span>
                        </span>
                        {customer.city && (
                          <span className="text-slate-500">&bull; {customer.city}</span>
                        )}
                      </div>
                    </div>

                    {/* Expandable Preview of Advance Greeting */}
                    {isExpanded && (
                      <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-300 space-y-2 animate-fade-in">
                        <div className="flex items-center justify-between text-indigo-400 font-semibold border-b border-slate-800 pb-1.5">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Advance Greeting Preview ({senderName})</span>
                          </span>
                          <span className="text-[10px] text-slate-500">Auto-filled</span>
                        </div>
                        <p className="whitespace-pre-line leading-relaxed text-slate-300 font-mono text-[10px] bg-slate-950 p-2 rounded-lg border border-slate-800">
                          {generateAdvanceWishText(item)}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {/* Primary: Open Greeting Composer */}
                        {onOpenSendGreeting && (
                          <button
                            type="button"
                            onClick={() => onOpenSendGreeting(customer)}
                            className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:to-pink-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition cursor-pointer"
                            title="Open Full Greeting Studio to prepare and customize"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Prepare Greeting</span>
                          </button>
                        )}

                        {/* WhatsApp One-Click Direct Link */}
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsAppUrl(item)}
                          className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 shadow cursor-pointer active:scale-95 transition"
                          title="Open directly in WhatsApp with advance greeting pre-filled"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-slate-950" />
                          <span>WhatsApp</span>
                        </button>

                        {/* Copy Advance Wish */}
                        <button
                          type="button"
                          onClick={() => handleCopyWish(item)}
                          className="p-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                          title="Copy Advance Birthday Message"
                        >
                          {copiedId === customer.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Toggle Quick Text Preview */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPreviewId(isExpanded ? null : customer.id)
                        }
                        className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center justify-center gap-1 py-0.5 cursor-pointer transition"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            <span>Hide Message Preview</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            <span>Inspect Advance Message Preview</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
