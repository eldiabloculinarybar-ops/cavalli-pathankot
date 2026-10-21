import { Customer, SubscriptionPlan, EmailTemplate, EmailLog } from '../types';

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  '1month': {
    id: '1month',
    name: 'Cavalli 1-Month Celebration Plan',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300',
    accentColor: 'from-emerald-500 to-teal-600',
    price: '₹500',
    rawPrice: 500,
    durationMonths: 1,
    period: '1 Month',
    description: '1 Month active Cavalli Club membership with 20% discount on birthday & automated email wish.',
    discountPercent: 20,
    emailTemplateName: 'Cavalli 1-Month 20% Celebration Card',
    perks: [
      'Flat 20% Cavalli Club Birthday Discount Coupon (Save ₹500+)',
      'Automated morning celebratory email on your birthday',
      'Personalized digital birthday greeting card',
      'One-tap WhatsApp greeting ready',
      '1 Month validity with Admin verified activation'
    ]
  },
  '3month': {
    id: '3month',
    name: 'Cavalli 3-Month VIP Plan',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300',
    accentColor: 'from-indigo-600 to-purple-600',
    price: '₹1,000',
    rawPrice: 1000,
    durationMonths: 3,
    period: '3 Months',
    description: 'Quarterly membership (₹1000) with 20% discount throughout 3 months & Cavalli VIP birthday perks.',
    discountPercent: 20,
    emailTemplateName: 'Cavalli 3-Month 20% VIP Birthday Gala',
    perks: [
      'Flat 20% Cavalli Discount Coupon valid for 3 full months',
      'Automated special morning email with digital confetti card',
      'VIP complimentary birthday surprise gift with voucher code',
      'Priority celebration delivery & dedicated wish service',
      '3 Months continuous validity with Admin verified activation'
    ]
  },
  gold: {
    id: 'gold',
    name: 'Gold VIP Club',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300',
    accentColor: 'from-amber-500 to-yellow-600',
    price: '₹1,299',
    rawPrice: 1299,
    durationMonths: 12,
    period: '1 Year',
    description: 'VIP celebratory suite with luxury gift voucher & personalized styling.',
    discountPercent: 25,
    emailTemplateName: 'Royal Gold Celebration Card',
    perks: [
      'Automated morning email (08:00 AM) with confetti preview',
      '25% Special VIP Birthday voucher code',
      'Automated WhatsApp + Email dual dispatch',
      'Personalized message from store owner'
    ]
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum Royal',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300',
    accentColor: 'from-purple-600 to-pink-600',
    price: '₹2,999',
    rawPrice: 2999,
    durationMonths: 12,
    period: '1 Year',
    description: 'Elite royal treatment with maximum discounts, custom gifts & concierge.',
    discountPercent: 35,
    emailTemplateName: 'Platinum Imperial Gala Wish',
    perks: [
      'Automated royal celebratory email + digital cake',
      '35% Flat Birthday voucher + Free Surprise Gift',
      'Multi-channel Email & WhatsApp broadcast',
      'Priority celebration alerts & dedicated relationship greeting'
    ]
  },
  basic: {
    id: 'basic',
    name: 'Janamdin Basic',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
    accentColor: 'from-slate-500 to-zinc-600',
    price: 'Free',
    rawPrice: 0,
    durationMonths: 12,
    period: 'Forever',
    description: 'Essential automated birthday email wish with friendly greeting card.',
    discountPercent: 5,
    emailTemplateName: 'Festive Classic Greeting',
    perks: [
      'Automated email wish on birthday morning',
      'Standard celebration greeting card',
      '5% Birthday discount voucher code'
    ]
  },
  silver: {
    id: 'silver',
    name: 'Silver Delight',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300',
    accentColor: 'from-blue-600 to-indigo-600',
    price: '₹499',
    rawPrice: 499,
    durationMonths: 12,
    period: '1 Year',
    description: 'Enriched birthday experience with custom coupon & WhatsApp integration.',
    discountPercent: 15,
    emailTemplateName: 'Silver Sparkle Greeting',
    perks: [
      'Automated high-definition birthday email',
      '15% Birthday celebration discount code',
      'One-tap WhatsApp greeting ready'
    ]
  }
};

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'template_1month',
    tierId: '1month',
    subject: '🎉 Cavalli Club: Happy Birthday {name}! Enjoy 20% OFF Birthday Privilege 🎂',
    heading: 'Cavalli Club Wishes You a Grand & Joyful Birthday!',
    message: 'We are thrilled to celebrate with you today! As an esteemed patron of Cavalli Club with the 1-Month Plan, your special day is unlocked with a flat 20% celebration discount.',
    complimentaryGift: 'Use code MONTH20 for flat 20% OFF on your Cavalli Club birthday celebration!'
  },
  {
    id: 'template_3month',
    tierId: '3month',
    subject: '🌟 Cavalli Club VIP: Grand Birthday Wishes {name}! Your 20% Privilege is Active ✨',
    heading: 'Cavalli Club Raises a Toast to Another Fabulous Year!',
    message: 'Happy Birthday! As our cherished Cavalli Club 3-Month Plan VIP member, you enjoy a flat 20% discount plus priority delivery for all your birthday festivities.',
    complimentaryGift: 'Use code QUARTER20 for flat 20% OFF + complimentary Cavalli surprise dessert / gift!'
  },
  {
    id: 'template_basic',
    tierId: 'basic',
    subject: '🎉 Happy Birthday from all of us! Enjoy a special gift inside 🎂',
    heading: 'Wishing You a Very Happy & Prosperous Birthday!',
    message: 'May this year bring you boundless happiness, great health, and tremendous success. As a token of our appreciation, please enjoy an exclusive birthday discount on your next visit.',
    complimentaryGift: 'Use code BDAY5 for 5% off your next purchase!'
  },
  {
    id: 'template_silver',
    tierId: 'silver',
    subject: '🌟 Happy Birthday {name}! Celebrate in style with 15% OFF 🎁',
    heading: 'Cheers to Another Amazing Year of Life and Joy!',
    message: 'On your special day, we wish you moments filled with smiles, laughter, and your favorite treats. We love having you in our Silver Delight family!',
    complimentaryGift: 'Use code SILVER15 for a flat 15% discount + complimentary celebration welcome.'
  },
  {
    id: 'template_gold',
    tierId: 'gold',
    subject: '👑 Royal Birthday Wishes {name}! Your VIP 25% Birthday Gift awaits ✨',
    heading: 'Happy Birthday to our Valued VIP Member!',
    message: 'You make our community truly special. May your birthday be as wonderful, vibrant, and extraordinary as you are! We have reserved your exclusive VIP celebratory privileges.',
    complimentaryGift: 'Use VIP code GOLDVIP25 for 25% OFF + Free dessert / priority delivery voucher!'
  },
  {
    id: 'template_platinum',
    tierId: 'platinum',
    subject: '💎 Platinum Celebration: A Grand Happy Birthday to {name}! 🥂',
    heading: 'Warmest Imperial Wishes on Your Special Day!',
    message: 'Our entire team raises a toast to you today! Thank you for being one of our most distinguished Platinum Royal patrons. May all your dreams and aspirations flourish this year.',
    complimentaryGift: 'Use code PLATINUM35 for 35% OFF + Your surprise royal gift is ready for pickup or express delivery!'
  }
];

const today = new Date();
const currentMonth = today.getMonth() + 1;
const currentDay = today.getDate();
const pad = (n: number) => String(n).padStart(2, '0');

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Aarav Sharma',
    phone: '+91 98765 43210',
    email: 'aarav.sharma@example.com',
    dob: `1995-${pad(currentMonth)}-${pad(currentDay)}`, // TODAY!
    subscriptionTier: '1month',
    subscriptionStatus: 'active',
    subscriptionStartDate: '2026-10-01',
    subscriptionEndDate: '2026-11-01',
    city: 'New Delhi',
    notes: 'Selected 1-Month Plan (₹500 with 20% discount)',
    preferredChannel: 'both',
    createdAt: '2026-10-01T10:30:00Z'
  },
  {
    id: 'cust-2',
    name: 'Priya Patel',
    phone: '+91 98221 12345',
    email: 'priya.patel@example.com',
    dob: `1998-${pad(currentMonth)}-${pad(currentDay)}`, // TODAY!
    subscriptionTier: '3month',
    subscriptionStatus: 'active',
    subscriptionStartDate: '2026-09-15',
    subscriptionEndDate: '2026-12-15',
    city: 'Mumbai',
    notes: 'Selected 3-Month Plan (₹1000 with 20% discount)',
    preferredChannel: 'both',
    createdAt: '2026-09-15T11:20:00Z'
  },
  {
    id: 'cust-pending-1',
    name: 'Rahul Kapoor',
    phone: '+91 98111 22334',
    email: 'rahul.kapoor@example.com',
    dob: `1997-${pad(currentMonth)}-${pad(Math.min(28, currentDay + 3))}`,
    subscriptionTier: '1month',
    subscriptionStatus: 'pending',
    requestedPlanId: '1month',
    subscriptionRequestedAt: '2026-10-19T10:15:00Z',
    city: 'Chandigarh',
    notes: 'Customer requested 1-Month Plan (₹500, 20% OFF) via Phone OTP login',
    preferredChannel: 'both',
    createdAt: '2026-10-19T10:15:00Z'
  },
  {
    id: 'cust-pending-2',
    name: 'Sneha Kulkarni',
    phone: '+91 99223 34455',
    email: 'sneha.kulkarni@example.com',
    dob: `1993-${pad(currentMonth)}-${pad(Math.min(28, currentDay + 7))}`,
    subscriptionTier: '3month',
    subscriptionStatus: 'pending',
    requestedPlanId: '3month',
    subscriptionRequestedAt: '2026-10-19T11:45:00Z',
    city: 'Pune',
    notes: 'Customer requested 3-Month Plan (₹1000, 20% OFF) via Phone OTP login',
    preferredChannel: 'both',
    createdAt: '2026-10-19T11:45:00Z'
  },
  {
    id: 'cust-3',
    name: 'Rohan Verma',
    phone: '+91 99887 76655',
    email: 'rohan.verma@example.com',
    dob: `1992-${pad(currentMonth)}-${pad(Math.min(28, currentDay + 2))}`,
    subscriptionTier: '1month',
    subscriptionStatus: 'active',
    subscriptionStartDate: '2026-10-10',
    subscriptionEndDate: '2026-11-10',
    city: 'Bengaluru',
    notes: 'Regular weekend shopper',
    preferredChannel: 'email',
    createdAt: '2026-10-10T09:15:00Z'
  },
  {
    id: 'cust-4',
    name: 'Ananya Iyer',
    phone: '+91 97112 33445',
    email: 'ananya.iyer@example.com',
    dob: `2000-${pad(currentMonth)}-${pad(Math.min(28, currentDay + 5))}`,
    subscriptionTier: '3month',
    subscriptionStatus: 'active',
    subscriptionStartDate: '2026-09-01',
    subscriptionEndDate: '2026-12-01',
    city: 'Chennai',
    notes: 'Loves organic skincare gift kits',
    preferredChannel: 'both',
    createdAt: '2026-09-01T14:45:00Z'
  },
  {
    id: 'cust-5',
    name: 'Vikramaditya Rao',
    phone: '+91 98450 99887',
    email: 'vikram.rao@example.com',
    dob: '1988-01-15',
    subscriptionTier: '3month',
    subscriptionStatus: 'active',
    subscriptionStartDate: '2026-01-01',
    city: 'Hyderabad',
    notes: 'Corporate client',
    preferredChannel: 'both',
    createdAt: '2026-01-01T12:00:00Z'
  },
  {
    id: 'cust-6',
    name: 'Simran Kaur',
    phone: '+91 98110 55443',
    email: 'simran.kaur@example.com',
    dob: '1996-02-14',
    subscriptionTier: '1month',
    subscriptionStatus: 'active',
    city: 'Chandigarh',
    notes: 'Likes red velvet cards',
    preferredChannel: 'whatsapp',
    createdAt: '2026-02-01T08:30:00Z'
  },
  {
    id: 'cust-7',
    name: 'Aditya Deshmukh',
    phone: '+91 99200 11223',
    email: 'aditya.deshmukh@example.com',
    dob: '1994-03-22',
    subscriptionTier: '1month',
    subscriptionStatus: 'active',
    city: 'Pune',
    notes: 'College professor',
    preferredChannel: 'email',
    createdAt: '2026-03-10T16:20:00Z'
  },
  {
    id: 'cust-8',
    name: 'Neha Singhal',
    phone: '+91 98101 22334',
    email: 'neha.singhal@example.com',
    dob: '1997-04-09',
    subscriptionTier: '3month',
    subscriptionStatus: 'active',
    city: 'Jaipur',
    notes: 'Appreciates eco-friendly hampers',
    preferredChannel: 'both',
    createdAt: '2026-04-05T13:10:00Z'
  },
  {
    id: 'cust-9',
    name: 'Karan Mehra',
    phone: '+91 98711 77889',
    email: 'karan.mehra@example.com',
    dob: '1991-05-18',
    subscriptionTier: '1month',
    subscriptionStatus: 'active',
    city: 'Gurugram',
    notes: 'Prefers evening calls or emails',
    preferredChannel: 'email',
    createdAt: '2026-05-01T15:00:00Z'
  },
  {
    id: 'cust-10',
    name: 'Ishita Sen',
    phone: '+91 98300 44556',
    email: 'ishita.sen@example.com',
    dob: '1999-06-25',
    subscriptionTier: '3month',
    subscriptionStatus: 'active',
    city: 'Kolkata',
    notes: 'Student subscription',
    preferredChannel: 'both',
    createdAt: '2026-06-15T11:00:00Z'
  },
  {
    id: 'cust-11',
    name: 'Manish Tiwari',
    phone: '+91 94150 88990',
    email: 'manish.tiwari@example.com',
    dob: '1985-07-04',
    subscriptionTier: '1month',
    subscriptionStatus: 'active',
    city: 'Lucknow',
    notes: 'Enjoys gourmet teas',
    preferredChannel: 'email',
    createdAt: '2026-07-01T17:40:00Z'
  },
  {
    id: 'cust-12',
    name: 'Pooja Reddy',
    phone: '+91 98490 66778',
    email: 'pooja.reddy@example.com',
    dob: '1993-08-30',
    subscriptionTier: '3month',
    subscriptionStatus: 'active',
    city: 'Hyderabad',
    notes: 'Loves handcrafted souvenirs',
    preferredChannel: 'both',
    createdAt: '2026-08-10T10:15:00Z'
  },
  {
    id: 'cust-13',
    name: 'Sameer Joshi',
    phone: '+91 98230 33221',
    email: 'sameer.joshi@example.com',
    dob: '1990-09-12',
    subscriptionTier: '1month',
    subscriptionStatus: 'active',
    city: 'Nagpur',
    notes: 'Automated wish recipient',
    preferredChannel: 'email',
    createdAt: '2026-09-01T12:30:00Z'
  },
  {
    id: 'cust-14',
    name: 'Zoya Khan',
    phone: '+91 99100 88776',
    email: 'zoya.khan@example.com',
    dob: '1996-11-08',
    subscriptionTier: '3month',
    subscriptionStatus: 'active',
    city: 'Bhopal',
    notes: 'Loves jewelry and accessories',
    preferredChannel: 'both',
    createdAt: '2026-01-20T14:10:00Z'
  },
  {
    id: 'cust-15',
    name: 'Deepak Nambiar',
    phone: '+91 98460 22119',
    email: 'deepak.nambiar@example.com',
    dob: '1987-12-25',
    subscriptionTier: '1month',
    subscriptionStatus: 'active',
    city: 'Kochi',
    notes: 'Annual celebration subscriber',
    preferredChannel: 'both',
    createdAt: '2026-02-01T18:00:00Z'
  }
];

export const INITIAL_LOGS: EmailLog[] = [
  {
    id: 'log-1',
    customerId: 'cust-1',
    customerName: 'Aarav Sharma',
    customerEmail: 'aarav.sharma@example.com',
    subject: '🎉 Happy Birthday Aarav Sharma! Enjoy 20% OFF with your 1-Month Plan 🎂',
    messageBody: 'Wishing Aarav Sharma a truly joyful birthday celebration! MONTH20 applied.',
    sentAt: new Date().toISOString(),
    status: 'delivered',
    tierUsed: '1month',
    automationType: 'automated_cron',
    discountCode: 'MONTH20'
  }
];
