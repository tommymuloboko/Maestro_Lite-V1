import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Box, Paper, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import LoginForm from "../components/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { paths } from "@/routes/paths";
import { IconGasStation } from "@tabler/icons-react";

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={paths.dashboard} replace />;
  }

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values);
      notifications.show({
        title: "Welcome back!",
        message: "Logged in successfully",
        color: "green",
      });
      navigate(paths.dashboard);
    } catch {
      notifications.show({
        title: "Login failed",
        message: "Invalid username or password. Try admin / admin123",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "linear-gradient(180deg, #050d09 0%, #07130e 45%, #0a1f15 100%)",
      }}
    >
      <Paper
        radius="xl"
        shadow="xl"
        style={{
          width: "min(980px, 95vw)",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.06)",
          background: "transparent",
        }}
      >
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            minHeight: 540,
          }}
        >
          {/* Left — glossy transparent login form */}
          <Box
            style={{
              padding: "40px 36px",
              background: "rgba(255, 255, 255, 0.06)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRight: "1px solid rgba(255, 255, 255, 0.06)",
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <LoginForm onSubmit={handleLogin} loading={loading} />
          </Box>

          {/* Right — brand panel with fuel icon */}
          <Box
            visibleFrom="sm"
            style={{
              padding: 48,
              background:
                "linear-gradient(160deg, #166534 0%, #14532d 50%, #0d3320 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative glow behind icon */}
            <Box
              style={{
                position: "absolute",
                width: 280,
                height: 280,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(249,115,22,0.15), transparent 70%)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -55%)",
                pointerEvents: "none",
              }}
            />

            {/* Fuel icon */}
            <Box
              style={{
                width: 88,
                height: 88,
                borderRadius: 20,
                background: "rgba(249, 115, 22, 0.15)",
                border: "1px solid rgba(249, 115, 22, 0.25)",
                display: "grid",
                placeItems: "center",
                marginBottom: 28,
                position: "relative",
              }}
            >
              <IconGasStation size={44} stroke={1.3} color="#f97316" />
            </Box>

            {/* Brand text */}
            <Text
              fw={800}
              size="xl"
              c="white"
              lh={1.3}
              style={{ letterSpacing: -0.3, position: "relative" }}
            >
              Maestro Lite
            </Text>
            <Text
              fw={600}
              size="md"
              c="rgba(255,255,255,0.75)"
              mt={4}
              style={{ position: "relative" }}
            >
              Fuel System
            </Text>

            <Box
              mt={32}
              px="lg"
              py={8}
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)",
                position: "relative",
              }}
            >
              <Text size="xs" c="rgba(255,255,255,0.5)">
                Backoffice v1.0
              </Text>
            </Box>

            {/* Footer */}
            <Box
              style={{
                position: "absolute",
                left: 36,
                right: 36,
                bottom: 24,
              }}
            >
              <Text size="xs" c="rgba(255,255,255,0.4)" ta="center">
                © {new Date().getFullYear()} Maestro Systems
              </Text>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
