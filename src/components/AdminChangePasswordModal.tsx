import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Phone,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';
import { getAdminCredentials, saveAdminCredentials, type AdminCredentials } from '../utils/storage';
import { triggerConfetti } from './CelebrationConfetti';
import { playSmsIncomingSound } from '../utils/smsService';

interface AdminChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const AdminChangePasswordModal: React.FC<AdminChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const currentCreds = getAdminCredentials();

  const [phone, setPhone] = useState(currentCreds.phone || '9781395857');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check current password
    if (currentPassword !== currentCreds.password) {
      setError('वर्तमान पासवर्ड गलत है (Incorrect current password)');
      return;
    }

    if (newPassword.length < 6) {
      setError('नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए (New password must be at least 6 characters)');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते (Passwords do not match)');
      return;
    }

    const updated: AdminCredentials = {
      phone: phone.trim() || '9781395857',
      password: newPassword,
      name: currentCreds.name || 'Cavalli Administrator'
    };

    saveAdminCredentials(updated);
    setSuccess(true);
    triggerConfetti('medium');
    playSmsIncomingSound();
    onShowToast('🎉 Admin Password सफलतापूर्वक अपडेट हो गया!');

    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-md font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Admin Password बदलें</span>
                <span className="px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                  ADMIN ONLY
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Change your Cavalli Club Admin login password
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>पासवर्ड सफलतापूर्वक अपडेट हो गया!</span>
            </div>
          )}

          {/* Admin Mobile Info */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Phone Number (लॉगिन फोन)</span>
              </label>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                Verified
              </span>
            </div>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl text-white font-mono text-sm outline-none"
              placeholder="9781395857"
            />
            <p className="text-[10px] text-slate-500">
              Admin login ke liye official phone number: <strong className="text-slate-300">9781395857</strong>
            </p>
          </div>

          {/* Current Password */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">
              वर्तमान पासवर्ड (Current Password)
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white text-xs outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">
              नया पासवर्ड (New Password)
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white text-xs outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">
              नया पासवर्ड पुष्टि करें (Confirm New Password)
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white text-xs outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>पासवर्ड अपडेट करें (Save Password)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
