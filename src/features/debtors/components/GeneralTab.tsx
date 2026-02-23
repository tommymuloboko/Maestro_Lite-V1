/**
 * GeneralTab — Debtor account info, contacts, and addresses.
 * Mirrors the Hipos "General" tab in Debtors Maintenance.
 */

import {
    Grid, TextInput, Select, Group, Button, Divider, Text,
} from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import type { Debtor, ContactDetails } from '@/types/debtors';

interface Props {
    debtor: Debtor;
    onChange: (patch: Partial<Debtor>) => void;
    readOnly?: boolean;
}

function ContactFields({
    label,
    contact,
    onChange,
    readOnly,
}: {
    label: string;
    contact: ContactDetails;
    onChange: (c: ContactDetails) => void;
    readOnly?: boolean;
}) {
    const set = (field: keyof ContactDetails, value: string) =>
        onChange({ ...contact, [field]: value });

    return (
        <div>
            <Text fw={600} size="sm" mb="xs">{label}</Text>
            <TextInput label="Name" size="sm" mb={6} value={contact.name} onChange={(e) => set('name', e.currentTarget.value)} readOnly={readOnly} />
            <TextInput label="Telephone" size="sm" mb={6} value={contact.telephone} onChange={(e) => set('telephone', e.currentTarget.value)} readOnly={readOnly} />
            <TextInput label="Fax" size="sm" mb={6} value={contact.fax} onChange={(e) => set('fax', e.currentTarget.value)} readOnly={readOnly} />
            <TextInput label="Cell" size="sm" mb={6} value={contact.cell} onChange={(e) => set('cell', e.currentTarget.value)} readOnly={readOnly} />
            <TextInput label="E-Mail" size="sm" value={contact.email} onChange={(e) => set('email', e.currentTarget.value)} readOnly={readOnly} />
        </div>
    );
}

export function GeneralTab({ debtor, onChange, readOnly }: Props) {
    const copyAddress = (direction: 'postal_to_physical' | 'physical_to_postal') => {
        if (direction === 'postal_to_physical') {
            onChange({ physicalAddress: debtor.postalAddress });
        } else {
            onChange({ postalAddress: debtor.physicalAddress });
        }
    };

    return (
        <>
            {/* ── Account Info ── */}
            <Grid gutter="md" mb="md">
                <Grid.Col span={{ base: 12, sm: 4 }}>
                    <TextInput
                        label="Account Number"
                        value={debtor.accountNumber}
                        onChange={(e) => onChange({ accountNumber: e.currentTarget.value })}
                        readOnly={readOnly}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 8 }}>
                    <TextInput
                        label="Surname / Company Name"
                        value={debtor.companyName}
                        onChange={(e) => onChange({ companyName: e.currentTarget.value })}
                        readOnly={readOnly}
                    />
                </Grid.Col>
            </Grid>

            <Grid gutter="md" mb="md">
                <Grid.Col span={{ base: 12, sm: 4 }}>
                    <TextInput
                        label="Title and Initials"
                        value={debtor.titleInitials}
                        onChange={(e) => onChange({ titleInitials: e.currentTarget.value })}
                        readOnly={readOnly}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Select
                        label="Account Type"
                        data={[
                            { value: 'balance_brought_forward', label: 'Balance Brought Forward' },
                            { value: 'open_item', label: 'Open Item' },
                        ]}
                        value={debtor.accountType}
                        onChange={(v) => onChange({ accountType: (v as Debtor['accountType']) ?? 'balance_brought_forward' })}
                        readOnly={readOnly}
                    />
                </Grid.Col>
            </Grid>

            <Grid gutter="md" mb="lg">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                        label="VAT Reg #"
                        value={debtor.vatRegNo}
                        onChange={(e) => onChange({ vatRegNo: e.currentTarget.value })}
                        readOnly={readOnly}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                        label="Company Reg #"
                        value={debtor.companyRegNo}
                        onChange={(e) => onChange({ companyRegNo: e.currentTarget.value })}
                        readOnly={readOnly}
                    />
                </Grid.Col>
            </Grid>

            <Divider mb="md" />

            {/* ── Contacts ── */}
            <Grid gutter="xl" mb="lg">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <ContactFields
                        label="Contact Details 1"
                        contact={debtor.contact1}
                        onChange={(c) => onChange({ contact1: c })}
                        readOnly={readOnly}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <ContactFields
                        label="Contact Details 2"
                        contact={debtor.contact2}
                        onChange={(c) => onChange({ contact2: c })}
                        readOnly={readOnly}
                    />
                </Grid.Col>
            </Grid>

            <Divider mb="md" />

            {/* ── Addresses ── */}
            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Group justify="space-between" mb="xs">
                        <Text fw={600} size="sm">Postal Address</Text>
                        {!readOnly && (
                            <Button
                                size="xs" variant="subtle" leftSection={<IconCopy size={14} />}
                                onClick={() => copyAddress('postal_to_physical')}
                            >
                                Copy →
                            </Button>
                        )}
                    </Group>
                    <TextInput
                        value={debtor.postalAddress}
                        onChange={(e) => onChange({ postalAddress: e.currentTarget.value })}
                        readOnly={readOnly}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Group justify="space-between" mb="xs">
                        <Text fw={600} size="sm">Physical Address</Text>
                        {!readOnly && (
                            <Button
                                size="xs" variant="subtle" leftSection={<IconCopy size={14} />}
                                onClick={() => copyAddress('physical_to_postal')}
                            >
                                ← Copy
                            </Button>
                        )}
                    </Group>
                    <TextInput
                        value={debtor.physicalAddress}
                        onChange={(e) => onChange({ physicalAddress: e.currentTarget.value })}
                        readOnly={readOnly}
                    />
                </Grid.Col>
            </Grid>
        </>
    );
}
