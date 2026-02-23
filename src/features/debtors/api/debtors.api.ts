/**
 * Debtor API functions — currently uses mock data.
 * When backend endpoints are ready, swap to real API calls.
 */

import type {
    Debtor,
    DebtorVehicle,
    DebtorTransaction,
    DebtorAging,
} from '@/types/debtors';
import {
    MOCK_DEBTORS,
    MOCK_VEHICLES,
    MOCK_TRANSACTIONS,
    MOCK_AGING,
} from './mockData';

// ─── Simulate network delay ─────────────────────────────────

function delay(ms = 300): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

// ─── In-memory store (mutated by create / update / delete) ──

let debtors = [...MOCK_DEBTORS];
const vehicles: Record<string, DebtorVehicle[]> = { ...MOCK_VEHICLES };

// ─── Debtors CRUD ────────────────────────────────────────────

export async function getDebtors(): Promise<Debtor[]> {
    await delay();
    return debtors;
}

export async function getDebtor(id: string): Promise<Debtor | undefined> {
    await delay();
    return debtors.find((d) => d.id === id);
}

export async function createDebtor(data: Partial<Debtor>): Promise<Debtor> {
    await delay(400);
    const newDebtor: Debtor = {
        id: `dbt-${Date.now()}`,
        stationId: data.stationId ?? 'station-001',
        accountNumber: data.accountNumber ?? String(debtors.length + 40),
        companyName: data.companyName ?? '',
        titleInitials: data.titleInitials ?? '',
        accountType: data.accountType ?? 'balance_brought_forward',
        vatRegNo: data.vatRegNo ?? '',
        companyRegNo: data.companyRegNo ?? '',
        contact1: data.contact1 ?? { name: '', telephone: '', fax: '', cell: '', email: '' },
        contact2: data.contact2 ?? { name: '', telephone: '', fax: '', cell: '', email: '' },
        postalAddress: data.postalAddress ?? '',
        physicalAddress: data.physicalAddress ?? '',
        isMainAccount: data.isMainAccount ?? true,
        mainAccountNo: data.mainAccountNo ?? '',
        mainAccountName: data.mainAccountName ?? '',
        debtorCategory: data.debtorCategory ?? '',
        creditLimit: data.creditLimit ?? 1000,
        termsOfPayment: data.termsOfPayment ?? 'Cash',
        chargeInterest: data.chargeInterest ?? false,
        enterOrderNumber: data.enterOrderNumber ?? false,
        enterOdometer: data.enterOdometer ?? false,
        enterRegionCode: data.enterRegionCode ?? false,
        printBalance: data.printBalance ?? 'system_default',
        statementType: data.statementType ?? 'monthly',
        sendViaPrint: data.sendViaPrint ?? true,
        sendViaEmail: data.sendViaEmail ?? false,
        accountStatus: data.accountStatus ?? 'enabled',
        settlementDiscountPct: data.settlementDiscountPct ?? 0,
        settlementTerms: data.settlementTerms ?? 'Cash',
        tradeDiscountCategory: data.tradeDiscountCategory ?? '',
        tradeDiscountPct: data.tradeDiscountPct ?? 0,
        openingBalance: data.openingBalance ?? 0,
        currentBalance: data.currentBalance ?? 0,
        deposit: data.deposit ?? 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    debtors = [newDebtor, ...debtors];
    return newDebtor;
}

export async function updateDebtor(id: string, data: Partial<Debtor>): Promise<Debtor> {
    await delay(400);
    const idx = debtors.findIndex((d) => d.id === id);
    if (idx < 0) throw new Error('Debtor not found');
    debtors[idx] = { ...debtors[idx], ...data, updatedAt: new Date().toISOString() };
    return debtors[idx];
}

export async function deleteDebtor(id: string): Promise<void> {
    await delay(400);
    debtors = debtors.filter((d) => d.id !== id);
}

// ─── Vehicles ────────────────────────────────────────────────

export async function getDebtorVehicles(debtorId: string): Promise<DebtorVehicle[]> {
    await delay();
    return vehicles[debtorId] ?? [];
}

export async function addDebtorVehicle(debtorId: string, data: Partial<DebtorVehicle>): Promise<DebtorVehicle> {
    await delay(400);
    const v: DebtorVehicle = {
        id: `veh-${Date.now()}`,
        debtorId,
        registration: data.registration ?? '',
        driver: data.driver ?? '',
        tagNo: data.tagNo ?? '',
        gradesAllowed: data.gradesAllowed ?? 'ALL GRADES',
        cardNo: data.cardNo ?? '',
        restrictFuelingTimes: data.restrictFuelingTimes ?? false,
        schedule: data.schedule ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    if (!vehicles[debtorId]) vehicles[debtorId] = [];
    vehicles[debtorId].push(v);
    return v;
}

export async function removeDebtorVehicle(debtorId: string, vehicleId: string): Promise<void> {
    await delay(400);
    if (vehicles[debtorId]) {
        vehicles[debtorId] = vehicles[debtorId].filter((v) => v.id !== vehicleId);
    }
}

// ─── Transactions & Balance ──────────────────────────────────

export async function getDebtorTransactions(debtorId: string): Promise<DebtorTransaction[]> {
    await delay();
    return MOCK_TRANSACTIONS[debtorId] ?? [];
}

export async function getDebtorBalance(debtorId: string): Promise<DebtorAging | null> {
    await delay();
    return MOCK_AGING[debtorId] ?? null;
}
