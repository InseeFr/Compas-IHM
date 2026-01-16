import { Box, Card, Typography, useTheme } from "@mui/material";
import type { ReactNode } from "react";

interface ChartCardProps {
    title?: string;
    children: ReactNode;
    minHeight?: number | string;
}

export function ChartCard({ title, children, minHeight = 320 }: Readonly<ChartCardProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    return (
        <Card
            sx={{
                borderRadius: 3,
                background: isDark
                    ? "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)"
                    : "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                boxShadow: isDark
                    ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"
                    : "0 8px 32px rgba(31,38,135,0.15), inset 0 1px 0 rgba(255,255,255,0.5)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.3)"}`,
                overflow: "hidden",
                position: "relative",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                    boxShadow: isDark
                        ? "0 12px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)"
                        : "0 12px 48px rgba(31,38,135,0.2), inset 0 1px 0 rgba(255,255,255,0.6)",
                    transform: "translateY(-2px)"
                },
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    opacity: 0.8
                }
            }}
        >
            <Box
                sx={{
                    p: 3,
                    minHeight
                }}
            >
                {title && (
                    <Typography
                        variant="h6"
                        fontWeight={600}
                        color="text.primary"
                        mb={2}
                        sx={{
                            letterSpacing: -0.3,
                            fontSize: "1.1rem"
                        }}
                    >
                        {title}
                    </Typography>
                )}
                {children}
            </Box>
        </Card>
    );
}
