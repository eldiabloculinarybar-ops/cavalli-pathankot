export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
] as const;

export const MONTH_HINDI = [
  'जनवरी (Jan)',
  'फ़रवरी (Feb)',
  'मार्च (Mar)',
  'अप्रैल (Apr)',
  'मई (May)',
  'जून (Jun)',
  'जुलाई (Jul)',
  'अगस्त (Aug)',
  'सितंबर (Sep)',
  'अक्टूबर (Oct)',
  'नवंबर (Nov)',
  'दिसंबर (Dec)'
];

/**
 * Returns month index (0-11) from YYYY-MM-DD
 */
export function getMonthFromDOB(dob: string): number {
  if (!dob) return 0;
  const parts = dob.split('-');
  if (parts.length >= 2) {
    const month = parseInt(parts[1], 10);
    return Math.max(0, Math.min(11, month - 1));
  }
  return 0;
}

/**
 * Returns day of month from YYYY-MM-DD
 */
export function getDayFromDOB(dob: string): number {
  if (!dob) return 1;
  const parts = dob.split('-');
  if (parts.length >= 3) {
    return parseInt(parts[2], 10);
  }
  return 1;
}

/**
 * Formats YYYY-MM-DD to "19 Oct 1995"
 */
export function formatDOB(dob: string): string {
  if (!dob) return 'N/A';
  const parts = dob.split('-');
  if (parts.length < 3) return dob;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const monthName = MONTH_NAMES[monthIdx]?.slice(0, 3) || parts[1];
  return `${day} ${monthName} ${year}`;
}

/**
 * Formats without year: "19 Oct"
 */
export function formatDayMonth(dob: string): string {
  if (!dob) return 'N/A';
  const parts = dob.split('-');
  if (parts.length < 3) return dob;
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const monthName = MONTH_NAMES[monthIdx]?.slice(0, 3) || parts[1];
  return `${day} ${monthName}`;
}

/**
 * Checks if the birthday is today
 */
export function isBirthdayToday(dob: string, refDate = new Date()): boolean {
  if (!dob) return false;
  const parts = dob.split('-');
  if (parts.length < 3) return false;
  const birthMonth = parseInt(parts[1], 10) - 1;
  const birthDay = parseInt(parts[2], 10);

  return refDate.getMonth() === birthMonth && refDate.getDate() === birthDay;
}

/**
 * Calculates current age or age they are turning this year
 */
export function calculateAge(dob: string, refDate = new Date()): { currentAge: number; turningAge: number } {
  if (!dob) return { currentAge: 0, turningAge: 0 };
  const parts = dob.split('-');
  if (parts.length < 3) return { currentAge: 0, turningAge: 0 };

  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1;
  const birthDay = parseInt(parts[2], 10);

  const currentYear = refDate.getFullYear();
  const currentMonth = refDate.getMonth();
  const currentDay = refDate.getDate();

  let age = currentYear - birthYear;
  const hasHadBirthdayThisYear =
    currentMonth > birthMonth || (currentMonth === birthMonth && currentDay >= birthDay);

  const currentAge = hasHadBirthdayThisYear ? age : age - 1;
  const turningAge = hasHadBirthdayThisYear ? age + 1 : age;

  return { currentAge: Math.max(0, currentAge), turningAge: Math.max(0, turningAge) };
}

/**
 * Days remaining until next birthday
 */
export function getDaysUntilBirthday(dob: string, refDate = new Date()): number {
  if (!dob) return 999;
  const parts = dob.split('-');
  if (parts.length < 3) return 999;

  const birthMonth = parseInt(parts[1], 10) - 1;
  const birthDay = parseInt(parts[2], 10);

  const currentYear = refDate.getFullYear();
  let nextBirthday = new Date(currentYear, birthMonth, birthDay);

  // If birthday already passed this year, look at next year
  const todayAtMidnight = new Date(currentYear, refDate.getMonth(), refDate.getDate());
  if (nextBirthday < todayAtMidnight) {
    nextBirthday = new Date(currentYear + 1, birthMonth, birthDay);
  }

  const diffTime = nextBirthday.getTime() - todayAtMidnight.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get zodiac sign based on dob
 */
export function getZodiacSign(dob: string): { sign: string; symbol: string } {
  const month = getMonthFromDOB(dob) + 1;
  const day = getDayFromDOB(dob);

  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { sign: 'Aquarius', symbol: '♒' };
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return { sign: 'Pisces', symbol: '♓' };
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { sign: 'Aries', symbol: '♈' };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { sign: 'Taurus', symbol: '♉' };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { sign: 'Gemini', symbol: '♊' };
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { sign: 'Cancer', symbol: '♋' };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { sign: 'Leo', symbol: '♌' };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { sign: 'Virgo', symbol: '♍' };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { sign: 'Libra', symbol: '♎' };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { sign: 'Scorpio', symbol: '♏' };
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { sign: 'Sagittarius', symbol: '♐' };
  return { sign: 'Capricorn', symbol: '♑' };
}

/**
 * Returns the exact Date object for the next birthday
 */
export function getNextBirthdayDate(dob: string, refDate = new Date()): Date {
  if (!dob) return new Date();
  const parts = dob.split('-');
  if (parts.length < 3) return new Date();

  const birthMonth = parseInt(parts[1], 10) - 1;
  const birthDay = parseInt(parts[2], 10);

  const currentYear = refDate.getFullYear();
  let nextBirthday = new Date(currentYear, birthMonth, birthDay);

  const todayAtMidnight = new Date(currentYear, refDate.getMonth(), refDate.getDate());
  if (nextBirthday < todayAtMidnight) {
    nextBirthday = new Date(currentYear + 1, birthMonth, birthDay);
  }

  return nextBirthday;
}

/**
 * Formats a friendly label for upcoming birthday (e.g., "Tomorrow (21 Oct)", "In 3 Days (Thu, 23 Oct)")
 */
export function formatUpcomingBirthdayLabel(dob: string, refDate = new Date()): {
  daysLeft: number;
  label: string;
  formattedDate: string;
  weekday: string;
} {
  const daysLeft = getDaysUntilBirthday(dob, refDate);
  const nextDate = getNextBirthdayDate(dob, refDate);
  const day = nextDate.getDate();
  const monthName = MONTH_NAMES[nextDate.getMonth()]?.slice(0, 3) || '';
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekday = weekdays[nextDate.getDay()];
  const formattedDate = `${day} ${monthName}`;

  let label = '';
  if (daysLeft === 0) {
    label = 'Today 🎉';
  } else if (daysLeft === 1) {
    label = 'Tomorrow ⚡';
  } else {
    label = `In ${daysLeft} Days`;
  }

  return {
    daysLeft,
    label,
    formattedDate,
    weekday
  };
}
