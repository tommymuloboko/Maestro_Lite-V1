import { Group, TextInput, Select, Button } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FiltersBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
    value: string | null;
    onChange: (value: string | null) => void;
  }[];
  onClear?: () => void;
  actions?: ReactNode;
}

export function FiltersBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  onClear,
  actions,
}: FiltersBarProps) {
  const hasActiveFilters =
    (searchValue && searchValue.length > 0) ||
    filters.some((f) => f.value !== null);

  return (
    <Group gap="sm" wrap="wrap">
      {onSearchChange && (
        <TextInput
          placeholder={searchPlaceholder}
          leftSection={<IconSearch size={16} />}
          value={searchValue}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          style={{ minWidth: 200 }}
        />
      )}

      {filters.map((filter) => (
        <Select
          key={filter.key}
          placeholder={filter.label}
          data={filter.options}
          value={filter.value}
          onChange={filter.onChange}
          clearable
          style={{ minWidth: 150 }}
        />
      ))}

      {hasActiveFilters && onClear && (
        <Button
          variant="subtle"
          color="gray"
          size="sm"
          leftSection={<IconX size={14} />}
          onClick={onClear}
        >
          Clear
        </Button>
      )}

      {actions && <Group ml="auto">{actions}</Group>}
    </Group>
  );
}
