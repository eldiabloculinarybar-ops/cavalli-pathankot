import React, { useState } from 'react';
import { EmailLog } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/initialData';
import { History, CheckCircle, Trash2, Mail, Download, Filter, Search, Sparkles } from 'lucide-react';

interface AutomationLogsModalProps {
  logs: EmailLog[];
  onClearLogs: () => void;
}

export const AutomationLogsModal: React.FC<AutomationLogsModalProps> = ({
  logs,
  onClearLogs
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (log.customerEmail || log.customerPhone || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.subject || log.messageBody || '').toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleExportLogs = () => {
    const headers = ['ID', 'Customer Name', 'Phone/Email', 'Subscription Tier', 'Message/Subject', 'Discount Code', 'Sent At', 'Status', 'Type'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.customerName}"`,
      `"${l.customerPhone || l.customerEmail || ''}"`,
      `"${SUBSCRIPTION_PLANS[l.tierUsed]?.name || l.tierUsed}"`,
      `"${(l.subject || l.messageBody || '').replace(/"/g, '""')}"`,
      `"${l.discountCode || ''}"`,
      `"${new Date(l.sentAt).toLocaleString()}"`,
      l.status,
      l.automationType
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `janamdin_email_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-rose-400" />
            <span>Automated Email Notification Audit Logs</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700">
              {logs.length} Sent
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit log of all birthday wishes dispatched automatically on customers' special days.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportLogs}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-medium cursor-pointer transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="नाम, ईमेल या विषय खोजें..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-rose-400"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">All Delivery Statuses</option>
            <option value="delivered">Delivered</option>
            <option value="sent">Sent</option>
            <option value="queued">Queued</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Recipient</th>
              <th className="py-3 px-4">Subscription Plan</th>
              <th className="py-3 px-4">Email Subject &amp; Voucher</th>
              <th className="py-3 px-4">Dispatch Mode</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  कोई ईमेल लॉग नहीं मिला (No email dispatch logs recorded yet)
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const plan = SUBSCRIPTION_PLANS[log.tierUsed] || SUBSCRIPTION_PLANS.basic;

                return (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{log.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.customerEmail}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${plan.badgeColor}`}>
                        {plan.name}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200 line-clamp-1">{log.subject}</div>
                      {log.discountCode && (
                        <div className="text-[10px] text-amber-300 font-mono mt-0.5">
                          Voucher: {log.discountCode} ({plan.discountPercent}% OFF)
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {log.automationType === 'automated_cron' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <Sparkles className="w-3 h-3" />
                          <span>Daily Auto-Cron</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-purple-300 font-medium">
                          <Mail className="w-3 h-3" />
                          <span>1-Click Trigger</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(log.sentAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        <CheckCircle className="w-3 h-3" />
                        <span>Delivered</span>
                      </span>
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
