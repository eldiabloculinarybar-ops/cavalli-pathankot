import { Customer, EmailLog, EmailTemplate } from '../types';
import { INITIAL_CUSTOMERS, DEFAULT_EMAIL_TEMPLATES, INITIAL_LOGS } from '../data/initialData';

const CUSTOMERS_KEY = 'janamdin_customers_v1';
const TEMPLATES_KEY = 'janamdin_templates_v1';
const LOGS_KEY = 'janamdin_email_logs_v1';
const ADMIN_AUTH_KEY = 'janamdin_admin_session_v1';
const AUTO_DISPATCH_SETTINGS_KEY = 'janamdin_auto_settings_v1';

export function getStoredCustomers(): Customer[] {
  try {
    const data = localStorage.getItem(CUSTOMERS_KEY);
    if (!data) {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load customers from storage', e);
    return INITIAL_CUSTOMERS;
  }
}

export function saveCustomers(customers: Customer[]): void {
  try {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  } catch (e) {
    console.error('Failed to save customers to storage', e);
  }
}

export function getStoredTemplates(): EmailTemplate[] {
  try {
    const data = localStorage.getItem(TEMPLATES_KEY);
    if (!data) {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(DEFAULT_EMAIL_TEMPLATES));
      return DEFAULT_EMAIL_TEMPLATES;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_EMAIL_TEMPLATES;
  }
}

export function saveTemplates(templates: EmailTemplate[]): void {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save templates', e);
  }
}

export function getStoredEmailLogs(): EmailLog[] {
  try {
    const data = localStorage.getItem(LOGS_KEY);
    if (!data) {
      localStorage.setItem(LOGS_KEY, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_LOGS;
  }
}

export function saveEmailLogs(logs: EmailLog[]): void {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save email logs', e);
  }
}

export interface AdminCredentials {
  phone: string;
  password: string;
  name: string;
  email?: string;
}

const ADMIN_CREDENTIALS_KEY = 'cavalli_admin_credentials_v1';

export function getAdminCredentials(): AdminCredentials {
  try {
    const data = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        phone: parsed.phone || '9781395857',
        password: parsed.password || 'admin123',
        name: parsed.name || 'Cavalli Administrator'
      };
    }
  } catch (e) {
    // Ignore
  }
  return {
    phone: '9781395857',
    password: 'admin123',
    name: 'Cavalli Administrator'
  };
}

export function saveAdminCredentials(creds: AdminCredentials): void {
  try {
    localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(creds));
  } catch (e) {
    console.error('Failed to save admin credentials', e);
  }
}

export function getAdminSession(): { isLoggedIn: boolean; email?: string; phone?: string; name?: string } {
  try {
    const session = localStorage.getItem(ADMIN_AUTH_KEY);
    if (session) {
      return JSON.parse(session);
    }
  } catch (e) {
    // Ignore
  }
  return { isLoggedIn: false };
}

export function saveAdminSession(session: { isLoggedIn: boolean; email?: string; phone?: string; name?: string }): void {
  try {
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save admin session', e);
  }
}

export function clearAdminSession(): void {
  try {
    localStorage.removeItem(ADMIN_AUTH_KEY);
  } catch (e) {
    // Ignore
  }
}

export interface AutomationSettings {
  autoSendEnabled: boolean;
  sendHour: number; // e.g. 8 for 08:00 AM
  senderEmail: string;
  senderName: string;
  storeName: string;
  enableWhatsAppLink: boolean;
}

export function getAutomationSettings(): AutomationSettings {
  try {
    const data = localStorage.getItem(AUTO_DISPATCH_SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    // Ignore
  }
  return {
    autoSendEnabled: true,
    sendHour: 8,
    senderEmail: 'celebrations@cavalliclub.com',
    senderName: 'Cavalli Club VIP Celebrations',
    storeName: 'Cavalli Club',
    enableWhatsAppLink: true
  };
}

export function saveAutomationSettings(settings: AutomationSettings): void {
  try {
    localStorage.setItem(AUTO_DISPATCH_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save automation settings', e);
  }
}
