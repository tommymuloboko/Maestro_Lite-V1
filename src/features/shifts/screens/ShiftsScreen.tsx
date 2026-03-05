import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Badge, Loader, Center, Group, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { Screen } from '@/layouts/Screen';
import { DataTable } from '@/components/common/DataTable';
import { FiltersBar } from '@/components/common/FiltersBar';
import { formatDateTime } from '@/lib/utils/dates';
import { getStoredUser, getStoredStationId } from '@/lib/storage/secureStore';
import { StartShiftModal } from '../components/StartShiftModal';
import { EndShiftModal } from '../components/EndShiftModal';
import { CloseDeclarationModal } from '../components/CloseDeclarationModal';
import type { CloseDeclarationValues } from '../components/CloseDeclarationModal';
import { attendantShiftsApi } from '../api/attendantShiftsApi';
import type { Shift } from '../types/attendantShifts';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/routes/paths';

function toUiStatus(s: Shift): { label: string; color: string } {
  if (s.is_open) return { label: 'ACTIVE', color: 'blue' };
  if (s.is_disputed) return { label: 'DISPUTED', color: 'red' };
  if (s.is_verified) return { label: 'VERIFIED', color: 'green' };
  if (s.is_pending_verification) return { label: 'PENDING', color: 'orange' };
  if (s.is_ended) return { label: 'ENDED', color: 'gray' };
  return { label: 'CLOSED', color: 'gray' };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export function ShiftsScreen() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [startShiftOpened, setStartShiftOpened] = useState(false);
  const [endShiftOpened, setEndShiftOpened] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [closeDeclarationOpened, setCloseDeclarationOpened] = useState(false);
  const [declarationShiftId, setDeclarationShiftId] = useState<string | null>(null);
  const [declarationAttendantName, setDeclarationAttendantName] = useState<string>('');

  const navigate = useNavigate();

  const loadShifts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await attendantShiftsApi.listShifts({ limit: 100, offset: 0 });
      setShifts(res.shifts ?? []);
    } catch (error: unknown) {
      console.error('Failed to load shifts:', error);
      notifications.show({
        color: 'red',
        title: 'Failed to load shifts',
        message: getErrorMessage(error),
      });
      setShifts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadShifts();
  }, [loadShifts]);

  const columns = useMemo(
    () => [
      {
        key: 'attendant',
        header: 'Attendant',
        render: (shift: Shift) => shift.attendant_name ?? shift.attendant_no ?? 'Unknown',
      },
      {
        key: 'tag',
        header: 'Tag',
        render: (shift: Shift) => shift.tag_number,
      },
      {
        key: 'startTime',
        header: 'Start',
        render: (shift: Shift) => formatDateTime(shift.started_at),
      },
      {
        key: 'endTime',
        header: 'End',
        render: (shift: Shift) => (shift.ended_at ? formatDateTime(shift.ended_at) : '-'),
      },
      {
        key: 'status',
        header: 'Status',
        render: (shift: Shift) => {
          const meta = toUiStatus(shift);
          return (
            <Badge color={meta.color} variant="light">
              {meta.label}
            </Badge>
          );
        },
      },
      {
        key: 'actions',
        header: '',
        render: (shift: Shift) => (
          <Group gap="xs" justify="flex-end">
            <Button
              size="xs"
              variant="subtle"
              onClick={(e) => {
                e.stopPropagation();
                navigate(paths.shiftDetails(shift.id));
              }}
            >
              Details
            </Button>
            {shift.is_open ? (
              <Button
                size="xs"
                color="brand"
                variant="light"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedShift(shift);
                  setEndShiftOpened(true);
                }}
              >
                End
              </Button>
            ) : null}
            {shift.is_ended && !shift.is_verified && !shift.is_open ? (
              <Button
                size="xs"
                color="blue"
                variant="light"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeclarationShiftId(shift.id);
                  setDeclarationAttendantName(shift.attendant_name ?? '');
                  setCloseDeclarationOpened(true);
                }}
              >
                Declare
              </Button>
            ) : null}
          </Group>
        ),
      },
    ],
    [navigate]
  );

  if (isLoading) {
    return (
      <Screen title="Shifts">
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </Screen>
    );
  }

  return (
    <Screen
      title="Shifts"
      actions={
        <Button leftSection={<IconPlus size={16} />} onClick={() => setStartShiftOpened(true)}>
          Start Shift
        </Button>
      }
    >
      <FiltersBar
        searchPlaceholder="Search by attendant/tag..."
        filters={[]}
      />

      {shifts.length === 0 ? (
        <Text size="sm" c="dimmed" py="md">
          No shifts found. Start a new shift to see it here.
        </Text>
      ) : null}

      <DataTable
        data={shifts}
        columns={columns}
        isLoading={isLoading}
        getRowKey={(shift) => shift.id}
        emptyMessage="No shifts found"
        onRowClick={(shift) => navigate(paths.shiftDetails(shift.id))}
      />

      <StartShiftModal
        opened={startShiftOpened}
        onClose={() => setStartShiftOpened(false)}
        onSubmit={async ({ attendantId, tagId }) => {
          const user = getStoredUser();
          const station_id = user?.stationId || getStoredStationId() || '';
          const company_id = user?.companyId || '';
          const opened_by_user_id = user?.id || '';

          if (!company_id || !station_id || !opened_by_user_id) {
            notifications.show({
              color: 'red',
              title: 'Missing context',
              message: 'Could not determine company, station, or user from your session. Please log in again.',
            });
            return;
          }

          try {
            // map tagId -> tag_number by calling tags (cheap enough for now)
            const tagsRes = await attendantShiftsApi.getAttendantTags();
            const tag = (tagsRes.data ?? []).find((t) => t.id === tagId);
            if (!tag) throw new Error('Selected tag not found');

            await attendantShiftsApi.openShift({
              company_id,
              station_id,
              attendant_id: attendantId,
              tag_number: tag.tag_number,
              opened_by_user_id,
            });

            notifications.show({
              color: 'green',
              title: 'Shift started',
              message: 'A new shift was started successfully.',
            });

            setStartShiftOpened(false);
            await loadShifts();
          } catch (error: unknown) {
            notifications.show({
              color: 'red',
              title: 'Failed to start shift',
              message: getErrorMessage(error),
            });
          }
        }}
      />

      <EndShiftModal
        opened={endShiftOpened}
        onClose={() => {
          setEndShiftOpened(false);
          setSelectedShift(null);
        }}
        onSubmit={async ({ notes }) => {
          if (!selectedShift) return;
          const user = getStoredUser();
          const ended_by_user_id = user?.id ?? '';
          if (!ended_by_user_id) {
            notifications.show({
              color: 'red',
              title: 'Missing user',
              message: 'Could not determine user from your session. Please log in again.',
            });
            return;
          }

          try {
            await attendantShiftsApi.endShift(selectedShift.id, { ended_by_user_id, notes });
            notifications.show({
              color: 'green',
              title: 'Shift ended',
              message: 'Now submit the close-out declaration.',
            });
            // Store shift info for close-declaration, then open that modal
            setDeclarationShiftId(selectedShift.id);
            setDeclarationAttendantName(selectedShift.attendant_name ?? '');
            setEndShiftOpened(false);
            setSelectedShift(null);
            setCloseDeclarationOpened(true);
          } catch (error: unknown) {
            notifications.show({
              color: 'red',
              title: 'Failed to end shift',
              message: getErrorMessage(error),
            });
          }
        }}
      />

      <CloseDeclarationModal
        opened={closeDeclarationOpened}
        onClose={() => {
          setCloseDeclarationOpened(false);
          setDeclarationShiftId(null);
          void loadShifts();
        }}
        attendantName={declarationAttendantName}
        onSubmit={async (values: CloseDeclarationValues) => {
          if (!declarationShiftId) return;
          try {
            await attendantShiftsApi.submitCloseDeclaration(declarationShiftId, values);
            notifications.show({
              color: 'green',
              title: 'Declaration submitted',
              message: 'Close-out declaration recorded successfully.',
            });
            setCloseDeclarationOpened(false);
            setDeclarationShiftId(null);
            await loadShifts();
          } catch (error: unknown) {
            notifications.show({
              color: 'red',
              title: 'Failed to submit declaration',
              message: getErrorMessage(error),
            });
          }
        }}
      />
    </Screen>
  );
}
