/**
 * SettingsTab — Account configuration, credit, POS options, statements.
 * Mirrors the Hipos "Settings" tab in Debtors Maintenance.
 */

import {
    Grid, TextInput, Select, NumberInput, Switch, Divider, Text, Paper, Stack, Checkbox,
} from '@mantine/core';
import type { Debtor } from '@/types/debtors';

interface Props {
    debtor: Debtor;
    onChange: (patch: Partial<Debtor>) => void;
    readOnly?: boolean;
}

export function SettingsTab({ debtor, onChange, readOnly }: Props) {
    return (
        <Grid gutter="xl">
            {/* ── Left column ── */}
            <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                    {/* Main Account */}
                    <Switch
                        label="Main Account"
                        checked={debtor.isMainAccount}
                        onChange={(e) => onChange({ isMainAccount: e.currentTarget.checked })}
                        disabled={readOnly}
                    />

                    {!debtor.isMainAccount && (
                        <>
                            <Select
                                label="Main Account No"
                                data={[]}
                                value={debtor.mainAccountNo}
                                onChange={(v) => onChange({ mainAccountNo: v ?? '' })}
                                placeholder="Select main account"
                                readOnly={readOnly}
                            />
                            <TextInput
                                label="Main Account Name"
                                value={debtor.mainAccountName}
                                onChange={(e) => onChange({ mainAccountName: e.currentTarget.value })}
                                readOnly={readOnly}
                            />
                        </>
                    )}

                    <Divider />

                    <Select
                        label="Debtor Category"
                        data={[
                            { value: 'Corporate', label: 'Corporate' },
                            { value: 'Fleet', label: 'Fleet' },
                            { value: 'Government', label: 'Government' },
                            { value: 'Individual', label: 'Individual' },
                        ]}
                        value={debtor.debtorCategory}
                        onChange={(v) => onChange({ debtorCategory: v ?? '' })}
                        clearable
                        readOnly={readOnly}
                    />

                    <NumberInput
                        label="Credit Limit"
                        value={debtor.creditLimit}
                        onChange={(v) => onChange({ creditLimit: Number(v) || 0 })}
                        decimalScale={2}
                        fixedDecimalScale
                        thousandSeparator=","
                        prefix="K "
                        readOnly={readOnly}
                    />

                    <Select
                        label="Terms of Payment"
                        data={['Cash', 'COD', '30 Days', '60 Days', '90 Days']}
                        value={debtor.termsOfPayment}
                        onChange={(v) => onChange({ termsOfPayment: (v as Debtor['termsOfPayment']) ?? 'Cash' })}
                        readOnly={readOnly}
                    />

                    <Divider />

                    {/* Statement */}
                    <Text fw={600} size="sm">Statement</Text>
                    <Select
                        label="Type"
                        data={[
                            { value: 'monthly', label: 'Monthly' },
                            { value: 'weekly', label: 'Weekly' },
                            { value: 'on_request', label: 'On Request' },
                        ]}
                        value={debtor.statementType}
                        onChange={(v) => onChange({ statementType: (v as Debtor['statementType']) ?? 'monthly' })}
                        readOnly={readOnly}
                    />

                    <Text size="sm" c="dimmed">Send via:</Text>
                    <Switch
                        label="Print"
                        checked={debtor.sendViaPrint}
                        onChange={(e) => onChange({ sendViaPrint: e.currentTarget.checked })}
                        disabled={readOnly}
                    />
                    <Switch
                        label="E-Mail"
                        checked={debtor.sendViaEmail}
                        onChange={(e) => onChange({ sendViaEmail: e.currentTarget.checked })}
                        disabled={readOnly}
                    />
                </Stack>
            </Grid.Col>

            {/* ── Right column ── */}
            <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                    {/* Overdue */}
                    <Paper p="md" withBorder radius="md">
                        <Text fw={600} size="sm" mb="sm">Overdue Accounts</Text>
                        <Checkbox
                            label="Charge interest on overdue account"
                            checked={debtor.chargeInterest}
                            onChange={(e) => onChange({ chargeInterest: e.currentTarget.checked })}
                            disabled={readOnly}
                        />
                    </Paper>

                    {/* Point of Sale */}
                    <Paper p="md" withBorder radius="md">
                        <Text fw={600} size="sm" mb="sm">Point of Sale</Text>
                        <Stack gap="xs">
                            <Checkbox
                                label="Enter Order Number"
                                checked={debtor.enterOrderNumber}
                                onChange={(e) => onChange({ enterOrderNumber: e.currentTarget.checked })}
                                disabled={readOnly}
                            />
                            <Checkbox
                                label="Enter Odometer Reading"
                                checked={debtor.enterOdometer}
                                onChange={(e) => onChange({ enterOdometer: e.currentTarget.checked })}
                                disabled={readOnly}
                            />
                            <Checkbox
                                label="Enter Region Code"
                                checked={debtor.enterRegionCode}
                                onChange={(e) => onChange({ enterRegionCode: e.currentTarget.checked })}
                                disabled={readOnly}
                            />
                        </Stack>
                    </Paper>

                    {/* Print Balance */}
                    <Select
                        label="Print Balance on Till Slip"
                        data={[
                            { value: 'system_default', label: 'Use System Default' },
                            { value: 'main_balance_only', label: 'Main Balance Only' },
                            { value: 'all_balances', label: 'All Balances' },
                            { value: 'none', label: 'None' },
                        ]}
                        value={debtor.printBalance}
                        onChange={(v) => onChange({ printBalance: v ?? 'system_default' })}
                        readOnly={readOnly}
                    />

                    {/* Account Status */}
                    <Select
                        label="Account Status"
                        data={[
                            { value: 'enabled', label: 'Enabled' },
                            { value: 'disabled', label: 'Disabled' },
                            { value: 'suspended', label: 'Suspended' },
                        ]}
                        value={debtor.accountStatus}
                        onChange={(v) => onChange({ accountStatus: (v as Debtor['accountStatus']) ?? 'enabled' })}
                        readOnly={readOnly}
                    />
                </Stack>
            </Grid.Col>
        </Grid>
    );
}
