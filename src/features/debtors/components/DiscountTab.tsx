/**
 * DiscountTab — Settlement and trade discounts.
 * Mirrors the Hipos "Discount" tab in Debtors Maintenance.
 */

import { Grid, NumberInput, Select, Divider, Text, Paper, Stack } from '@mantine/core';
import type { Debtor } from '@/types/debtors';

interface Props {
    debtor: Debtor;
    onChange: (patch: Partial<Debtor>) => void;
    readOnly?: boolean;
}

export function DiscountTab({ debtor, onChange, readOnly }: Props) {
    return (
        <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 6 }}>
                {/* Settlement Discount */}
                <Paper p="lg" withBorder radius="md">
                    <Text fw={600} mb="md">Settlement Discount</Text>
                    <Stack gap="md">
                        <NumberInput
                            label="Discount %"
                            value={debtor.settlementDiscountPct}
                            onChange={(v) => onChange({ settlementDiscountPct: Number(v) || 0 })}
                            decimalScale={2}
                            fixedDecimalScale
                            suffix=" %"
                            min={0}
                            max={100}
                            readOnly={readOnly}
                        />
                        <Select
                            label="Terms"
                            data={['Cash', 'COD', '7 Days', '14 Days', '30 Days']}
                            value={debtor.settlementTerms}
                            onChange={(v) => onChange({ settlementTerms: v ?? 'Cash' })}
                            readOnly={readOnly}
                        />
                    </Stack>
                </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
                {/* Trade Discount */}
                <Paper p="lg" withBorder radius="md">
                    <Text fw={600} mb="md">Trade Discount</Text>
                    <Stack gap="md">
                        <Select
                            label="Category"
                            data={[
                                { value: 'Fleet', label: 'Fleet' },
                                { value: 'Wholesale', label: 'Wholesale' },
                                { value: 'Government', label: 'Government' },
                                { value: 'Staff', label: 'Staff' },
                            ]}
                            value={debtor.tradeDiscountCategory}
                            onChange={(v) => onChange({ tradeDiscountCategory: v ?? '' })}
                            clearable
                            placeholder="Select category"
                            readOnly={readOnly}
                        />
                        <NumberInput
                            label="Discount %"
                            value={debtor.tradeDiscountPct}
                            onChange={(v) => onChange({ tradeDiscountPct: Number(v) || 0 })}
                            decimalScale={2}
                            fixedDecimalScale
                            suffix=" %"
                            min={0}
                            max={100}
                            readOnly={readOnly}
                        />
                    </Stack>
                </Paper>
            </Grid.Col>

            <Grid.Col span={12}>
                <Divider />
                <Text size="sm" c="dimmed" mt="sm">
                    Settlement discounts are applied when payment is received within the specified terms.
                    Trade discounts are applied automatically based on the debtor's category.
                </Text>
            </Grid.Col>
        </Grid>
    );
}
