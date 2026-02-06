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
            color="gray"
            styles={{
              root: {
                border: "1px solid #e9ecef",
                background: "white",
              },
            }}
          >
            <IconMenu2 size={18} />
          </ActionIcon>
        )}

        {/* Station badge — green outlined */}
        <Badge
          size="lg"
          variant="light"
          color="brand"
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
            },
          }}
        >
          {stationName}
        </Badge>

        {/* Banner (optional — orange for attention) */}
        {showBanner && (
          <Box
            px="md"
            py={10}
            visibleFrom="sm"
            style={{
              background: "var(--fuel-orange-light)",
              border: "1px solid rgba(249,115,22,0.2)",
              borderRadius: 10,
              minWidth: 0,
            }}
          >
            <Text fw={800} c="var(--fuel-orange-deep)" truncate>
              {bannerText}
            </Text>
          </Box>
        )}
      </Group>

      {/* Right side */}
      <Group gap="sm" wrap="nowrap" align="center">
        {/* Clock — green filled pill */}
        <Badge
          size="lg"
          variant="filled"
          color="brand"
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
            },
          }}
        >
          {timeText}
        </Badge>

        <ActionIcon
          variant="subtle"
          radius="md"
          size={36}
          color="gray"
          styles={{
            root: {
              border: "1px solid #e9ecef",
              background: "white",
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
                border: "1px solid #e9ecef",
                background: "white",
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
