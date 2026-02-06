import {
  Button,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconLock, IconUser } from "@tabler/icons-react";

type LoginFormProps = {
  onSubmit?: (values: { username: string; password: string }) => void;
  loading?: boolean;
};

export default function LoginForm({ onSubmit, loading }: LoginFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const username = String(data.get("username") ?? "");
    const password = String(data.get("password") ?? "");

    onSubmit?.({ username, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Group justify="center" mb={18}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: "rgba(255,255,255,0.10)",
            display: "grid",
            placeItems: "center",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <IconUser size={28} />
        </div>
      </Group>

      <Title order={3} ta="center">
        System Login
      </Title>
      <Text size="sm" ta="center" c="rgba(255,255,255,0.65)" mt={6}>
        Please identify yourself
      </Text>

      <Divider my="lg" color="rgba(255,255,255,0.12)" />

      <Stack gap="md">
        <TextInput
          name="username"
          label="Username"
          placeholder="admin"
          leftSection={<IconUser size={16} />}
          required
          styles={{
            label: { color: "rgba(255,255,255,0.75)" },
            input: {
              background: "rgba(255,255,255,0.06)",
              borderColor: "rgba(255,255,255,0.12)",
              color: "white",
            },
          }}
        />

        <PasswordInput
          name="password"
          label="Password"
          placeholder="••••••••"
          leftSection={<IconLock size={16} />}
          required
          styles={{
            label: { color: "rgba(255,255,255,0.75)" },
            input: {
              background: "rgba(255,255,255,0.06)",
              borderColor: "rgba(255,255,255,0.12)",
              color: "white",
            },
          }}
        />

        <Button type="submit" size="md" radius="md" fullWidth mt={4} loading={loading}>
          Sign In
        </Button>

        <Group justify="center" mt={6}>
          <Button
            type="button"
            variant="subtle"
            color="gray"
            size="xs"
            styles={{ root: { color: "rgba(255,255,255,0.65)" } }}
          >
            Backoffice
          </Button>
          <Button
            type="button"
            variant="subtle"
            color="gray"
            size="xs"
            styles={{ root: { color: "rgba(255,255,255,0.65)" } }}
          >
            Shutdown
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

