/**
 * Debtor types — mirrors the Supabase schema and Hipos Debtors Maintenance screens.
 */

// ─── Account Types ───────────────────────────────────────────

export type DebtorAccountType = 'balance_brought_forward' | 'open_item';
export type DebtorAccountStatus = 'enabled' | 'disabled' | 'suspended';
export type DebtorTermsOfPayment = 'Cash' | 'COD' | '30 Days' | '60 Days' | '90 Days';
export type DebtorStatementType = 'monthly' | 'weekly' | 'on_request';

// ─── Main Debtor ─────────────────────────────────────────────

export interface ContactDetails {
    name: string;
    telephone: string;
    fax: string;
    cell: string;
    email: string;
}

export interface Debtor {
    id: string;
    stationId: string;

    // General
    accountNumber: string;
    companyName: string;
    titleInitials: string;
    accountType: DebtorAccountType;
    vatRegNo: string;
    companyRegNo: string;
    contact1: ContactDetails;
    contact2: ContactDetails;
    postalAddress: string;
    physicalAddress: string;

    // Settings
    isMainAccount: boolean;
    mainAccountNo: string;
    mainAccountName: string;
    debtorCategory: string;
    creditLimit: number;
    termsOfPayment: DebtorTermsOfPayment;
    chargeInterest: boolean;
    enterOrderNumber: boolean;
    enterOdometer: boolean;
    enterRegionCode: boolean;
    printBalance: string;
    statementType: DebtorStatementType;
    sendViaPrint: boolean;
    sendViaEmail: boolean;
    accountStatus: DebtorAccountStatus;

    // Discount
    settlementDiscountPct: number;
    settlementTerms: string;
    tradeDiscountCategory: string;
    tradeDiscountPct: number;

    // Balances
    openingBalance: number;
    currentBalance: number;
    deposit: number;

    createdAt: string;
    updatedAt: string;
}

// ─── Vehicles ────────────────────────────────────────────────

export interface FuelingScheduleEntry {
    dayOfWeek: number; // 0=Mon .. 6=Sun
    isAllowed: boolean;
    timeFrom: string;  // "HH:mm"
    timeTo: string;    // "HH:mm"
}

export interface DebtorVehicle {
    id: string;
    debtorId: string;
    registration: string;
    driver: string;
    tagNo: string;
    gradesAllowed: string;
    cardNo: string;
    restrictFuelingTimes: boolean;
    schedule: FuelingScheduleEntry[];
    createdAt: string;
    updatedAt: string;
}

// ─── Transactions ────────────────────────────────────────────

export type DebtorTransactionType = 'invoice' | 'credit_note' | 'payment' | 'debit_note';

export interface DebtorTransaction {
    id: string;
    debtorId: string;
    date: string;
    type: DebtorTransactionType;
    docNo: string;
    reference: string;
    description: string;
    debit: number;
    credit: number;
    createdAt: string;
}

// ─── Aging ───────────────────────────────────────────────────

export interface DebtorAging {
    debtorId: string;
    currentAmount: number;
    days30: number;
    days60: number;
    days90: number;
    days120Plus: number;
    updatedAt: string;
}

// ─── Form input type (for create / edit) ─────────────────────

export type DebtorFormData = Omit<Debtor, 'id' | 'createdAt' | 'updatedAt' | 'currentBalance'>;
