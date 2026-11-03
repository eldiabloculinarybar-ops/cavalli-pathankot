import React, { useState, useEffect } from 'react';
import { PartyBooking, PartyBookingStatus, Customer } from '../types';
import {
  X,
  PartyPopper,
  Calendar,
  Clock,
  Users,
  UtensilsCrossed,
  User,
  Phone,
  Sparkles,
  MapPin,
  IndianRupee,
  FileText,
  CheckCircle2,
  Cake
} from 'lucide-react';
import { triggerConfetti } from './CelebrationConfetti';

interface PartyBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBooking: (booking: PartyBooking) => void;
  initialBooking?: PartyBooking | null;
  existingCustomers?: Customer[];
}

const PRESET_MENU_ITEMS = [
  'Tandoori Paneer Tikka',
  'Chicken Malai Tikka',
  'Crispy Corn & Nachos',
  'Spring Rolls',
  'Virgin Mojito & Mocktails',
  'Signature Soft Drinks',
  'Dal Makhani & Butter Naan',
  'Paneer Butter Masala',
  'Dum Biryani (Veg/Non-Veg)',
  'Pasta Alfredo & Arrabiata',
  'Chocolate Truffle Cake',
  'Red Velvet Birthday Cake',
  'Gulab Jamun with Ice Cream'
];

const PRESET_AREAS = [
  'Cavalli VIP Rooftop Terrace',
  'Cavalli Velvet Lounge',
  'Main Banquet Hall',
  'Royal Private Suite',
  'Poolside Deck'
];

export const PartyBookingModal: React.FC<PartyBookingModalProps> = ({
  isOpen,
  onClose,
  onSaveBooking,
  initialBooking,
  existingCustomers = []
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+91 ');
  const [customerDob, setCustomerDob] = useState('1998-10-19');
  const [partyDateTime, setPartyDateTime] = useState('');
  const [memberCount, setMemberCount] = useState<number>(20);
  const [partyMenu, setPartyMenu] = useState('');
  const [status, setStatus] = useState<PartyBookingStatus>('confirmed');
  const [tableOrArea, setTableOrArea] = useState('Cavalli VIP Rooftop Terrace');
  const [advancePaid, setAdvancePaid] = useState<string>('5000');
  const [totalAmount, setTotalAmount] = useState<string>('25000');
  const [specialNotes, setSpecialNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  // Default next Saturday 8:00 PM helper
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7)); // Next Saturday
    d.setHours(20, 0, 0, 0); // 8:00 PM
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (initialBooking) {
      setCustomerName(initialBooking.customerName);
      setCustomerPhone(initialBooking.customerPhone);
      setCustomerDob(initialBooking.customerDob);
      setPartyDateTime(initialBooking.partyDateTime);
      setMemberCount(initialBooking.memberCount);
      setPartyMenu(initialBooking.partyMenu);
      setStatus(initialBooking.status);
      setTableOrArea(initialBooking.tableOrArea || PRESET_AREAS[0]);
      setAdvancePaid(initialBooking.advancePaid ? String(initialBooking.advancePaid) : '');
      setTotalAmount(initialBooking.totalAmount ? String(initialBooking.totalAmount) : '');
      setSpecialNotes(initialBooking.specialNotes || '');
    } else {
      setCustomerName('');
      setCustomerPhone('+91 ');
      setCustomerDob('1998-10-19');
      setPartyDateTime(getDefaultDateTime());
      setMemberCount(20);
      setPartyMenu('Tandoori Paneer Tikka, Chicken Malai Tikka, Mocktails & Soft Drinks, Dal Makhani, Butter Naan, Chocolate Truffle Birthday Cake');
      setStatus('confirmed');
      setTableOrArea(PRESET_AREAS[0]);
      setAdvancePaid('5000');
      setTotalAmount('25000');
      setSpecialNotes('VIP Birthday decoration with welcome drinks.');
    }
    setValidationError('');
  }, [initialBooking, isOpen]);

  if (!isOpen) return null;

  // Quick auto-fill from existing customers
  const handleSelectExistingCustomer = (c: Customer) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    if (c.dob) {
      setCustomerDob(c.dob);
    }
  };

  const handleAddMenuItem = (item: string) => {
    if (!partyMenu.trim()) {
      setPartyMenu(item);
    } else if (!partyMenu.includes(item)) {
      setPartyMenu(`${partyMenu}, ${item}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!customerName.trim()) {
      setValidationError('कृपया ग्राहक का नाम दर्ज करें (Please enter customer name)');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/[^0-9]/g, '').length < 10) {
      setValidationError('कृपया 10-अंकों का मान्य मोबाइल नंबर दर्ज करें (Valid phone required)');
      return;
    }
    if (!customerDob) {
      setValidationError('कृपया ग्राहक की जन्म तिथि (DOB) दर्ज करें');
      return;
    }
    if (!partyDateTime) {
      setValidationError('कृपया पार्टी की तारीख एवं समय (Date & Time) चुनें');
      return;
    }
    if (!memberCount || memberCount < 1) {
      setValidationError('कृपया पार्टी सदस्यों/मेहमानों की संख्या (कम से कम 1) दर्ज करें');
      return;
    }
    if (!partyMenu.trim()) {
      setValidationError('कृपया पार्टी का मेन्यू (Party Menu) दर्ज करें');
      return;
    }

    const booking: PartyBooking = {
      id: initialBooking?.id || `party-${Date.now()}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerDob,
      partyDateTime,
      memberCount: Number(memberCount),
      partyMenu: partyMenu.trim(),
      status,
      tableOrArea,
      advancePaid: advancePaid ? Number(advancePaid) : undefined,
      totalAmount: totalAmount ? Number(totalAmount) : undefined,
      specialNotes: specialNotes.trim() || undefined,
      createdAt: initialBooking?.createdAt || new Date().toISOString()
    };

    onSaveBooking(booking);
    triggerConfetti('grand');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-purple-950/80 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
              <PartyPopper className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{initialBooking ? 'पार्टी बुकिंग संपादित करें (Edit Party Booking)' : 'नई पार्टी बुकिंग जोड़ें (Add Party Booking)'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Cavalli Events
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ग्राहक की पार्टी की तारीख, समय, सदस्य संख्या, मेन्यू व जन्म तिथि प्रबंधित करें
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Customers Quick Picker (if available) */}
        {existingCustomers.length > 0 && !initialBooking && (
          <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[11px] text-slate-400 font-semibold shrink-0">
              ⚡ मौजूदा ग्राहक से चुनें:
            </span>
            <div className="flex items-center gap-1.5 flex-nowrap">
              {existingCustomers.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectExistingCustomer(c)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 hover:border-rose-400/50 border border-slate-700 text-slate-300 hover:text-white text-[11px] transition whitespace-nowrap cursor-pointer flex items-center gap-1"
                >
                  <User className="w-3 h-3 text-rose-400" />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
              <span>⚠️</span>
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Customer Details */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <User className="w-4 h-4 text-amber-400" />
              <span>1. ग्राहक का विवरण (Customer Details)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Customer Name (ग्राहक का नाम) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Verma"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mobile Number (मोबाइल नंबर) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Date of Birth (जन्म तिथि)</span>
                  <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Cake className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" />
                  <input
                    type="date"
                    required
                    value={customerDob}
                    onChange={(e) => setCustomerDob(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-pink-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Party Schedule & Members Count */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-pink-300 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-pink-400" />
              <span>2. पार्टी की तारीख, समय एवं सदस्य संख्या (Schedule &amp; Guests)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Party Date with Time */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Party Date &amp; Time (तारीख एवं समय)</span>
                  <span className="text-rose-400 font-bold">*</span>
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                  <input
                    type="datetime-local"
                    required
                    value={partyDateTime}
                    onChange={(e) => setPartyDateTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs font-semibold outline-none focus:border-amber-400"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  पार्टी शुरू होने का समय (उदाहरण: 2026-11-05 शाम 08:00 बजे)
                </p>
              </div>

              {/* Member Count */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Party Members Count (सदस्य / मेहमान संख्या)</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-xs font-black text-indigo-300 font-mono bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                    {memberCount} व्यक्ति (Guests)
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={memberCount}
                  onChange={(e) => setMemberCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs font-mono font-bold outline-none focus:border-indigo-400"
                />
                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500">त्वरित चयन:</span>
                  {[10, 15, 20, 30, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMemberCount(num)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                        memberCount === num
                          ? 'bg-indigo-500 text-white font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Party Menu */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
                <span>3. पार्टी का मेन्यू (Party Menu &amp; Catering)</span>
                <span className="text-rose-400">*</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal lowercase">
                क्लिक करके आइटम जोड़ें या टाइप करें
              </span>
            </div>

            {/* Quick Add Menu Item Chips */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_MENU_ITEMS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleAddMenuItem(item)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-emerald-500/20 border border-slate-700/80 hover:border-emerald-500/50 text-[11px] text-slate-300 hover:text-emerald-200 transition cursor-pointer flex items-center gap-1"
                >
                  <span>+</span>
                  <span>{item}</span>
                </button>
              ))}
            </div>

            {/* Menu Textarea */}
            <div>
              <textarea
                required
                rows={3}
                value={partyMenu}
                onChange={(e) => setPartyMenu(e.target.value)}
                placeholder="पार्टी में परोसे जाने वाले सभी व्यंजन (Startes, Main Course, Drinks, Birthday Cake इत्यादि) यहाँ दर्ज करें..."
                className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-emerald-400 leading-relaxed placeholder-slate-500"
              />
            </div>
          </div>

          {/* Section 4: Venue Area, Status & Payments */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-purple-300 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span>4. लाउंज एरिया, स्थिति व अग्रिम राशि (Venue &amp; Billing)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Venue Area */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Lounge / Area (लाउंज या हॉल)
                </label>
                <select
                  value={tableOrArea}
                  onChange={(e) => setTableOrArea(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-purple-400"
                >
                  {PRESET_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Booking Status (स्थिति)
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PartyBookingStatus)}
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-rose-400"
                >
                  <option value="confirmed">🟢 Confirmed (पुष्टि हुई)</option>
                  <option value="pending">🟡 Pending (लंबित)</option>
                  <option value="completed">🔵 Completed (सम्पन्न)</option>
                  <option value="cancelled">🔴 Cancelled (रद्द)</option>
                </select>
              </div>

              {/* Advance Paid */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Advance Paid (अग्रिम राशि ₹)
                </label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input
                    type="number"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(e.target.value)}
                    placeholder="5000"
                    className="w-full pl-8 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs font-mono outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>

            {/* Special Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Special Requests / Decor Notes (विशेष आवश्यकताएं या सजावट)
              </label>
              <input
                type="text"
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="उदा: केक कटिंग सेरेमनी, डीजे साउंड, बैलून डेकोरेशन..."
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-purple-400 placeholder-slate-500"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
            >
              रद्द करें (Cancel)
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-600 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-pink-500/25 flex items-center gap-2 cursor-pointer transition active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{initialBooking ? 'अपडेट करें (Save Changes)' : 'पार्टी बुकिंग सुरक्षित करें (Save Booking)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
