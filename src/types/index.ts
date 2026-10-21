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
