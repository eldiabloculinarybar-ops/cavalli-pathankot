import React from 'react';
import {
  Cake,
  Sparkles,
  LogOut,
  ShieldCheck,
  Calendar,
  Users,
  History,
  Sliders,
  Zap,
  Server,
  PartyPopper
} from 'lucide-react';
import { isFast2SmsLive } from '../utils/smsService';

interface NavbarProps {
  adminEmail: string;
  adminName: string;
  onLogout: () => void;
  activeTab: 'monthwise' | 'directory' | 'parties' | 'approvals' | 'templates' | 'logs';
  setActiveTab: (tab: 'monthwise' | 'directory' | 'parties' | 'approvals' | 'templates' | 'logs') => void;
  onAddNewCustomer: () => void;
  onAddNewParty?: () => void;
  onOpenGatewaySettings: () => void;
  onOpenHostingerModal?: () => void;
  todayCount: number;
  partyCount?: number;
  pendingApprovalsCount: number;
  autoSendEnabled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  adminEmail,
  adminName,
  onLogout,
  activeTab,
  setActiveTab,
  onAddNewCustomer,
  onAddNewParty,
  onOpenGatewaySettings,
  onOpenHostingerModal,
  todayCount,
  partyCount = 0,
  pendingApprovalsCount,
  autoSendEnabled
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <Cake className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">
                  Cavalli Club
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                VIP Birthdays &amp; Party Bookings Portal
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('monthwise')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'monthwise'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Month Calendar</span>
              {todayCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                  {todayCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'directory'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Customers</span>
            </button>

            {/* NEW: Party Bookings Tab */}
            <button
              onClick={() => setActiveTab('parties')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'parties'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm ring-1 ring-pink-400/30'
                  : 'text-pink-300 hover:text-pink-100 hover:bg-pink-500/10'
              }`}
            >
              <PartyPopper className="w-3.5 h-3.5 text-pink-400" />
              <span>पार्टी बुकिंग (Parties)</span>
              {partyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-white font-extrabold text-[10px]">
                  {partyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'approvals'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Approvals</span>
              {pendingApprovalsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] animate-pulse">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'templates'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Templates</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'logs'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Logs</span>
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2">
            {/* Quick Add Party Button */}
            {onAddNewParty && (
              <button
                onClick={onAddNewParty}
                title="Add New Party Booking (नई पार्टी बुक करें)"
                className="px-3 py-1.5 rounded-xl border border-pink-500/40 bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shadow-sm"
              >
                <PartyPopper className="w-3.5 h-3.5 text-pink-400" />
                <span className="hidden sm:inline">+ नई पार्टी (+ Book Party)</span>
                <span className="sm:hidden">+ Party</span>
              </button>
            )}

            {/* Admin Fast2SMS Gateway Config Button */}
            <button
              onClick={onOpenGatewaySettings}
              title="Fast2SMS API Settings (Admin Only)"
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition hidden md:flex items-center gap-1.5 shadow-sm ${
                isFast2SmsLive()
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fast2SMS: LIVE 🟢</span>
            </button>

            {/* Hostinger Deployment Guide Button */}
            {onOpenHostingerModal && (
              <button
                onClick={onOpenHostingerModal}
                title="Deploy to Hostinger Guide (होस्टिंगर गाइड)"
                className="px-2.5 py-1.5 rounded-xl border border-purple-500/40 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-xs font-bold cursor-pointer transition hidden xl:flex items-center gap-1.5 shadow-sm"
              >
                <Server className="w-3.5 h-3.5 text-purple-400" />
                <span>Hostinger 🚀</span>
              </button>
            )}

            {/* Add Customer Button */}
            <button
              onClick={onAddNewCustomer}
              className="px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md shadow-rose-500/25 flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">+ Customer</span>
            </button>

            {/* Admin Profile & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight">{adminName}</p>
                <p className="text-[10px] text-amber-400 font-mono">👑 9781395857</p>
              </div>

              <button
                onClick={onLogout}
                title="Admin Logout"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-800/80 text-xs text-slate-400 overflow-x-auto">
          <button
            onClick={() => setActiveTab('monthwise')}
            className={`py-1 px-2 font-medium shrink-0 ${activeTab === 'monthwise' ? 'text-rose-400 font-bold' : ''}`}
          >
            Months
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`py-1 px-2 font-medium shrink-0 ${activeTab === 'directory' ? 'text-rose-400 font-bold' : ''}`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab('parties')}
            className={`py-1 px-2 font-bold shrink-0 flex items-center gap-1 ${activeTab === 'parties' ? 'text-pink-400 font-black' : 'text-pink-300'}`}
          >
            <span>🎉 Parties</span>
            {partyCount > 0 && (
              <span className="px-1 py-0.2 bg-pink-500 text-white font-extrabold rounded-full text-[9px]">
                {partyCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`py-1 px-2 font-medium shrink-0 relative ${activeTab === 'approvals' ? 'text-rose-400 font-bold' : ''}`}
          >
            Approvals
            {pendingApprovalsCount > 0 && (
              <span className="ml-1 px-1 py-0.2 bg-amber-400 text-slate-950 font-black rounded-full text-[9px]">
                {pendingApprovalsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-1 px-2 font-medium shrink-0 ${activeTab === 'templates' ? 'text-rose-400 font-bold' : ''}`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-1 px-2 font-medium shrink-0 ${activeTab === 'logs' ? 'text-rose-400 font-bold' : ''}`}
          >
            Logs
          </button>
        </div>
      </div>
    </header>
  );
};
