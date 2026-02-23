/**
 * VehiclesTab — Vehicle list with fueling schedule.
 * Mirrors the Hipos "Vehicles" tab in Debtors Maintenance.
 */

import { useState } from 'react';
import {
    Table, Button, Group, Text, ActionIcon, Modal, TextInput, Select,
    Switch, Stack, Loader, Center,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useDebtorVehicles, useAddVehicle, useRemoveVehicle } from '../api/debtors.hooks';
import type { DebtorVehicle } from '@/types/debtors';

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Props {
    debtorId: string;
}

export function VehiclesTab({ debtorId }: Props) {
    const { data: vehicles, isLoading } = useDebtorVehicles(debtorId);
    const addVehicle = useAddVehicle();
    const removeVehicle = useRemoveVehicle();

    // ── Add vehicle modal ──
    const [addOpen, setAddOpen] = useState(false);
    const [reg, setReg] = useState('');
    const [driver, setDriver] = useState('');
    const [tagNo, setTagNo] = useState('');
    const [grades, setGrades] = useState('ALL GRADES');
    const [cardNo, setCardNo] = useState('');

    const resetForm = () => { setReg(''); setDriver(''); setTagNo(''); setGrades('ALL GRADES'); setCardNo(''); };

    const handleAdd = async () => {
        if (!reg.trim()) return;
        try {
            await addVehicle.mutateAsync({
                debtorId,
                data: {
                    registration: reg.trim(),
                    driver: driver.trim(),
                    tagNo: tagNo.trim(),
                    gradesAllowed: grades,
                    cardNo: cardNo.trim(),
                    restrictFuelingTimes: false,
                    schedule: DAY_LABELS.map((_, i) => ({
                        dayOfWeek: i,
                        isAllowed: true,
                        timeFrom: '00:00',
                        timeTo: '23:59',
                    })),
                },
            });
            notifications.show({ color: 'green', title: 'Success', message: 'Vehicle added.' });
            setAddOpen(false);
            resetForm();
        } catch (e) {
            notifications.show({ color: 'red', title: 'Failed', message: e instanceof Error ? e.message : 'Error' });
        }
    };

    const handleRemove = async (v: DebtorVehicle) => {
        if (!confirm(`Remove vehicle ${v.registration}?`)) return;
        try {
            await removeVehicle.mutateAsync({ debtorId, vehicleId: v.id });
            notifications.show({ color: 'green', title: 'Removed', message: `${v.registration} removed.` });
        } catch (e) {
            notifications.show({ color: 'red', title: 'Failed', message: e instanceof Error ? e.message : 'Error' });
        }
    };

    if (isLoading) {
        return <Center h={200}><Loader size="lg" /></Center>;
    }

    return (
        <>
            <Group justify="space-between" mb="md">
                <Text fw={600}>Vehicles</Text>
                <Button size="sm" leftSection={<IconPlus size={14} />} onClick={() => { resetForm(); setAddOpen(true); }}>
                    Add Vehicle
                </Button>
            </Group>

            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Registration</Table.Th>
                        <Table.Th>Driver</Table.Th>
                        <Table.Th>Tag Number</Table.Th>
                        <Table.Th>Grades Allowed</Table.Th>
                        <Table.Th>Card Number</Table.Th>
                        <Table.Th>Restricted</Table.Th>
                        <Table.Th />
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {(vehicles ?? []).map((v) => (
                        <Table.Tr key={v.id}>
                            <Table.Td fw={600}>{v.registration}</Table.Td>
                            <Table.Td>{v.driver || '—'}</Table.Td>
                            <Table.Td ff="monospace">{v.tagNo || '—'}</Table.Td>
                            <Table.Td>{v.gradesAllowed}</Table.Td>
                            <Table.Td ff="monospace">{v.cardNo || '—'}</Table.Td>
                            <Table.Td>
                                <Switch size="sm" checked={v.restrictFuelingTimes} readOnly />
                            </Table.Td>
                            <Table.Td>
                                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleRemove(v)}>
                                    <IconTrash size={14} />
                                </ActionIcon>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            {(!vehicles || vehicles.length === 0) && (
                <Text size="sm" c="dimmed" ta="center" py="md">No vehicles registered for this debtor</Text>
            )}

            {/* ── Add Vehicle Modal ── */}
            <Modal opened={addOpen} onClose={() => setAddOpen(false)} title="Add Vehicle" centered>
                <Stack gap="sm">
                    <TextInput label="Registration" placeholder="e.g. ALU 1234" value={reg} onChange={(e) => setReg(e.currentTarget.value)} required />
                    <TextInput label="Driver" placeholder="Driver name" value={driver} onChange={(e) => setDriver(e.currentTarget.value)} />
                    <TextInput label="Tag No" placeholder="Tag number" value={tagNo} onChange={(e) => setTagNo(e.currentTarget.value)} />
                    <Select
                        label="Grades Allowed"
                        data={['ALL GRADES', 'DIESEL', 'PETROL', 'UNLEADED']}
                        value={grades}
                        onChange={(v) => setGrades(v ?? 'ALL GRADES')}
                    />
                    <TextInput label="Card No" placeholder="Card number" value={cardNo} onChange={(e) => setCardNo(e.currentTarget.value)} />
                    <Button fullWidth loading={addVehicle.isPending} onClick={handleAdd} disabled={!reg.trim()}>
                        Add Vehicle
                    </Button>
                </Stack>
            </Modal>
        </>
    );
}
