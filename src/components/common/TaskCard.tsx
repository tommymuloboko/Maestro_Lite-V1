import { Paper, Badge, Text, Group, Avatar } from '@mantine/core';

interface TaskCardProps {
  title: string;
  description: string;
  badge: {
    label: string;
    color: string;
  };
  date: string;
  assignee?: string;
}

export function TaskCard({ title, description, badge, date, assignee }: TaskCardProps) {
  return (
    <Paper p="md" radius="md" withBorder bg="white">
      <Badge 
        size="sm" 
        variant="light" 
        color={badge.color}
        mb="sm"
      >
        {badge.label}
      </Badge>
      
      <Text fw={600} size="sm" mb={4}>
        {title}
      </Text>
      
      <Text size="xs" c="dimmed" lineClamp={2} mb="md">
        {description}
      </Text>
      
      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed">
          {date}
        </Text>
        {assignee && (
          <Group gap={6}>
            <Avatar size={20} radius="xl" color="blue">
              {assignee.charAt(0).toUpperCase()}
            </Avatar>
            <Text size="xs" c="dimmed">
              {assignee}
            </Text>
          </Group>
        )}
      </Group>
    </Paper>
  );
}
