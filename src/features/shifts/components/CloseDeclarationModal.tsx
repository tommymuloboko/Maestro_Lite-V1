import { Modal, Stack, Button, NumberInput, Text, Divider, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';

interface CloseDeclarationModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: CloseDeclarationValues) => void;
    isLoading?: boolean;
    attendantName?: string;
}

export interface CloseDeclarationValues {
    declared_cash: number;
    declared_card: number;
    declared_debtors: number;
    declared_other: Record<string, unknown>;
    declared_total: number;
    currency: string;
}

export function CloseDeclarationModal({
    opened,
    onClose,
    onSubmit,
    isLoading,
    attendantName,
}: CloseDeclarationModalProps) {
    const form = useForm({
        initialValues: {
            declared_cash: 0,
            declared_card: 0,
            declared_mobile_money: 0,
            declared_debtors: 0,
            declared_total: 0,
            currency: 'ZMW',
        },
        validate: {
            declared_total: (v) => (v <= 0 ? 'Total must be greater than 0' : null),
        },
    });

    // Auto-calculate total when parts change
    const cash = form.values.declared_cash || 0;
    const card = form.values.declared_card || 0;
    const mobile = form.values.declared_mobile_money || 0;
    const debtors = form.values.declared_debtors || 0;

    useEffect(() => {
        form.setFieldValue('declared_total', cash + card + mobile + debtors);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cash, card, mobile, debtors]);

    // Reset form when modal opens
    useEffect(() => {
        if (opened) form.reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened]);

    const handleSubmit = (values: typeof form.values) => {
        // Map to the API shape — mobile money goes into declared_other
        const payload: CloseDeclarationValues = {
            declared_cash: values.declared_cash,
            declared_card: values.declared_card,
            declared_debtors: values.declared_debtors,
            declared_other: { mobile_money: values.declared_mobile_money },
            declared_total: values.declared_total,
            currency: values.currency,
        };
        onSubmit(payload);
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Close Declaration" centered radius="lg" size="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <Text size="sm" c="dimmed">
                        {attendantName
                            ? `Submit the close-out declaration for ${attendantName}'s shift.`
                            : 'Submit the close-out declaration for this shift.'}
                        {' '}Enter the amounts collected by payment method.
                    </Text>

                    <NumberInput
                        label="Cash Collected"
                        placeholder="0.00"
                        min={0}
                        decimalScale={2}
                        thousandSeparator=","
                        prefix="K "
                        {...form.getInputProps('declared_cash')}
                    />

                    <NumberInput
                        label="Card Payments"
                        placeholder="0.00"
                        min={0}
                        decimalScale={2}
                        thousandSeparator=","
                        prefix="K "
                        {...form.getInputProps('declared_card')}
                    />

                    <NumberInput
                        label="Mobile Money"
                        placeholder="0.00"
                        min={0}
                        decimalScale={2}
                        thousandSeparator=","
                        prefix="K "
                        {...form.getInputProps('declared_mobile_money')}
                    />

                    <NumberInput
                        label="Debtors / Credit"
                        placeholder="0.00"
                        min={0}
                        decimalScale={2}
                        thousandSeparator=","
                        prefix="K "
                        {...form.getInputProps('declared_debtors')}
                    />

                    <Divider />

                    <Group justify="space-between">
                        <Text fw={600}>Declared Total</Text>
                        <Text fw={700} size="lg">
                            K {(form.values.declared_total || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </Text>
                    </Group>

                    <Button type="submit" fullWidth loading={isLoading}>
                        Submit Declaration
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
}
