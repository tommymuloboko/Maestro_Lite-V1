/**
 * DebtorsScreen — main screen with debtor list + tabbed detail view.
 * Mirrors Hipos "Debtors Maintenance" window.
 */

import { useState, useCallback } from 'react';
import {
    Grid, Paper, TextInput, Table, Badge, Tabs, Button,
    Group, Text, Loader, Center, ActionIcon, Modal, Stack, ScrollArea,
} from '@mantine/core';
import {
    IconSearch, IconPlus, IconTrash, IconUser,
    IconSettings, IconDiscount, IconCar, IconReceipt,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { Screen } from '@/layouts/Screen';
import { useDebtors, useCreateDebtor, useUpdateDebtor, useDeleteDebtor } from '../api/debtors.hooks';
import { GeneralTab } from '../components/GeneralTab';
import { SettingsTab } from '../components/SettingsTab';
import { DiscountTab } from '../components/DiscountTab';
import { VehiclesTab } from '../components/VehiclesTab';
import { TransactionEnquiryTab } from '../components/TransactionEnquiryTab';
import type { Debtor } from '@/types/debtors';

const emptyContact = { name: '', telephone: '', fax: '', cell: '', email: '' };

function getDefaultDebtor(): Partial<Debtor> {
    return {
        accountNumber: '',
        companyName: '',
        titleInitials: '',
        accountType: 'balance_brought_forward',
        vatRegNo: '',
        companyRegNo: '',
        contact1: { ...emptyContact },
        contact2: { ...emptyContact },
        postalAddress: '',
        physicalAddress: '',
        isMainAccount: true,
        mainAccountNo: '',
        mainAccountName: '',
        debtorCategory: '',
        creditLimit: 1000,
        termsOfPayment: 'Cash',
        chargeInterest: false,
        enterOrderNumber: false,
        enterOdometer: false,
        enterRegionCode: false,
        printBalance: 'system_default',
        statementType: 'monthly',
        sendViaPrint: true,
        sendViaEmail: false,
        accountStatus: 'enabled',
        settlementDiscountPct: 0,
        settlementTerms: 'Cash',
        tradeDiscountCategory: '',
        tradeDiscountPct: 0,
        openingBalance: 0,
        currentBalance: 0,
        deposit: 0,
    };
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-ZM', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function DebtorsScreen() {
    const { data: debtors, isLoading } = useDebtors();
    const createDebtor = useCreateDebtor();
    const updateDebtor = useUpdateDebtor();
    const deleteDebtorMut = useDeleteDebtor();

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [addOpen, setAddOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newAccNo, setNewAccNo] = useState('');
    const [editedDebtor, setEditedDebtor] = useState<Debtor | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // When selecting a debtor, copy it into editable state
    const selectDebtor = useCallback((d: Debtor) => {
        setSelectedId(d.id);
        setEditedDebtor({ ...d });
        setHasChanges(false);
    }, []);

    // Handle field changes on the editable copy
    const handleChange = useCallback((patch: Partial<Debtor>) => {
        setEditedDebtor((prev) => prev ? { ...prev, ...patch } : prev);
        setHasChanges(true);
    }, []);

    // Save changes
    const handleSave = async () => {
        if (!editedDebtor || !selectedId) return;
        try {
            await updateDebtor.mutateAsync({ id: selectedId, data: editedDebtor });
            notifications.show({ color: 'green', title: 'Saved', message: 'Debtor updated successfully.' });
            setHasChanges(false);
        } catch (e) {
            notifications.show({ color: 'red', title: 'Failed', message: e instanceof Error ? e.message : 'Error' });
        }
    };

    // Create debtor
    const handleCreate = async () => {
        if (!newName.trim()) return;
        try {
            const created = await createDebtor.mutateAsync({
                ...getDefaultDebtor(),
                accountNumber: newAccNo.trim(),
                companyName: newName.trim(),
            });
            notifications.show({ color: 'green', title: 'Created', message: `${created.companyName} added.` });
            setAddOpen(false);
            setNewName('');
            setNewAccNo('');
            selectDebtor(created);
        } catch (e) {
            notifications.show({ color: 'red', title: 'Failed', message: e instanceof Error ? e.message : 'Error' });
        }
    };

    // Delete debtor
    const handleDelete = async (d: Debtor) => {
        if (!confirm(`Delete debtor "${d.companyName}" (A/C ${d.accountNumber})?`)) return;
        try {
            await deleteDebtorMut.mutateAsync(d.id);
            notifications.show({ color: 'green', title: 'Deleted', message: `${d.companyName} removed.` });
            if (selectedId === d.id) {
                setSelectedId(null);
                setEditedDebtor(null);
            }
        } catch (e) {
            notifications.show({ color: 'red', title: 'Failed', message: e instanceof Error ? e.message : 'Error' });
        }
    };

    // Filter debtors by search
    const filtered = (debtors ?? []).filter((d) => {
        const q = search.toLowerCase();
        return (
            d.companyName.toLowerCase().includes(q) ||
            d.accountNumber.toLowerCase().includes(q)
        );
    });

    if (isLoading) {
        return (
            <Screen title="Debtors">
                <Center h={300}><Loader size="lg" /></Center>
            </Screen>
        );
    }

    return (
        <Screen
            title="Debtors"
            actions={
                <Button leftSection={<IconPlus size={16} />} onClick={() => { setNewName(''); setNewAccNo(''); setAddOpen(true); }}>
                    New Debtor
                </Button>
            }
        >
            <Grid gutter="md">
                {/* ── Left: Debtor List ── */}
                <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                    <Paper p="sm" withBorder radius="md" h="100%">
                        <TextInput
                            placeholder="Search debtors..."
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            mb="sm"
                        />
                        <ScrollArea h="calc(100vh - 280px)">
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>A/C</Table.Th>
                                        <Table.Th>Name</Table.Th>
                                        <Table.Th ta="right">Balance</Table.Th>
                                        <Table.Th />
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {filtered.map((d) => (
                                        <Table.Tr
                                            key={d.id}
                                            onClick={() => selectDebtor(d)}
                                            style={{
                                                cursor: 'pointer',
                                                background: selectedId === d.id ? 'var(--mantine-color-blue-light)' : undefined,
                                            }}
                                        >
                                            <Table.Td fw={600}>{d.accountNumber}</Table.Td>
                                            <Table.Td>{d.companyName}</Table.Td>
                                            <Table.Td ta="right" c={d.currentBalance < 0 ? 'red' : 'green'}>
                                                {formatCurrency(d.currentBalance)}
                                            </Table.Td>
                                            <Table.Td>
                                                <ActionIcon
                                                    variant="subtle" color="red" size="sm"
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(d); }}
                                                >
                                                    <IconTrash size={14} />
                                                </ActionIcon>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                            {filtered.length === 0 && (
                                <Text size="sm" c="dimmed" ta="center" py="md">
                                    {search ? 'No matching debtors' : 'No debtors yet'}
                                </Text>
                            )}
                        </ScrollArea>
                    </Paper>
                </Grid.Col>

                {/* ── Right: Tabbed Detail View ── */}
                <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
                    {editedDebtor ? (
                        <Paper p="md" withBorder radius="md">
                            <Group justify="space-between" mb="md">
                                <Group gap="sm">
                                    <Text fw={700} size="lg">{editedDebtor.companyName}</Text>
                                    <Badge color={editedDebtor.accountStatus === 'enabled' ? 'green' : 'red'}>
                                        {editedDebtor.accountStatus}
                                    </Badge>
                                </Group>
                                <Group gap="sm">
                                    {hasChanges && (
                                        <Button size="sm" loading={updateDebtor.isPending} onClick={handleSave}>
                                            Save Changes
                                        </Button>
                                    )}
                                    <Button size="sm" variant="subtle" onClick={() => { setSelectedId(null); setEditedDebtor(null); }}>
                                        Close
                                    </Button>
                                </Group>
                            </Group>

                            <Tabs defaultValue="general">
                                <Tabs.List mb="md">
                                    <Tabs.Tab value="general" leftSection={<IconUser size={16} />}>General</Tabs.Tab>
                                    <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>Settings</Tabs.Tab>
                                    <Tabs.Tab value="discount" leftSection={<IconDiscount size={16} />}>Discount</Tabs.Tab>
                                    <Tabs.Tab value="vehicles" leftSection={<IconCar size={16} />}>Vehicles</Tabs.Tab>
                                    <Tabs.Tab value="enquiry" leftSection={<IconReceipt size={16} />}>Transaction Enquiry</Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel value="general">
                                    <GeneralTab debtor={editedDebtor} onChange={handleChange} />
                                </Tabs.Panel>

                                <Tabs.Panel value="settings">
                                    <SettingsTab debtor={editedDebtor} onChange={handleChange} />
                                </Tabs.Panel>

                                <Tabs.Panel value="discount">
                                    <DiscountTab debtor={editedDebtor} onChange={handleChange} />
                                </Tabs.Panel>

                                <Tabs.Panel value="vehicles">
                                    <VehiclesTab debtorId={editedDebtor.id} />
                                </Tabs.Panel>

                                <Tabs.Panel value="enquiry">
                                    <TransactionEnquiryTab debtor={editedDebtor} />
                                </Tabs.Panel>
                            </Tabs>
                        </Paper>
                    ) : (
                        <Paper p="xl" withBorder radius="md" h="100%">
                            <Center h={300}>
                                <Stack align="center" gap="sm">
                                    <IconUser size={48} color="var(--mantine-color-gray-5)" />
                                    <Text size="lg" c="dimmed">Select a debtor from the list</Text>
                                    <Text size="sm" c="dimmed">or click "New Debtor" to create one</Text>
                                </Stack>
                            </Center>
                        </Paper>
                    )}
                </Grid.Col>
            </Grid>

            {/* ── New Debtor Modal ── */}
            <Modal opened={addOpen} onClose={() => setAddOpen(false)} title="New Debtor" centered>
                <Stack gap="sm">
                    <TextInput
                        label="Account Number"
                        placeholder="e.g. 043"
                        value={newAccNo}
                        onChange={(e) => setNewAccNo(e.currentTarget.value)}
                        required
                    />
                    <TextInput
                        label="Company / Surname"
                        placeholder="Company name"
                        value={newName}
                        onChange={(e) => setNewName(e.currentTarget.value)}
                        required
                    />
                    <Button
                        fullWidth
                        loading={createDebtor.isPending}
                        onClick={handleCreate}
                        disabled={!newName.trim() || !newAccNo.trim()}
                    >
                        Create Debtor
                    </Button>
                </Stack>
            </Modal>
        </Screen>
    );
}
