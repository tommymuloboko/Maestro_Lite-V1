import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Box, Paper, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX, IconGasStation } from "@tabler/icons-react";
import LoginForm from "../components/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { paths } from "@/routes/paths";

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={paths.dashboard} replace />;
  }

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);

    // Show loading notification
    const loadingId = notifications.show({
      id: 'login-loading',
      title: "Signing in...",
      message: "Authenticating with the server",
      color: "blue",
      loading: true,
      autoClose: false,
      withCloseButton: false,
    });

    try {
      await login(values);

      // Update notification to success
      notifications.update({
        id: loadingId,
        title: "Welcome back!",
        message: "You have been signed in successfully",
        color: "green",
        icon: <IconCheck size={18} />,
        loading: false,
        autoClose: 3000,
        withCloseButton: true,
      });

      navigate(paths.dashboard);
    } catch (error) {
      // Update notification to error
      const errorMessage = error instanceof Error
        ? error.message
        : "Invalid username or password";

      notifications.update({
        id: loadingId,
        title: "Login failed",
        message: errorMessage,
        color: "red",
        icon: <IconX size={18} />,
        loading: false,
        autoClose: 5000,
        withCloseButton: true,
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
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Full-page background image */}
      <Box
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/Gas-dispensers.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(6px) brightness(0.2)",
          transform: "scale(1.05)",
        }}
      />
      <Paper
        radius="xl"
        shadow="xl"
        style={{
          width: "min(980px, 95vw)",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.06)",
          background: "transparent",
          position: "relative",
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

          {/* Right — brand panel with gas station photo */}
          <Box
            visibleFrom="sm"
            style={{
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            {/* Background image */}
            <Box
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url('/Gas-dispensers.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            {/* Dark overlay for readability */}
            <Box
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.65) 100%)",
              }}
            />

            {/* Fuel icon */}
            <Box
              style={{
                width: 88,
                height: 88,
                borderRadius: 20,
                background: "rgba(249, 115, 22, 0.2)",
                border: "1px solid rgba(249, 115, 22, 0.35)",
                backdropFilter: "blur(12px)",
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
              style={{ letterSpacing: -0.3, position: "relative", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
            >
              Maestro Lite
            </Text>
            <Text
              fw={600}
              size="md"
              c="rgba(255,255,255,0.85)"
              mt={4}
              style={{ position: "relative", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
            >
              Fuel System
            </Text>

            <Box
              mt={32}
              px="lg"
              py={8}
              style={{
                background: "rgba(0,0,0,0.3)",
                backdropFilter: "blur(8px)",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                position: "relative",
              }}
            >
              <Text size="xs" c="rgba(255,255,255,0.7)">
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
              <Text size="xs" c="rgba(255,255,255,0.5)" ta="center" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                © {new Date().getFullYear()} Maestro Systems
              </Text>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
