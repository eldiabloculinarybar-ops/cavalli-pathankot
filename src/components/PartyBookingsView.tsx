import React, { useState } from 'react';
import { PartyBooking, PartyBookingStatus } from '../types';
import {
  PartyPopper,
  Calendar,
  Clock,
  Users,
  UtensilsCrossed,
  Phone,
  Cake,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock4,
  AlertCircle,
  XCircle,
  Edit3,
  Trash2,
  MapPin,
  IndianRupee,
  Share2,
  Send,
  Sparkles
} from 'lucide-react';
import { calculateAge, formatDOB } from '../utils/dateUtils';
import { triggerConfetti } from './CelebrationConfetti';

interface PartyBookingsViewProps {
  bookings: PartyBooking[];
  onAddNewBooking: () => void;
  onEditBooking: (booking: PartyBooking) => void;
  onDeleteBooking: (bookingId: string) => void;
  onUpdateStatus: (bookingId: string, status: PartyBookingStatus) => void;
  onShowToast: (msg: string) => void;
}

export const PartyBookingsView: React.FC<PartyBookingsViewProps> = ({
  bookings,
  onAddNewBooking,
  onEditBooking,
  onDeleteBooking,
  onUpdateStatus,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PartyBookingStatus>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Format datetime: "2026-11-05T20:00" -> "Thu, 05 Nov 2026 • 08:00 PM"
  const formatPartyDateTime = (dtStr: string) => {
    try {
      const dt = new Date(dtStr);
      if (isNaN(dt.getTime())) return dtStr;
      const datePart = dt.toLocaleDateString('hi-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const timePart = dt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return `${datePart} • ${timePart}`;
    } catch {
      return dtStr;
    }
  };

  const isPartyUpcoming = (dtStr: string) => {
    try {
      const partyDate = new Date(dtStr).getTime();
      return partyDate >= Date.now();
    } catch {
      return false;
    }
  };

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerPhone.includes(searchQuery) ||
      b.partyMenu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.tableOrArea && b.tableOrArea.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalBookingsCount = bookings.length;
  const upcomingCount = bookings.filter((b) => isPartyUpcoming(b.partyDateTime) && b.status !== 'cancelled').length;
  const totalGuestsExpected = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.memberCount || 0), 0);
  const totalAdvanceCollected = bookings
    .reduce((sum, b) => sum + (b.advancePaid || 0), 0);

  const getStatusBadge = (status: PartyBookingStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmed</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Clock4 className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            <Sparkles className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
    }
  };

  const handleShareDetails = (booking: PartyBooking) => {
    const formatted = `🍾 *CAVALLI CLUB - PARTY BOOKING CONFIRMATION*\n\n` +
      `👤 *Customer:* ${booking.customerName}\n` +
      `📅 *Date & Time:* ${formatPartyDateTime(booking.partyDateTime)}\n` +
      `👥 *Members:* ${booking.memberCount} Persons\n` +
      `🍽️ *Menu:* ${booking.partyMenu}\n` +
      `📍 *Area:* ${booking.tableOrArea || 'VIP Lounge'}\n` +
      `🎂 *DOB:* ${booking.customerDob}\n` +
      `💰 *Advance Paid:* ₹${booking.advancePaid || 0}\n\n` +
      `Thank you for celebrating with Cavalli Club! 🎉`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(formatted);
      onShowToast(`पार्टी विवरण क्लिपबोर्ड में कॉपी कर लिया गया है!`);
      triggerConfetti('small');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-pink-950 border border-pink-500/30 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 flex items-center justify-center text-white shadow-xl shadow-pink-500/25 shrink-0">
              <PartyPopper className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  पार्टी व इवेंट बुकिंग्स (Party Bookings)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 text-xs font-bold">
                  {upcomingCount} Upcoming Parties
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                ग्राहकों की पार्टी की तारीख, समय, सदस्यों की संख्या, पार्टी का मेन्यू, जन्म तिथि व संपर्क विवरण एक ही जगह प्रबंधित करें।
              </p>
            </div>
          </div>

          <button
            onClick={onAddNewBooking}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-600 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-pink-500/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ नई पार्टी बुक करें (Add Party)</span>
          </button>
        </div>

        {/* 4 Quick Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>कुल पार्टी बुकिंग</span>
              <PartyPopper className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1 font-mono">
              {totalBookingsCount}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Total Registered</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>आगामी पार्टियां (Upcoming)</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1 font-mono">
              {upcomingCount}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Active / Scheduled</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>कुल अपेक्षित मेहमान (Guests)</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-300 mt-1 font-mono">
              {totalGuestsExpected}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Total Persons</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>जमा अग्रिम राशि (Advance)</span>
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1 font-mono">
              ₹{totalAdvanceCollected.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Advance Received</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ग्राहक का नाम, मोबाइल नंबर, मेन्यू आइटम या एरिया से खोजें..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 outline-none focus:border-pink-400 transition"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          {(['all', 'confirmed', 'pending', 'completed', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-pink-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'all' ? 'सभी (All)' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Booking Cards Grid */}
      {filteredBookings.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-3">
          <div className="w-16 h-16 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 mx-auto flex items-center justify-center">
            <PartyPopper className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">कोई पार्टी बुकिंग नहीं मिली</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery
              ? `"${searchQuery}" से मेल खाती कोई बुकिंग नहीं मिली।`
              : 'अभी तक कोई पार्टी बुकिंग दर्ज नहीं की गई है। नई बुकिंग जोड़ने के लिए नीचे दिए बटन पर क्लिक करें।'}
          </p>
          <button
            onClick={onAddNewBooking}
            className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ नई पार्टी जोड़ें (New Booking)</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBookings.map((booking) => {
            const ageObj = booking.customerDob ? calculateAge(booking.customerDob) : null;
            const currentAge = ageObj?.currentAge ?? null;
            const isUpcoming = isPartyUpcoming(booking.partyDateTime);

            return (
              <div
                key={booking.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-pink-500/40 rounded-3xl p-5 shadow-xl transition space-y-4 relative flex flex-col justify-between group overflow-hidden"
              >
                {/* Accent top glow */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 opacity-60 group-hover:opacity-100 transition" />

                <div className="space-y-3.5">
                  {/* Card Header: Customer Info + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                        <span>{booking.customerName}</span>
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mt-0.5">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{booking.customerPhone}</span>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  {/* Customer DOB Badge */}
                  <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Cake className="w-3.5 h-3.5 text-pink-400" />
                      <span>जन्म तिथि (DOB):</span>
                    </span>
                    <span className="font-semibold text-slate-200">
                      {booking.customerDob} {currentAge !== null && currentAge > 0 && <span className="text-[10px] text-slate-400 font-normal">({currentAge} वर्ष)</span>}
                    </span>
                  </div>

                  {/* Party Date & Time Highlight Card */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-slate-950 border border-pink-500/25 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-pink-300 font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-pink-400" />
                        <span>पार्टी की तारीख एवं समय:</span>
                      </span>
                      {isUpcoming && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.2 rounded-full border border-amber-500/30">
                          Upcoming
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-white font-mono tracking-wide">
                      {formatPartyDateTime(booking.partyDateTime)}
                    </p>
                  </div>

                  {/* Party Members / Guests count & Area */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">पार्टी सदस्य (Members):</span>
                      <span className="text-sm font-black text-indigo-300 font-mono flex items-center gap-1 mt-0.5">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{booking.memberCount} व्यक्ति</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">लाउंज / एरिया:</span>
                      <span className="text-xs font-bold text-slate-200 truncate block mt-0.5" title={booking.tableOrArea}>
                        {booking.tableOrArea || 'VIP Lounge'}
                      </span>
                    </div>
                  </div>

                  {/* Party Menu Box */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
                      <span>पार्टी मेन्यू (Party Menu):</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal line-clamp-3">
                      {booking.partyMenu}
                    </p>
                  </div>

                  {/* Advance / Billing pill */}
                  {(booking.advancePaid || booking.totalAmount) && (
                    <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      <span className="text-[11px]">अग्रिम (Advance): <strong>₹{booking.advancePaid || 0}</strong></span>
                      {booking.totalAmount && (
                        <span className="text-[11px] text-slate-400">कुल अनुमान: ₹{booking.totalAmount}</span>
                      )}
                    </div>
                  )}

                  {/* Special Notes if any */}
                  {booking.specialNotes && (
                    <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded-xl border border-slate-800/50">
                      📝 {booking.specialNotes}
                    </p>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 mt-2">
                  {/* Status Toggle Dropdown */}
                  <select
                    value={booking.status}
                    onChange={(e) => onUpdateStatus(booking.id, e.target.value as PartyBookingStatus)}
                    className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs outline-none cursor-pointer focus:border-pink-400"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleShareDetails(booking)}
                      title="पार्टी डिटेल्स कॉपी करें"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onEditBooking(booking)}
                      title="संपादित करें (Edit)"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteBooking(booking.id)}
                      title="हटाएं (Delete)"
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
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
  );
};
