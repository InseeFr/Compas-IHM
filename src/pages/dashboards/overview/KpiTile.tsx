import { Box, Card, Typography, useTheme } from "@mui/material";
import type { ReactNode } from "react";

interface KpiTileProps {
    label: string;
    value: string | number;
    helper?: string;
    accent: "success" | "warning" | "error" | "info";
    icon: ReactNode;
}

export function KpiTile({ label, value, helper, accent, icon }: Readonly<KpiTileProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const accentColors = {
        success: {
            main: theme.palette.success.main,
            light: theme.palette.success.light,
            gradient: isDark
                ? "linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.05) 100%)"
                : "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.02) 100%)"
        },
        warning: {
            main: theme.palette.warning.main,
            light: theme.palette.warning.light,
            gradient: isDark
                ? "linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 152, 0, 0.05) 100%)"
                : "linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.02) 100%)"
        },
        error: {
            main: theme.palette.error.main,
            light: theme.palette.error.light,
            gradient: isDark
                ? "linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(244, 67, 54, 0.05) 100%)"
                : "linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.02) 100%)"
        },
        info: {
            main: theme.palette.info.main,
            light: theme.palette.info.light,
            gradient: isDark
                ? "linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.05) 100%)"
                : "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.02) 100%)"
        }
    };

    const color = accentColors[accent];

    return (
        <Card
            sx={{
                p: 3,
                borderRadius: 3,
                background: isDark
                    ? "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)"
                    : "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(31,38,135,0.1)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.3)"}`,
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: isDark ? `0 8px 32px ${color.main}33` : `0 8px 32px ${color.main}22`,
                    "& .kpi-icon": {
                        transform: "scale(1.1) rotate(5deg)",
                        boxShadow: `0 4px 16px ${color.main}44`
                    }
                },
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${color.main}, ${color.light})`,
                    opacity: 0.8
                }
            }}
        >
            <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                <Box flex={1}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                        mb={1}
                        sx={{ fontSize: "0.85rem" }}
                    >
                        {label}
                    </Typography>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                        color="text.primary"
                        mb={0.5}
                        sx={{
                            letterSpacing: -1,
                            fontSize: "2rem"
                        }}
                    >
                        {value}
                    </Typography>
                    {helper && (
                        <Typography variant="caption" color="text.secondary">
                            {helper}
                        </Typography>
                    )}
                </Box>
                <Box
                    className="kpi-icon"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 56,
                        height: 56,
                        borderRadius: 2.5,
                        background: color.gradient,
                        color: color.main,
                        fontSize: 28,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: `0 2px 8px ${color.main}22`
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </Card>
    );
}
