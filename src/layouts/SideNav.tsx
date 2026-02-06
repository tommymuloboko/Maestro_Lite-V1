import { NavLink as RRNavLink, useLocation, useNavigate } from "react-router-dom";
import { Group, ScrollArea, Text, UnstyledButton, Box } from "@mantine/core";
import {
  IconDashboard,
  IconActivity,
  IconGasStation,
  IconReportAnalytics,
  IconSettings,
  IconLogout,
  IconFlame,
} from "@tabler/icons-react";
import { useAuth } from "@/hooks/useAuth";
import { paths } from "@/routes/paths";

type Item = { label: string; to: string; icon: React.ElementType };

const items: Item[] = [
  { label: "Dashboard", to: paths.dashboard, icon: IconDashboard },
  { label: "Monitoring", to: paths.monitoring, icon: IconActivity },
  { label: "Fuel Sales", to: paths.fuelSales, icon: IconGasStation },
  { label: "Reports", to: paths.reports, icon: IconReportAnalytics },
  { label: "Settings", to: paths.settings, icon: IconSettings },
];

function SideItem({ item, active }: { item: Item; active: boolean }) {
  const Icon = item.icon;

  return (
    <UnstyledButton
      component={RRNavLink}
      to={item.to}
      className={active ? undefined : "nav-item"}
      style={{
        width: "100%",
        borderRadius: 8,
        padding: "10px 14px",
        marginBottom: 2,
        color: active ? "var(--sidebar-text-active)" : "var(--sidebar-text)",
        background: active ? "var(--sidebar-active-bg)" : "transparent",
        border: active ? "1px solid var(--sidebar-active-border)" : "1px solid transparent",
        transition: "all 150ms ease",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Group gap={12} wrap="nowrap">
        <Icon
          size={20}
          stroke={1.5}
          style={{ color: active ? "var(--sidebar-icon-active)" : "var(--sidebar-text-dim)" }}
        />
        <Text size="sm" fw={active ? 600 : 400}>
          {item.label}
        </Text>
      </Group>
    </UnstyledButton>
  );
}

export default function SideNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(paths.login);
  };

  return (
    <Box
      style={{
        height: "100%",
        background: "var(--sidebar-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Brand */}
      <Box p="md" pb="sm">
        <Group gap={10}>
          <Box
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "var(--fuel-orange)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <IconFlame size={20} stroke={1.5} />
          </Box>
          <div>
            <Text c="white" fw={700} size="sm" lh={1.2}>
              MAESTRO
            </Text>
            <Text size="xs" c="var(--sidebar-text-dim)" lh={1.2}>
              Backoffice
            </Text>
          </div>
        </Group>
      </Box>

      {/* Navigation */}
      <ScrollArea style={{ flex: 1 }} px="xs" scrollbarSize={4}>
        <Box py="xs">
          {items.map((item) => (
            <SideItem
              key={item.to}
              item={item}
              active={pathname === item.to || pathname.startsWith(item.to + "/")}
            />
          ))}
        </Box>
      </ScrollArea>

      {/* Logout — orange CTA (fuel action) */}
      <Box p="sm" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        <UnstyledButton
          onClick={handleLogout}
          className="logout-btn"
          style={{
            width: "100%",
            borderRadius: 8,
            padding: "12px 16px",
            background: "var(--fuel-orange)",
            color: "white",
            transition: "all 120ms ease",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Group gap={12} wrap="nowrap">
            <IconLogout size={20} stroke={1.5} />
            <Text size="sm" fw={500}>
              Logout
            </Text>
          </Group>
        </UnstyledButton>
      </Box>
    </Box>
  );
}
