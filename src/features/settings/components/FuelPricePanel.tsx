/**
 * FuelPricePanel — Allows managers to view and change fuel prices per grade.
 * Uses mock data until backend endpoints are available.
 */

import { useState, useEffect, useCallback } from 'react';
import {
    Stack, Table, NumberInput, Button, Group, Text, Badge,
    Loader, Center, Paper, ActionIcon, Modal, TextInput,
} from '@mantine/core';
import { IconPlus, IconPencil, IconCheck, IconX, IconGasStation } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

// ─── Types ───────────────────────────────────────────────────

interface FuelGrade {
    id: string;
    name: string;
    currentPrice: number;
    previousPrice: number;
    unit: string;
    lastChanged: string;
    changedBy: string;
}

// ─── Mock Data ───────────────────────────────────────────────

const INITIAL_GRADES: FuelGrade[] = [
    {
        id: 'fg-1', name: 'Diesel 50ppm', currentPrice: 25.50, previousPrice: 24.80,
        unit: 'K/L', lastChanged: '2026-02-15T10:00:00Z', changedBy: 'Admin',
    },
    {
        id: 'fg-2', name: 'Petrol 93', currentPrice: 27.00, previousPrice: 26.50,
        unit: 'K/L', lastChanged: '2026-02-15T10:00:00Z', changedBy: 'Admin',
    },
    {
        id: 'fg-3', name: 'Petrol 95', currentPrice: 28.20, previousPrice: 27.80,
        unit: 'K/L', lastChanged: '2026-02-15T10:00:00Z', changedBy: 'Admin',
    },
    {
        id: 'fg-4', name: 'Kerosene', currentPrice: 22.00, previousPrice: 21.50,
        unit: 'K/L', lastChanged: '2026-01-28T08:00:00Z', changedBy: 'Admin',
    },
];

// Simulate API delay
const delay = (ms = 300) => new Promise<void>((r) => setTimeout(r, ms));

function formatCurrency(value: number): string {
    return value.toFixed(2);
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-ZM', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

// ─── Component ───────────────────────────────────────────────

export function FuelPricePanel() {
    const [grades, setGrades] = useState<FuelGrade[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState<number>(0);
    const [saving, setSaving] = useState(false);

    // Add grade modal
    const [addOpen, setAddOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState<number>(0);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        await delay();
        setGrades([...INITIAL_GRADES]);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    // Start editing a price
    const startEdit = (grade: FuelGrade) => {
        setEditingId(grade.id);
        setEditPrice(grade.currentPrice);
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingId(null);
        setEditPrice(0);
    };

    // Save price change
    const savePrice = async (grade: FuelGrade) => {
        if (editPrice <= 0) {
            notifications.show({ color: 'red', title: 'Invalid', message: 'Price must be greater than zero.' });
            return;
        }
        if (editPrice === grade.currentPrice) {
            cancelEdit();
            return;
        }

        setSaving(true);
        await delay(500);

        setGrades((prev) =>
            prev.map((g) =>
                g.id === grade.id
                    ? {
                        ...g,
                        previousPrice: g.currentPrice,
                        currentPrice: editPrice,
                        lastChanged: new Date().toISOString(),
                        changedBy: 'Manager', // Would come from auth context in production
                    }
                    : g,
            ),
        );

        notifications.show({
            color: 'green',
            title: 'Price Updated',
            message: `${grade.name}: K${formatCurrency(grade.currentPrice)} → K${formatCurrency(editPrice)}`,
        });

        setSaving(false);
        setEditingId(null);
    };

    // Add new fuel grade
    const handleAddGrade = async () => {
        if (!newName.trim() || newPrice <= 0) return;
        setSaving(true);
        await delay(400);

        const newGrade: FuelGrade = {
            id: `fg-${Date.now()}`,
            name: newName.trim(),
            currentPrice: newPrice,
            previousPrice: 0,
            unit: 'K/L',
            lastChanged: new Date().toISOString(),
            changedBy: 'Manager',
        };

        setGrades((prev) => [...prev, newGrade]);
        notifications.show({ color: 'green', title: 'Added', message: `${newGrade.name} added at K${formatCurrency(newPrice)}/L.` });
        setAddOpen(false);
        setNewName('');
        setNewPrice(0);
        setSaving(false);
    };

    if (isLoading) {
        return <Center h={200}><Loader size="lg" /></Center>;
    }

    return (
        <Stack gap="lg">
            <Group justify="space-between">
                <div>
                    <Text fw={600} size="lg">Fuel Prices</Text>
                    <Text size="sm" c="dimmed">Update selling prices for each fuel grade. Changes take effect immediately at the POS.</Text>
                </div>
                <Button
                    size="sm"
                    leftSection={<IconPlus size={14} />}
                    onClick={() => { setNewName(''); setNewPrice(0); setAddOpen(true); }}
                >
                    Add Grade
                </Button>
            </Group>

            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Fuel Grade</Table.Th>
                        <Table.Th ta="right">Current Price</Table.Th>
                        <Table.Th ta="right">Previous Price</Table.Th>
                        <Table.Th ta="center">Change</Table.Th>
                        <Table.Th>Last Updated</Table.Th>
                        <Table.Th>Changed By</Table.Th>
                        <Table.Th />
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {grades.map((grade) => {
                        const diff = grade.currentPrice - grade.previousPrice;
                        const pctChange = grade.previousPrice > 0
                            ? ((diff / grade.previousPrice) * 100).toFixed(1)
                            : '—';
                        const isEditing = editingId === grade.id;

                        return (
                            <Table.Tr key={grade.id}>
                                <Table.Td>
                                    <Group gap="xs">
                                        <IconGasStation size={16} color="var(--mantine-color-orange-6)" />
                                        <Text fw={600}>{grade.name}</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td ta="right">
                                    {isEditing ? (
                                        <NumberInput
                                            value={editPrice}
                                            onChange={(v) => setEditPrice(Number(v) || 0)}
                                            decimalScale={2}
                                            fixedDecimalScale
                                            prefix="K "
                                            min={0.01}
                                            step={0.10}
                                            size="sm"
                                            style={{ maxWidth: 140 }}
                                            autoFocus
                                        />
                                    ) : (
                                        <Text fw={700}>K {formatCurrency(grade.currentPrice)}</Text>
                                    )}
                                </Table.Td>
                                <Table.Td ta="right" c="dimmed">
                                    K {formatCurrency(grade.previousPrice)}
                                </Table.Td>
                                <Table.Td ta="center">
                                    {grade.previousPrice > 0 ? (
                                        <Badge
                                            size="sm"
                                            variant="light"
                                            color={diff > 0 ? 'red' : diff < 0 ? 'green' : 'gray'}
                                        >
                                            {diff > 0 ? '+' : ''}{pctChange}%
                                        </Badge>
                                    ) : (
                                        <Text size="sm" c="dimmed">New</Text>
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm">{formatDate(grade.lastChanged)}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm">{grade.changedBy}</Text>
                                </Table.Td>
                                <Table.Td>
                                    {isEditing ? (
                                        <Group gap={4}>
                                            <ActionIcon
                                                variant="filled" color="green" size="sm"
                                                loading={saving}
                                                onClick={() => savePrice(grade)}
                                            >
                                                <IconCheck size={14} />
                                            </ActionIcon>
                                            <ActionIcon variant="subtle" color="gray" size="sm" onClick={cancelEdit}>
                                                <IconX size={14} />
                                            </ActionIcon>
                                        </Group>
                                    ) : (
                                        <ActionIcon variant="subtle" size="sm" onClick={() => startEdit(grade)}>
                                            <IconPencil size={14} />
                                        </ActionIcon>
                                    )}
                                </Table.Td>
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>

            {grades.length === 0 && (
                <Text size="sm" c="dimmed" ta="center" py="md">No fuel grades configured</Text>
            )}

            {/* Summary cards */}
            <Paper p="md" withBorder radius="md" bg="var(--mantine-color-dark-7)">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="sm">Price Summary</Text>
                <Group gap="xl">
                    {grades.map((g) => (
                        <div key={g.id}>
                            <Text size="xs" c="dimmed">{g.name}</Text>
                            <Text fw={700} size="lg">K {formatCurrency(g.currentPrice)}<Text span size="xs" c="dimmed"> /{g.unit.replace('K/', '')}</Text></Text>
                        </div>
                    ))}
                </Group>
            </Paper>

            {/* Add Grade Modal */}
            <Modal opened={addOpen} onClose={() => setAddOpen(false)} title="Add Fuel Grade" centered>
                <Stack gap="sm">
                    <TextInput
                        label="Grade Name"
                        placeholder="e.g. Diesel 500ppm"
                        value={newName}
                        onChange={(e) => setNewName(e.currentTarget.value)}
                        required
                    />
                    <NumberInput
                        label="Price per Litre"
                        prefix="K "
                        value={newPrice}
                        onChange={(v) => setNewPrice(Number(v) || 0)}
                        decimalScale={2}
                        fixedDecimalScale
                        min={0.01}
                        required
                    />
                    <Button
                        fullWidth loading={saving}
                        onClick={handleAddGrade}
                        disabled={!newName.trim() || newPrice <= 0}
                    >
                        Add Grade
                    </Button>
                </Stack>
            </Modal>
        </Stack>
    );
}
