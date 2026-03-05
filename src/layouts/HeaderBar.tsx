import React from "react";
import {
  Group,
  Box,
  Text,
  Badge,
  Avatar,
  ActionIcon,
  Popover,
  UnstyledButton,
} from "@mantine/core";
import { IconBell, IconMenu2 } from "@tabler/icons-react";
import { useAuth } from "@/hooks/useAuth";
import { useStationConfig } from "@/hooks/useStationConfig";
import BackendStatusIndicator from "@/components/BackendStatusIndicator";

type BackofficeHeaderProps = {
  bannerText?: React.ReactNode;
  onToggleNavbar?: () => void;
};

function useClock(): string {
  const [now, setNow] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const ampm = now
    .toLocaleTimeString([], { hour: "2-digit" })
    .includes("AM")
    ? "AM"
    : "PM";

  return `${time} ${ampm}`;
}

export default function BackofficeHeader({
  bannerText,
  onToggleNavbar,
}: BackofficeHeaderProps) {
  const { user: authUser } = useAuth();
  const { stationName: configStationName } = useStationConfig();

  const timeText = useClock();
  const showBanner = Boolean(bannerText);

  const [userPopoverOpened, setUserPopoverOpened] = React.useState<boolean>(false);

  const displayName = React.useMemo<string>(() => {
    return authUser?.name || authUser?.username || "User";
  }, [authUser?.name, authUser?.username]);

  const roleLabel = React.useMemo<string>(() => {
    const raw = authUser?.role || "";
    const t = String(raw).replace(/_/g, " ").trim();
    if (!t) return "User";
    return t.replace(/\b\w/g, (m: string) => m.toUpperCase());
  }, [authUser?.role]);

  const stationName: string = configStationName || "Station";
  const avatarInitial: string = (displayName || "A").slice(0, 1).toUpperCase();

  return (
    <Group h="100%" w="100%" justify="space-between" wrap="nowrap" align="center">
      {/* Left side */}
      <Group gap="sm" wrap="nowrap" align="center" style={{ minWidth: 0 }}>
        {onToggleNavbar && (
          <ActionIcon
            variant="subtle"
            radius="md"
            size={36}
            onClick={onToggleNavbar}
            aria-label="Toggle navigation"
            styles={{
              root: {
                border: "1px solid rgba(148,163,184,0.45)",
                background: "rgba(255,255,255,0.78)",
                color: "rgba(15,23,42,0.84)",
                "&:hover": { background: "rgba(255,255,255,0.94)" },
              },
            }}
          >
            <IconMenu2 size={18} />
          </ActionIcon>
        )}

        {/* Station badge */}
        <Badge
          size="lg"
          variant="light"
          radius="md"
          styles={{
            root: {
              height: 36,
              textTransform: "none",
              fontWeight: 600,
              paddingInline: 14,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              background: "var(--brand-green-light)",
              color: "var(--brand-green-deep)",
              border: "1px solid var(--brand-green-focus)",
            },
          }}
        >
          {stationName}
        </Badge>

        {/* Banner (optional) */}
        {showBanner && (
          <Box
            px="md"
            py={10}
            visibleFrom="sm"
            style={{
              background: "var(--brand-green-light)",
              border: "1px solid var(--brand-green-focus)",
              borderRadius: 10,
              minWidth: 0,
            }}
          >
            <Text fw={800} c="var(--brand-green-deep)" truncate>
              {bannerText}
            </Text>
          </Box>
        )}
      </Group>

      {/* Right side */}
      <Group gap="sm" wrap="nowrap" align="center">
        {/* Clock */}
        <Badge
          size="lg"
          radius="md"
          visibleFrom="xs"
          styles={{
            root: {
              height: 36,
              fontWeight: 600,
              letterSpacing: 0.3,
              paddingInline: 14,
              display: "flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.72)",
              color: "rgba(15,23,42,0.84)",
              border: "1px solid rgba(148,163,184,0.4)",
            },
          }}
        >
          {timeText}
        </Badge>

        {/* Backend status indicator */}
        <BackendStatusIndicator />
        <ActionIcon
          variant="subtle"
          radius="md"
          size={36}
          styles={{
            root: {
              border: "1px solid rgba(148,163,184,0.45)",
              background: "rgba(255,255,255,0.78)",
              color: "rgba(15,23,42,0.78)",
              "&:hover": { background: "rgba(255,255,255,0.94)" },
            },
          }}
        >
          <IconBell size={18} />
        </ActionIcon>

        <Popover
          opened={userPopoverOpened}
          onChange={setUserPopoverOpened}
          position="bottom-end"
          withArrow
          shadow="md"
        >
          <Popover.Target>
            <UnstyledButton
              aria-label="User menu"
              onClick={() => setUserPopoverOpened((o) => !o)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                display: "grid",
                placeItems: "center",
                border: "1px solid rgba(148,163,184,0.45)",
                background: "rgba(255,255,255,0.78)",
              }}
            >
              <Avatar radius="md" color="brand" size={28}>
                {avatarInitial}
              </Avatar>
            </UnstyledButton>
          </Popover.Target>

          <Popover.Dropdown>
            <Text fw={800} size="sm">
              {displayName}
            </Text>
            <Text c="dimmed" size="xs">
              {roleLabel}
            </Text>
          </Popover.Dropdown>
        </Popover>
      </Group>
    </Group>
  );
}
