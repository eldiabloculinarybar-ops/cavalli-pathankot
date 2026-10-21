import React, { useState } from 'react';
import { Customer, SubscriptionTierId } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/initialData';
import { formatDOB, calculateAge } from '../utils/dateUtils';
import { triggerConfetti } from './CelebrationConfetti';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Crown,
  Phone,
  Mail,
  Calendar,
  Gift,
  Search,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface AdminApprovalsViewProps {
  customers: Customer[];
  onApproveSubscription: (customerId: string, planId: SubscriptionTierId) => void;
  onRejectSubscription: (customerId: string) => void;
  onViewAsCustomer?: (customer: Customer) => void;
}

export const AdminApprovalsView: React.FC<AdminApprovalsViewProps> = ({
  customers,
  onApproveSubscription,
  onRejectSubscription,
  onViewAsCustomer
}) => {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [search, setSearch] = useState('');

  const requests = customers.filter((c) => {
    const isPending = c.subscriptionStatus === 'pending';
    const isApproved = c.subscriptionStatus === 'approved' || c.subscriptionStatus === 'active';

    if (filter === 'pending') return isPending;
    if (filter === 'approved') return isApproved;
    return true;
  });

  const filteredRequests = requests.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = customers.filter((c) => c.subscriptionStatus === 'pending').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Customer Subscription Approvals (एडमिन मंज़ूरी)</span>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review and approve customer requests for 1-Month (₹500, 20% OFF) and 3-Month (₹1000, 20% OFF) celebration plans.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              filter === 'pending'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending ({pendingCount})</span>
          </button>

          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              filter === 'approved'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved</span>
          </button>

          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Requests
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ग्राहक का नाम या फ़ोन नंबर खोजें..."
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400"
        />
      </div>

      {/* Requests Grid / Table */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl">
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-white">
            {filter === 'pending'
              ? 'कोई नया सब्सक्रिप्शन अनुरोध लंबित नहीं है (No pending subscription requests)'
              : 'कोई अनुरोध नहीं मिला'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            When customers select the 1-Month (₹500) or 3-Month (₹1000) plan via phone OTP login, their requests will appear here for your approval.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((customer) => {
            const planId = customer.requestedPlanId || customer.subscriptionTier || '1month';
            const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS['1month'];
            const isPending = customer.subscriptionStatus === 'pending';
            const isApproved =
              customer.subscriptionStatus === 'approved' || customer.subscriptionStatus === 'active';
            const ageInfo = calculateAge(customer.dob);

            return (
              <div
                key={customer.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  isPending
                    ? 'bg-slate-950/80 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
                    : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top line: Customer name and status badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">
                        {customer.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        DOB: <strong className="text-slate-200">{formatDOB(customer.dob)}</strong> (Turning {ageInfo.turningAge} yrs)
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {isPending ? (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Needs Approval</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved &amp; Active</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Plan Requested Highlight Box */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Requested Plan:
                      </span>
                      <div className="font-extrabold text-white text-sm flex items-center gap-1.5 mt-0.5">
                        <span>{plan.name}</span>
                        <span className="text-amber-300 font-mono">({plan.price})</span>
                      </div>
                    </div>

                    <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                      20% Discount
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-3 space-y-1 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-mono text-slate-200">{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-slate-300 truncate">{customer.email}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => onRejectSubscription(customer.id)}
                        className="px-3 py-1.5 rounded-xl border border-red-500/30 hover:bg-red-500/20 text-red-300 text-xs font-semibold cursor-pointer transition flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => {
                          onApproveSubscription(customer.id, planId);
                          triggerConfetti('grand');
                        }}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer transition flex items-center gap-1.5 active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Plan ({plan.price})</span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between text-xs text-slate-400">
                      <span className="text-emerald-400 font-medium">
                        ✓ Membership Active with 20% discount coupon
                      </span>

                      <div className="flex items-center gap-2">
                        {onViewAsCustomer && (
                          <button
                            onClick={() => onViewAsCustomer(customer)}
                            className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                            title="Open Customer View to see their live Membership Card"
                          >
                            <span>View Membership Card &rarr;</span>
                          </button>
                        )}

                        <button
                          onClick={() => onRejectSubscription(customer.id)}
                          className="text-[11px] text-slate-400 hover:text-red-400 underline cursor-pointer"
                        >
                          Revoke
                        </button>
                      </div>
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
