import { Grid, Paper, Group, Text, Table, Badge, ActionIcon, Anchor, Box } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { IconCopy, IconTrash } from '@tabler/icons-react';
import { StatCard } from '@/components/common/StatCard';
import { TaskCard } from '@/components/common/TaskCard';
import { mockDashboardStats, mockDashboardTasks, mockRecentShifts } from '@/mocks';

function getStatusColor(status: string) {
  switch (status) {
    case 'Verified': return 'green';
    case 'Pending': return 'yellow';
    case 'Variance': return 'red';
    default: return 'gray';
  }
}

export default function DashboardScreen() {
  return (
    <Box>
      {/* Stats row */}
      <Grid mb="xl" gutter="md">
        {mockDashboardStats.map((stat) => (
          <Grid.Col key={stat.label} span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard {...stat} />
          </Grid.Col>
        ))}
      </Grid>

      <Grid gutter="md">
        {/* Left column - Tasks + Recent shifts */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          {/* My tasks */}
          <Paper p="lg" radius="md" bg="white" mb="md" shadow="0">
            <Group justify="space-between" mb="md">
              <Text fw={600} size="md">My tasks</Text>
              <Anchor size="sm" c="dimmed">
                See all
              </Anchor>
            </Group>
            
            <Grid gutter="md">
              {mockDashboardTasks.map((task) => (
                <Grid.Col key={task.id} span={{ base: 12, sm: 6 }}>
                  <TaskCard {...task} />
                </Grid.Col>
              ))}
            </Grid>
          </Paper>

          {/* Recent shifts */}
          <Paper p="lg" radius="md" bg="white" shadow="0">
            <Group justify="space-between" mb="md">
              <Text fw={600}>Recent shifts</Text>
              <Anchor size="sm" c="dimmed">
                See all
              </Anchor>
            </Group>

            <Table striped={false} highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>SHIFT ID</Table.Th>
                  <Table.Th>ATTENDANT</Table.Th>
                  <Table.Th>AMOUNT</Table.Th>
                  <Table.Th>STATUS</Table.Th>
                  <Table.Th>DATE</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {mockRecentShifts.map((shift) => (
                  <Table.Tr key={shift.id}>
                    <Table.Td>
                      <Text size="sm" fw={500}>{shift.id}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="blue" size="sm">
                        {shift.attendant}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{shift.amount}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge 
                        variant="light" 
                        color={getStatusColor(shift.status)}
                        size="sm"
                      >
                        {shift.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">{shift.date}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <ActionIcon variant="subtle" size="sm">
                          <IconCopy size={14} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" size="sm" color="red">
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {/* Pagination hint */}
            <Group justify="space-between" mt="md">
              <Group gap={4}>
                <Badge variant="light" color="gray" size="sm">1</Badge>
                <Text size="xs" c="dimmed">2</Text>
                <Text size="xs" c="dimmed">3</Text>
                <Text size="xs" c="dimmed">...</Text>
                <Text size="xs" c="dimmed">10</Text>
              </Group>
              <Group gap="xs">
                <Text size="xs" c="dimmed">Show by:</Text>
                <Badge variant="filled" color="brand" size="sm">10</Badge>
                <Text size="xs" c="dimmed">25</Text>
                <Text size="xs" c="dimmed">50</Text>
              </Group>
            </Group>
          </Paper>
        </Grid.Col>

        {/* Right column - Calendar */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper p="md" radius="md" withBorder bg="white">
            <Calendar 
              size="md"
              styles={{
                calendarHeader: {
                  maxWidth: '100%',
                },
              }}
            />
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
