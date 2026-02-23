/**
 * TransactionEnquiryTab — Account summary, aging, and transaction history.
 * Mirrors the Hipos "Transaction Enquiry" window.
 */

import {
    Grid, Paper, Text, Table, Badge, Loader, Center, Group, Divider,
} from '@mantine/core';
import { useDebtorTransactions, useDebtorBalance } from '../api/debtors.hooks';
import type { Debtor } from '@/types/debtors';

interface Props {
    debtor: Debtor;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-ZM', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function StatBox({ label, value, negative }: { label: string; value: number; negative?: boolean }) {
    const color = negative && value < 0 ? 'red' : undefined;
    return (
        <div>
            <Text size="xs" c="dimmed">{label}</Text>
            <Text fw={700} size="lg" c={color}>{formatCurrency(value)}</Text>
        </div>
    );
}

export function TransactionEnquiryTab({ debtor }: Props) {
    const { data: transactions, isLoading: txLoading } = useDebtorTransactions(debtor.id);
    const { data: aging, isLoading: agingLoading } = useDebtorBalance(debtor.id);

    const totalDebits = (transactions ?? []).reduce((s, t) => s + t.debit, 0);
    const totalCredits = (transactions ?? []).reduce((s, t) => s + t.credit, 0);

    if (txLoading || agingLoading) {
        return <Center h={200}><Loader size="lg" /></Center>;
    }

    return (
        <>
            {/* ── Account Summary ── */}
            <Grid gutter="md" mb="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper p="md" withBorder radius="md">
                        <Text fw={600} mb="sm">Details</Text>
                        <Group gap="xl">
                            <div>
                                <Text size="xs" c="dimmed">A/C Number</Text>
                                <Text fw={600}>{debtor.accountNumber}</Text>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed">Name</Text>
                                <Text fw={600}>{debtor.companyName}</Text>
                            </div>
                        </Group>
                        <Group gap="xl" mt="sm">
                            <div>
                                <Text size="xs" c="dimmed">Deposit</Text>
                                <Text>{formatCurrency(debtor.deposit)}</Text>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed">Credit Limit</Text>
                                <Text>{formatCurrency(debtor.creditLimit)}</Text>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed">A/C Type</Text>
                                <Badge variant="light" size="sm">
                                    {debtor.accountType === 'balance_brought_forward' ? 'Balance Brought Forward' : 'Open Item'}
                                </Badge>
                            </div>
                        </Group>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper p="md" withBorder radius="md">
                        <Text fw={600} mb="sm">Current</Text>
                        <StatBox label="Opening Balance" value={debtor.openingBalance} negative />
                        <StatBox label="Debits" value={totalDebits} />
                        <StatBox label="Credits" value={totalCredits} />
                        <Divider my="xs" />
                        <StatBox label="Balance" value={debtor.currentBalance} negative />
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper p="md" withBorder radius="md">
                        <Text fw={600} mb="sm">Balances (Aging)</Text>
                        {aging ? (
                            <>
                                <StatBox label="Current" value={aging.currentAmount} negative />
                                <StatBox label="30 Days" value={aging.days30} negative />
                                <StatBox label="60 Days" value={aging.days60} negative />
                                <StatBox label="90 Days" value={aging.days90} negative />
                                <StatBox label="120+ Days" value={aging.days120Plus} negative />
                            </>
                        ) : (
                            <Text size="sm" c="dimmed">No aging data</Text>
                        )}
                    </Paper>
                </Grid.Col>
            </Grid>

            {/* ── Transaction History ── */}
            <Paper p="md" withBorder radius="md">
                <Text fw={600} mb="md">Transaction History</Text>
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Date</Table.Th>
                            <Table.Th>Type</Table.Th>
                            <Table.Th>Doc No</Table.Th>
                            <Table.Th>Reference</Table.Th>
                            <Table.Th>Description</Table.Th>
                            <Table.Th ta="right">Debit</Table.Th>
                            <Table.Th ta="right">Credit</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {(transactions ?? []).map((txn) => (
                            <Table.Tr key={txn.id}>
                                <Table.Td>{new Date(txn.date).toLocaleDateString()}</Table.Td>
                                <Table.Td>
                                    <Badge
                                        size="sm"
                                        variant="light"
                                        color={txn.type === 'payment' || txn.type === 'credit_note' ? 'green' : 'blue'}
                                    >
                                        {txn.type.replace('_', ' ')}
                                    </Badge>
                                </Table.Td>
                                <Table.Td ff="monospace">{txn.docNo}</Table.Td>
                                <Table.Td>{txn.reference}</Table.Td>
                                <Table.Td>{txn.description}</Table.Td>
                                <Table.Td ta="right" c={txn.debit > 0 ? 'red' : undefined}>
                                    {txn.debit > 0 ? formatCurrency(txn.debit) : '—'}
                                </Table.Td>
                                <Table.Td ta="right" c={txn.credit > 0 ? 'green' : undefined}>
                                    {txn.credit > 0 ? formatCurrency(txn.credit) : '—'}
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                    <Table.Tfoot>
                        <Table.Tr>
                            <Table.Td colSpan={5}><Text fw={700}>Totals</Text></Table.Td>
                            <Table.Td ta="right"><Text fw={700} c="red">{formatCurrency(totalDebits)}</Text></Table.Td>
                            <Table.Td ta="right"><Text fw={700} c="green">{formatCurrency(totalCredits)}</Text></Table.Td>
                        </Table.Tr>
                    </Table.Tfoot>
                </Table>

                {(!transactions || transactions.length === 0) && (
                    <Text size="sm" c="dimmed" ta="center" py="md">No transactions found</Text>
                )}
            </Paper>
        </>
    );
}
