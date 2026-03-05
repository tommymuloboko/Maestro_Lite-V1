import { useState } from "react";
import { NavLink as RRNavLink, useLocation, useNavigate } from "react-router-dom";
import { Group, ScrollArea, Text, UnstyledButton, Box, useMantineColorScheme, Collapse } from "@mantine/core";
import {
  IconDashboard,
  IconActivity,
  IconGasStation,
  IconUsers,
  IconReportAnalytics,
  IconSettings,
  IconLogout,
  IconDroplet,
  IconMoon,
  IconSun,
  IconBuildingStore,
  IconChevronRight,
  IconChevronDown,
  IconDatabase,
} from "@tabler/icons-react";
import { useAuth } from "@/hooks/useAuth";
import { paths } from "@/routes/paths";

type NavLinkItem = { label: string; to: string; icon: React.ElementType };
type NavGroupItem = { label: string; icon: React.ElementType; children: Omit<NavLinkItem, 'icon'>[] };
type Item = NavLinkItem | NavGroupItem;

const items: Item[] = [
  { label: "Dashboard", to: paths.dashboard, icon: IconDashboard },
  { label: "Monitoring", to: paths.monitoring, icon: IconActivity },
  { label: "Fuel Sales", to: paths.fuelSales, icon: IconGasStation },
  {
    label: "Forecourt",
    icon: IconBuildingStore,
    children: [
      { label: "Authorize Pump", to: paths.forecourtAuthorizePump },
      { label: "Emergency Stop", to: paths.forecourtEmergencyStop },
      { label: "Price Change", to: paths.forecourtPriceChange },
    ],
  },
  { label: "Debtors", to: paths.debtors, icon: IconUsers },
  {
    label: "Master",
    icon: IconDatabase,
    children: [
      { label: "Products", to: paths.masterProducts },
      { label: "Category", to: paths.masterCategory },
      { label: "Employees", to: paths.masterEmployees },
      { label: "Attendants", to: paths.masterAttendants },
    ],
  },
  {
    label: "Reports",
    icon: IconReportAnalytics,
    children: [
      { label: "Fuel Sales Detail", to: paths.reportsFuelSalesDetail },
      { label: "Daily Sales Summery", to: paths.reportsDailySalesSummary },
      { label: "Fuels Sales Pump", to: paths.reportsFuelSalesPump },
      { label: "Sales By Attendant", to: paths.reportsSalesByAttendant },
      { label: "Fuel Profit Report", to: paths.reportsFuelProfitReport },
      { label: "Tank vs Pump", to: paths.reportsTankVsPump },
      { label: "Shift Sheet Report", to: paths.reportsShiftSheetReport },
      { label: "Fuel Purchases", to: paths.reportsFuelPurchases },
    ],
  },
  { label: "Settings", to: paths.settings, icon: IconSettings },
];

function SideGroup({ group, pathname }: { group: NavGroupItem; pathname: string }) {
  const Icon = group.icon;
  const hasActiveChild = group.children.some(
    (child) => pathname === child.to || pathname.startsWith(child.to + "/")
  );

  const [opened, setOpened] = useState(hasActiveChild);

  return (
    <>
      <UnstyledButton
        onClick={() => setOpened((o) => !o)}
        className="nav-item"
        style={{
          width: "100%",
          borderRadius: 4,
          padding: "10px 14px",
          marginBottom: 4,
          color: "var(--sidebar-text)",
          background: "transparent",
          borderLeft: "4px solid transparent",
          transition: "all 150ms ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Group gap={12} wrap="nowrap">
          <Icon size={20} stroke={1.5} style={{ color: "var(--sidebar-text-dim)" }} />
          <Text size="sm" fw={400}>
            {group.label}
          </Text>
        </Group>
        {opened ? (
          <IconChevronDown size={14} style={{ color: "var(--sidebar-text-dim)" }} />
        ) : (
          <IconChevronRight size={14} style={{ color: "var(--sidebar-text-dim)" }} />
        )}
      </UnstyledButton>

      <Collapse in={opened}>
        <Box pl={32} pb={8}>
          {group.children.map((child) => {
            const active = pathname === child.to || pathname.startsWith(child.to + "/");
            return (
              <UnstyledButton
                key={child.to}
                component={RRNavLink}
                to={child.to}
                className={active ? "nav-item-active" : "nav-item"}
                style={{
                  width: "100%",
                  borderRadius: 4,
                  padding: "8px 12px",
                  marginBottom: 2,
                  color: active ? "var(--sidebar-text-active)" : "var(--sidebar-text-dim)",
                  background: active ? "var(--sidebar-active-bg)" : "transparent",
                  transition: "all 150ms ease",
                  display: "block",
                }}
              >
                <Text size="sm" fw={active ? 500 : 400}>
                  {child.label}
                </Text>
              </UnstyledButton>
            );
          })}
        </Box>
      </Collapse>
    </>
  );
}

function SideItem({ item, active }: { item: NavLinkItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <UnstyledButton
      component={RRNavLink}
      to={item.to}
      className={active ? "nav-item-active" : "nav-item"}
      style={{
        width: "100%",
        borderRadius: 4,
        padding: "10px 14px",
        marginBottom: 4,
        color: active ? "var(--sidebar-text-active)" : "var(--sidebar-text)",
        background: active ? "var(--sidebar-active-bg)" : "transparent",
        borderLeft: active ? "4px solid var(--brand-green)" : "4px solid transparent",
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
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

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
              borderRadius: 10,
              background: "var(--brand-green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconDroplet size={20} stroke={1.5} color="#fff" />
          </Box>
          <div>
            <Text c="var(--sidebar-text-active)" fw={700} size="sm" lh={1.2}>
              MAESTRO
            </Text>
            <Text size="xs" c="var(--sidebar-text-dim)" lh={1.2}>
              Fuel System
            </Text>
          </div>
        </Group>
      </Box>

      {/* Section label */}
      <Box px="md" pt="sm" pb={8}>
        <Text size="xs" fw={700} c="var(--sidebar-text-dim)" tt="uppercase" lh={1} style={{ letterSpacing: 1.2 }}>
          Menu
        </Text>
      </Box>

      {/* Navigation */}
      <ScrollArea style={{ flex: 1 }} px="xs" scrollbarSize={4}>
        <Box py={4}>
          {items.map((item) => {
            if ("children" in item) {
              return <SideGroup key={item.label} group={item} pathname={pathname} />;
            }
            return (
              <SideItem
                key={item.to}
                item={item as NavLinkItem}
                active={pathname === item.to || pathname.startsWith(item.to + "/")}
              />
            );
          })}
        </Box>
      </ScrollArea>

      {/* Footer Controls */}
      <Box p="sm" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        {/* Theme Toggle */}
        <UnstyledButton
          onClick={() => toggleColorScheme()}
          className="theme-btn"
          style={{
            width: "100%",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 8,
            color: "var(--sidebar-text-dim)",
            background: "var(--sidebar-btn-bg)",
            border: "1px solid var(--sidebar-btn-border)",
            transition: "all 150ms ease",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Group gap={12} wrap="nowrap">
            {colorScheme === 'dark' ? <IconSun size={18} stroke={1.5} /> : <IconMoon size={18} stroke={1.5} />}
            <Text size="sm" fw={400}>
              {colorScheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Text>
          </Group>
        </UnstyledButton>

        {/* Logout — subtle ghost button */}
        <UnstyledButton
          onClick={handleLogout}
          className="logout-btn"
          style={{
            width: "100%",
            borderRadius: 8,
            padding: "10px 14px",
            color: "var(--sidebar-text-dim)",
            background: "var(--sidebar-btn-bg)",
            border: "1px solid var(--sidebar-btn-border)",
            transition: "all 150ms ease",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Group gap={12} wrap="nowrap">
            <IconLogout size={18} stroke={1.5} />
            <Text size="sm" fw={400}>
              Logout
            </Text>
          </Group>
        </UnstyledButton>
      </Box>
    </Box>
  );
}
