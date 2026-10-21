import React, { useState } from 'react';
import { Customer, SubscriptionTierId } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/initialData';
import { formatDOB, calculateAge, getMonthFromDOB, MONTH_NAMES, isBirthdayToday } from '../utils/dateUtils';
import {
  Search,
  Filter,
  Download,
  Mail,
  Edit2,
  Trash2,
  Plus,
  Crown,
  Calendar,
  MessageCircle,
  FileSpreadsheet
} from 'lucide-react';

interface CustomerListTableProps {
  customers: Customer[];
  onOpenSendWhatsApp: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onAddNewCustomer: () => void;
}

export const CustomerListTable: React.FC<CustomerListTableProps> = ({
  customers,
  onOpenSendWhatsApp,
  onEditCustomer,
  onDeleteCustomer,
  onAddNewCustomer
}) => {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');

  const filteredCustomers = React.useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.city && c.city.toLowerCase().includes(search.toLowerCase()));

      const matchTier = tierFilter === 'all' || c.subscriptionTier === tierFilter;
      const matchMonth =
        monthFilter === 'all' || getMonthFromDOB(c.dob) === parseInt(monthFilter, 10);

      return matchSearch && matchTier && matchMonth;
    });
  }, [customers, search, tierFilter, monthFilter]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Date of Birth', 'Subscription Plan', 'City', 'Preferred Channel'];
    const rows = filteredCustomers.map((c) => [
      c.id,
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      c.dob,
      `"${SUBSCRIPTION_PLANS[c.subscriptionTier]?.name || c.subscriptionTier}"`,
      `"${c.city || ''}"`,
      c.preferredChannel || 'both'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `janamdin_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Customer Directory &amp; Subscription Master</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
              {filteredCustomers.length} Records
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage customer profiles, phone numbers, birth dates, and active celebratory subscription tiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onAddNewCustomer}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="नाम, फ़ोन या ईमेल खोजें..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-rose-400 transition"
          />
        </div>

        {/* Filter by Month */}
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="bg-transparent text-slate-200 text-xs focus:outline-none w-full cursor-pointer"
          >
            <option value="all">All Birth Months (सभी माह)</option>
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={String(idx)}>
                {name} Birthdays
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Subscription Tier */}
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs">
          <Crown className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-transparent text-slate-200 text-xs focus:outline-none w-full cursor-pointer"
          >
            <option value="all">All Subscriptions (सभी प्लान)</option>
            <option value="1month">1-Month Celebration (₹500, 20% OFF)</option>
            <option value="3month">3-Month Premium (₹1000, 20% OFF)</option>
            <option value="gold">Gold VIP Club</option>
            <option value="platinum">Platinum Royal</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Customer Name</th>
              <th className="py-3 px-4">Phone Number</th>
              <th className="py-3 px-4">Date of Birth (DOB)</th>
              <th className="py-3 px-4">Subscription Plan</th>
              <th className="py-3 px-4">Email ID</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  कोई ग्राहक नहीं मिला (No customers match the criteria)
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => {
                const plan = SUBSCRIPTION_PLANS[c.subscriptionTier] || SUBSCRIPTION_PLANS.basic;
                const isToday = isBirthdayToday(c.dob);
                const { currentAge, turningAge } = calculateAge(c.dob);
                const monthName = MONTH_NAMES[getMonthFromDOB(c.dob)];

                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-slate-800/50 transition ${
                      isToday ? 'bg-rose-500/10' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span>{c.name}</span>
                        {isToday && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white text-[9px] font-black uppercase tracking-tight">
                            Today 🎂
                          </span>
                        )}
                      </div>
                      {c.city && <span className="text-[10px] text-slate-400">{c.city}</span>}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-200">
                      {c.phone}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{formatDOB(c.dob)}</div>
                      <div className="text-[10px] text-slate-400">
                        {monthName} &bull; Age {currentAge} (Turning {turningAge})
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${plan.badgeColor}`}>
                          <span>{plan.name}</span>
                          <span className="opacity-75">({plan.price})</span>
                        </span>
                        {c.subscriptionStatus === 'pending' ? (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <span>⏳ Pending Approval</span>
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <span>✓ Active Member</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="font-mono text-emerald-300 text-xs font-semibold">
                        {c.phone}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        Channel: WhatsApp VIP
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenSendWhatsApp(c)}
                          title="Send Birthday Greeting & VIP OTP via WhatsApp"
                          className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-slate-950" />
                          <span>WhatsApp OTP</span>
                        </button>

                        <button
                          onClick={() => onEditCustomer(c)}
                          title="Edit Customer or Change Subscription Plan"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteCustomer(c.id)}
                          title="Delete Customer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
