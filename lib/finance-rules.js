export const FRANCE_FINANCE_DEFAULTS = Object.freeze({
  country: 'FR',
  microBicServiceSocialRate: 21.2,
  microBncServiceSocialRate: 25.6,
  cfpCommercialRate: 0.1,
  cfpLiberalRate: 0.2,
  cfpArtisanRate: 0.3,
  b2bRecoveryFeeEuro: 40,
  reminderDaysBeforeDue: 7,
  overdueReminderDays: [1, 7],
  formalNoticeAfterDays: 14,
});

export function calculateTaxReserve({ turnover = 0, socialRate = 0, cfpRate = 0, incomeTaxReserveRate = 0 }) {
  const base = Math.max(0, Number(turnover) || 0);
  const totalRate = Math.max(0, Number(socialRate) || 0) + Math.max(0, Number(cfpRate) || 0) + Math.max(0, Number(incomeTaxReserveRate) || 0);
  return {
    turnover: base,
    totalRate,
    reserve: Math.round(base * totalRate) / 100,
    availableBeforeOtherCosts: Math.round(base * (100 - totalRate)) / 100,
  };
}

export function daysOverdue(dueDate, asOf = new Date()) {
  if (!dueDate) return 0;
  const due = new Date(`${dueDate}T23:59:59`);
  const diff = asOf.getTime() - due.getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

export function calculateLatePayment({ principal = 0, dueDate, annualRate = 0, recoveryFee = 40, asOf = new Date(), businessToBusiness = true }) {
  const overdueDays = daysOverdue(dueDate, asOf);
  const amount = Math.max(0, Number(principal) || 0);
  const rate = Math.max(0, Number(annualRate) || 0);
  const interest = overdueDays ? amount * (rate / 100) * (overdueDays / 365) : 0;
  const fee = overdueDays && businessToBusiness ? Math.max(0, Number(recoveryFee) || 0) : 0;
  return {
    overdueDays,
    interest: Math.round(interest * 100) / 100,
    recoveryFee: fee,
    totalDue: Math.round((amount + interest + fee) * 100) / 100,
  };
}

export function collectionStage({ dueDate, status, asOf = new Date(), formalNoticeAfterDays = FRANCE_FINANCE_DEFAULTS.formalNoticeAfterDays }) {
  if (status === 'Paid') return 'paid';
  const overdue = daysOverdue(dueDate, asOf);
  if (!overdue) return 'due_soon';
  if (overdue >= formalNoticeAfterDays) return 'formal_review';
  if (overdue >= 7) return 'overdue_7';
  return 'overdue_1';
}
