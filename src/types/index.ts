export type SubscriptionTierId =
  | '1month'
  | '3month'
  | 'basic'
  | 'silver'
  | 'gold'
  | 'platinum';

export type SubscriptionApprovalStatus = 'pending' | 'approved' | 'rejected' | 'active';

export interface SubscriptionPlan {
  id: SubscriptionTierId;
  name: string;
  badgeColor: string;
  accentColor: string;
  price: string;
  rawPrice: number;
  durationMonths: number;
  period: string;
  description: string;
  perks: string[];
  discountPercent: number;
  emailTemplateName: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dob: string; // YYYY-MM-DD
  anniversaryDate?: string; // YYYY-MM-DD (Optional)
  subscriptionTier: SubscriptionTierId;
  subscriptionStatus: SubscriptionApprovalStatus;
  requestedPlanId?: SubscriptionTierId;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  subscriptionRequestedAt?: string;
  subscriptionApprovedAt?: string;
  approvalRemarks?: string;
  notes?: string;
  city?: string;
  preferredChannel?: 'whatsapp' | 'email' | 'both';
  createdAt: string;
}

export interface WhatsAppLog {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  subject?: string;
  messageBody: string;
  sentAt: string;
  status: 'sent' | 'queued' | 'delivered' | 'failed';
  tierUsed: SubscriptionTierId;
  automationType: 'automated_cron' | 'manual_one_click';
  discountCode?: string;
  birthdayOtp?: string;
  channel?: 'whatsapp' | 'email';
}
export type EmailLog = WhatsAppLog;

export interface WhatsAppTemplate {
  id: string;
  tierId: SubscriptionTierId;
  subject: string;
  heading: string;
  message: string;
  complimentaryGift: string;
}
export type EmailTemplate = WhatsAppTemplate;

export interface AdminUser {
  email: string;
  name: string;
  role: 'Super Admin' | 'Store Admin';
  avatar?: string;
}

export interface OTPVerification {
  phone: string;
  otp: string;
  generatedAt: number;
  expiresAt: number;
}

export type PartyBookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export interface PartyBooking {
  id: string;
  customerName: string; // ग्राहक का नाम
  customerPhone: string; // मोबाइल नंबर
  customerDob: string; // जन्म तिथि (Date of Birth)
  partyDateTime: string; // पार्टी की तारीख एवं समय (Date & Time: YYYY-MM-DDTHH:mm)
  memberCount: number; // पार्टी में कितने सदस्य/मेहमान होंगे (Guest / Member count)
  partyMenu: string; // पार्टी का मेन्यू (Party food, drinks & catering items)
  status: PartyBookingStatus; // स्थिति (Confirmed, Pending, etc.)
  tableOrArea?: string; // टेबल / हॉल / लाउंज एरिया (e.g. Cavalli VIP Lounge, Rooftop)
  advancePaid?: number; // अग्रिम राशि (Advance payment in ₹)
  totalAmount?: number; // कुल अनुमानित राशि (Total Amount in ₹)
  specialNotes?: string; // विशेष आवश्यकताएं / डेकोरेशन नोट्स
  createdAt: string;
}
