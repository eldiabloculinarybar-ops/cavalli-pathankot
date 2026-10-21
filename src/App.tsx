/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Customer, EmailLog, EmailTemplate, SubscriptionTierId } from './types';
import {
  getStoredCustomers,
  saveCustomers,
  getStoredTemplates,
  saveTemplates,
  getStoredEmailLogs,
  saveEmailLogs,
  getAdminSession,
  saveAdminSession,
  clearAdminSession,
  getAutomationSettings,
  saveAutomationSettings
} from './utils/storage';
import { isBirthdayToday, getMonthFromDOB } from './utils/dateUtils';
import { SUBSCRIPTION_PLANS, DEFAULT_EMAIL_TEMPLATES } from './data/initialData';
import { triggerConfetti } from './components/CelebrationConfetti';

import { AdminLogin } from './components/AdminLogin';
import { CustomerOtpLogin } from './components/CustomerOtpLogin';
import { CustomerPortal } from './components/CustomerPortal';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { TodayCelebrations } from './components/TodayCelebrations';
import { MonthwiseView } from './components/MonthwiseView';
import { CustomerListTable } from './components/CustomerListTable';
import { AdminApprovalsView } from './components/AdminApprovalsView';
import { EmailTemplatesModal } from './components/EmailTemplatesModal';
import { AutomationLogsModal } from './components/AutomationLogsModal';
import { CustomerModal } from './components/CustomerModal';
import { EmailAutomationModal } from './components/EmailAutomationModal';
import { AutomationSchedulerControl } from './components/AutomationSchedulerControl';
import { AdminGatewaySettingsModal } from './components/AdminGatewaySettingsModal';
import { AdminFast2SmsBar } from './components/AdminFast2SmsBar';
import { HostingerDeployModal } from './components/HostingerDeployModal';

export default function App() {
  // Global Portal Mode: 'admin' or 'customer'
  const [portalMode, setPortalMode] = useState<'admin' | 'customer'>('admin');
  const [isHostingerModalOpen, setIsHostingerModalOpen] = useState(false);

  // Admin Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return getAdminSession().isLoggedIn;
  });
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return getAdminSession().email || 'admin@birthdayvault.com';
  });
  const [adminName, setAdminName] = useState<string>(() => {
    return getAdminSession().name || 'Store Administrator';
  });

  // Customer Authentication State
  const [loggedInCustomer, setLoggedInCustomer] = useState<Customer | null>(null);

  // Data States
  const [customers, setCustomers] = useState<Customer[]>(() => getStoredCustomers());
  const [templates, setTemplates] = useState<EmailTemplate[]>(() => getStoredTemplates());
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => getStoredEmailLogs());
  const [automationSettings, setAutomationSettings] = useState(() => getAutomationSettings());

  // Admin UI Navigation States
  const [activeTab, setActiveTab] = useState<'monthwise' | 'directory' | 'approvals' | 'templates' | 'logs'>('monthwise');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerModalInitial, setCustomerModalInitial] = useState<Customer | null>(null);
  const [customerModalStep, setCustomerModalStep] = useState<1 | 2>(1);

  // SMS Gateway Modal State (Admin Only)
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);

  // Email Wish Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailModalCustomer, setEmailModalCustomer] = useState<Customer | null>(null);

  // Auto-run status
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state changes with persistence
  useEffect(() => {
    saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    saveTemplates(templates);
  }, [templates]);

  useEffect(() => {
    saveEmailLogs(emailLogs);
  }, [emailLogs]);

  useEffect(() => {
    saveAutomationSettings(automationSettings);
  }, [automationSettings]);

  // Keep loggedInCustomer automatically synced with customers database
  useEffect(() => {
    if (loggedInCustomer) {
      const fresh = customers.find((c) => c.id === loggedInCustomer.id);
      if (fresh) {
        setLoggedInCustomer(fresh);
      }
    }
  }, [customers, loggedInCustomer?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleViewAsCustomer = (customer: Customer) => {
    setLoggedInCustomer(customer);
    setPortalMode('customer');
    triggerConfetti('medium');
    showToast(`Switched to Customer View for ${customer.name}`);
  };

  // Auth Handlers - Admin
  const handleAdminLoginSuccess = (email: string, name: string) => {
    setLoggedInCustomer(null);
    setIsAdminLoggedIn(true);
    setPortalMode('admin');
    setAdminEmail(email);
    setAdminName(name);
    saveAdminSession({ isLoggedIn: true, email, name });
    showToast(`Welcome back, ${name}! Admin portal unlocked.`);
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    clearAdminSession();
    showToast('Logged out of Admin Portal.');
  };

  // Auth Handlers - Customer
  const handleCustomerLoginSuccess = (customer: Customer) => {
    setIsAdminLoggedIn(false);
    clearAdminSession();
    setPortalMode('customer');

    // Save customer if newly registered
    setCustomers((prev) => {
      const exists = prev.some((c) => c.id === customer.id);
      if (exists) {
        return prev;
      }
      return [customer, ...prev];
    });

    setLoggedInCustomer(customer);
    showToast(`Welcome ${customer.name}! Logged in via Phone OTP.`);
  };

  const handleCustomerLogout = () => {
    setLoggedInCustomer(null);
    showToast('Customer logged out.');
  };


  // Customer requests a 1-Month (₹500) or 3-Month (₹1000) subscription plan
  const handleCustomerUpdateSubscription = (customerId: string, planId: SubscriptionTierId) => {
    const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS['1month'];

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              subscriptionStatus: 'pending',
              requestedPlanId: planId,
              subscriptionRequestedAt: new Date().toISOString()
            }
          : c
      )
    );

    setLoggedInCustomer((prev) =>
      prev && prev.id === customerId
        ? {
            ...prev,
            subscriptionStatus: 'pending',
            requestedPlanId: planId,
            subscriptionRequestedAt: new Date().toISOString()
          }
        : prev
    );

    showToast(`Request for ${plan.name} (${plan.price}) submitted! Waiting for Admin Approval.`);
  };

  // Admin approves a customer's subscription plan
  const handleApproveSubscription = (customerId: string, planId: SubscriptionTierId) => {
    const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS['1month'];
    const now = new Date();
    const startDate = now.toISOString().split('T')[0];
    const duration = plan.durationMonths || 1;
    const endDateObj = new Date(now.setMonth(now.getMonth() + duration));
    const endDate = endDateObj.toISOString().split('T')[0];

    let approvedCustomerName = '';
    let approvedCustomerEmail = '';

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          approvedCustomerName = c.name;
          approvedCustomerEmail = c.email || '';
          return {
            ...c,
            subscriptionTier: planId,
            subscriptionStatus: 'active',
            requestedPlanId: undefined,
            subscriptionStartDate: startDate,
            subscriptionEndDate: endDate,
            subscriptionApprovedAt: new Date().toISOString()
          };
        }
        return c;
      })
    );

    // Update logged in customer state if same
    if (loggedInCustomer && loggedInCustomer.id === customerId) {
      setLoggedInCustomer((prev) =>
        prev
          ? {
              ...prev,
              subscriptionTier: planId,
              subscriptionStatus: 'active',
              requestedPlanId: undefined,
              subscriptionStartDate: startDate,
              subscriptionEndDate: endDate,
              subscriptionApprovedAt: new Date().toISOString()
            }
          : null
      );
    }

    // Auto-log approval confirmation email dispatch
    const approvalLog: EmailLog = {
      id: `log-approval-${Date.now()}`,
      customerId,
      customerName: approvedCustomerName,
      customerEmail: approvedCustomerEmail,
      subject: `✅ Subscription Approved! Welcome to ${plan.name} (20% OFF Active)`,
      messageBody: `Dear ${approvedCustomerName},\n\nYour request for ${plan.name} (${plan.price}) has been officially APPROVED by Admin!\n\nYour 20% discount coupon code and automated birthday wishes are now active.`,
      sentAt: new Date().toISOString(),
      status: 'delivered',
      tierUsed: planId,
      automationType: 'automated_cron',
      discountCode: planId === '3month' ? 'QUARTER20' : 'MONTH20'
    };
    setEmailLogs((prev) => [approvalLog, ...prev]);

    triggerConfetti('grand');
    showToast(`Approved ${plan.name} for ${approvedCustomerName}!`);
  };

  // Admin rejects a customer's subscription plan
  const handleRejectSubscription = (customerId: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              subscriptionStatus: 'rejected',
              requestedPlanId: undefined
            }
          : c
      )
    );

    if (loggedInCustomer && loggedInCustomer.id === customerId) {
      setLoggedInCustomer((prev) =>
        prev
          ? {
              ...prev,
              subscriptionStatus: 'rejected',
              requestedPlanId: undefined
            }
          : null
      );
    }

    showToast('Subscription request rejected.');
  };

  // Customer Management Handlers
  const handleAddNewCustomer = () => {
    setCustomerModalInitial(null);
    setCustomerModalStep(1);
    setIsCustomerModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setCustomerModalInitial(customer);
    setCustomerModalStep(1);
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = (customer: Customer) => {
    setCustomers((prev) => {
      const exists = prev.some((c) => c.id === customer.id);
      if (exists) {
        return prev.map((c) => (c.id === customer.id ? customer : c));
      }
      return [customer, ...prev];
    });

    const plan = SUBSCRIPTION_PLANS[customer.subscriptionTier] || SUBSCRIPTION_PLANS['1month'];
    showToast(`Saved ${customer.name} with ${plan.name} subscription!`);
  };

  const handleDeleteCustomer = (id: string) => {
    const cust = customers.find((c) => c.id === id);
    if (!window.confirm(`Are you sure you want to delete ${cust?.name || 'this customer'}?`)) {
      return;
    }
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast('Customer record removed.');
  };

  // Email Notification Handlers
  const handleOpenSendEmail = (customer: Customer) => {
    setEmailModalCustomer(customer);
    setIsEmailModalOpen(true);
  };

  const handleLogSentEmail = (log: EmailLog) => {
    setEmailLogs((prev) => [log, ...prev]);
    showToast(`Birthday email sent to ${log.customerName}!`);
  };

  const handleBatchLogSentEmails = (newLogs: EmailLog[]) => {
    setEmailLogs((prev) => [...newLogs, ...prev]);
    showToast(`Successfully dispatched ${newLogs.length} automated birthday wishes!`);
  };

  // Batch trigger for all today's birthdays
  const handleSendAllToday = (todayCustomers: Customer[]) => {
    if (todayCustomers.length === 0) return;
    setIsAutoRunning(true);

    setTimeout(() => {
      const newLogs: EmailLog[] = todayCustomers.map((customer) => {
        const tier = customer.subscriptionTier || '1month';
        const plan = SUBSCRIPTION_PLANS[tier] || SUBSCRIPTION_PLANS['1month'];
        const template =
          templates.find((t) => t.tierId === tier) ||
          DEFAULT_EMAIL_TEMPLATES.find((t) => t.tierId === tier) ||
          DEFAULT_EMAIL_TEMPLATES[0];

        const discountCode = `${tier.toUpperCase()}${plan.discountPercent}_${customer.name.slice(0, 3).toUpperCase()}`;
        const finalSubject = template.subject.replace('{name}', customer.name);

        return {
          id: `log-${Date.now()}-${customer.id}`,
          customerId: customer.id,
          customerName: customer.name,
          customerEmail: customer.email,
          subject: finalSubject,
          messageBody: `Dear ${customer.name},\n\n${template.message}\n\nAs a valued ${plan.name} member, enjoy your special birthday voucher: ${discountCode}`,
          sentAt: new Date().toISOString(),
          status: 'delivered',
          tierUsed: customer.subscriptionTier,
          automationType: 'manual_one_click',
          discountCode
        };
      });

      setEmailLogs((prev) => [...newLogs, ...prev]);
      triggerConfetti('grand');
      setIsAutoRunning(false);
      showToast(`Delivered birthday emails to all ${todayCustomers.length} celebrants today!`);
    }, 900);
  };

  const handleToggleAutoSend = (enabled: boolean) => {
    setAutomationSettings((prev) => ({ ...prev, autoSendEnabled: enabled }));
    showToast(enabled ? 'Automated Birthday Dispatch Engine is ACTIVE (08:00 AM Daily)' : 'Automated dispatch paused.');
  };

  const todayBirthdays = customers.filter((c) => isBirthdayToday(c.dob));
  const pendingApprovalsCount = customers.filter((c) => c.subscriptionStatus === 'pending').length;

  // -------------------------------------------------------------
  // RENDER CUSTOMER PORTAL FLOW
  // -------------------------------------------------------------
  if (loggedInCustomer) {
    return (
      <>
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/50 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-3 text-xs text-white animate-fade-in ring-1 ring-emerald-500/30">
            <span className="text-base">🎉</span>
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}
        <CustomerPortal
          customer={loggedInCustomer}
          onUpdateSubscriptionRequest={handleCustomerUpdateSubscription}
          onLogout={handleCustomerLogout}
          onSwitchToAdmin={() => {
            setLoggedInCustomer(null);
            setPortalMode('admin');
          }}
        />
      </>
    );
  }


  // 1. If Admin is authenticated -> Render Admin Management Portal
  if (isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-rose-500/50 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-3 text-xs text-white animate-fade-in ring-1 ring-rose-500/30">
            <span className="text-base">🎉</span>
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Admin Navbar */}
        <Navbar
          adminEmail={adminEmail}
          adminName={adminName}
          onLogout={handleAdminLogout}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAddNewCustomer={handleAddNewCustomer}
          onSwitchToCustomerPortal={() => {
            if (customers.length > 0) {
              handleViewAsCustomer(customers[0]);
            } else {
              showToast('No customers available for preview');
            }
          }}
          onOpenGatewaySettings={() => setIsGatewayModalOpen(true)}
          onOpenHostingerModal={() => setIsHostingerModalOpen(true)}
          todayCount={todayBirthdays.length}
          pendingApprovalsCount={pendingApprovalsCount}
          autoSendEnabled={automationSettings.autoSendEnabled}
        />

        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Fast2SMS API Key & Live WhatsApp OTP Service Bar (Exclusively Visible to Admin) */}
          <AdminFast2SmsBar
            onShowToast={showToast}
            onOpenAdvancedModal={() => setIsGatewayModalOpen(true)}
            onOpenHostingerModal={() => setIsHostingerModalOpen(true)}
          />

          {/* Top KPI Stats Overview */}
          <StatsOverview
            customers={customers}
            onTriggerDailyAutomation={() => handleSendAllToday(todayBirthdays)}
            isAutoRunning={isAutoRunning}
            onFilterThisMonth={() => setActiveTab('monthwise')}
            onAddNewCustomer={handleAddNewCustomer}
            onNavigateApprovals={() => setActiveTab('approvals')}
            onOpenSendGreeting={handleOpenSendEmail}
            onShowToast={showToast}
          />

          {/* Today's Special Celebration Highlight Banner */}
          <TodayCelebrations
            todayBirthdays={todayBirthdays}
            onOpenSendWhatsApp={handleOpenSendEmail}
            onSendAllToday={handleSendAllToday}
          />

          {/* Automated Dispatch Scheduler Engine Control */}
          <AutomationSchedulerControl
            customers={customers}
            templates={templates}
            autoSendEnabled={automationSettings.autoSendEnabled}
            onToggleAutoSend={handleToggleAutoSend}
            onBatchLogSentEmails={handleBatchLogSentEmails}
          />

          {/* Main View Tabs */}
          {activeTab === 'monthwise' && (
            <MonthwiseView
              customers={customers}
              onOpenSendWhatsApp={handleOpenSendEmail}
              onEditCustomer={handleEditCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onAddNewCustomer={handleAddNewCustomer}
            />
          )}

          {activeTab === 'directory' && (
            <CustomerListTable
              customers={customers}
              onOpenSendWhatsApp={handleOpenSendEmail}
              onEditCustomer={handleEditCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onAddNewCustomer={handleAddNewCustomer}
            />
          )}

          {activeTab === 'approvals' && (
            <AdminApprovalsView
              customers={customers}
              onApproveSubscription={handleApproveSubscription}
              onRejectSubscription={handleRejectSubscription}
              onViewAsCustomer={handleViewAsCustomer}
            />
          )}

          {activeTab === 'templates' && (
            <EmailTemplatesModal
              templates={templates}
              onSaveTemplates={(newTemplates) => {
                setTemplates(newTemplates);
                showToast('Email templates updated successfully!');
              }}
            />
          )}

          {activeTab === 'logs' && (
            <AutomationLogsModal
              logs={emailLogs}
              onClearLogs={() => {
                if (window.confirm('Are you sure you want to clear all sent email logs?')) {
                  setEmailLogs([]);
                  showToast('Email logs cleared.');
                }
              }}
            />
          )}
        </main>

        {/* Modals */}
        <CustomerModal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          onSaveCustomer={handleSaveCustomer}
          initialCustomer={customerModalInitial}
          defaultStep={customerModalStep}
        />

        <EmailAutomationModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          customer={emailModalCustomer}
          templates={templates}
          onLogSentEmail={handleLogSentEmail}
          storeName={automationSettings.storeName}
          senderEmail={automationSettings.senderEmail}
        />

        <AdminGatewaySettingsModal
          isOpen={isGatewayModalOpen}
          onClose={() => setIsGatewayModalOpen(false)}
          onShowToast={showToast}
        />

        <HostingerDeployModal
          isOpen={isHostingerModalOpen}
          onClose={() => setIsHostingerModalOpen(false)}
          onShowToast={showToast}
        />

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              &copy; {new Date().getFullYear()} Cavalli Club &bull; VIP Birthday &amp; Subscription Portal
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsHostingerModalOpen(true)}
                className="text-purple-400 hover:text-purple-300 font-semibold underline cursor-pointer flex items-center gap-1"
              >
                <span>🚀 Deploy to Hostinger Guide</span>
              </button>
              <button
                onClick={handleAdminLogout}
                className="text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer"
              >
                Exit Admin Portal &rarr;
              </button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // 2. FRONT PAGE: Unified Fast2SMS Cellular OTP Login for Both Admin & Customer!
  return (
    <CustomerOtpLogin
      customers={customers}
      adminPhone="9781395857"
      onAdminLoginSuccess={(phoneOrEmail, name) => {
        handleAdminLoginSuccess(phoneOrEmail, name);
      }}
      onCustomerLoginSuccess={handleCustomerLoginSuccess}
    />
  );
}

