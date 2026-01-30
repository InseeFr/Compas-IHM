import { Box, Typography, useTheme } from "@mui/material";
import type { ReactNode } from "react";

interface SectionHeaderProps {
    icon: ReactNode;
    title: string;
    subtitle?: string;
}

export function SectionHeader({ icon, title, subtitle }: Readonly<SectionHeaderProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 3,
                pb: 2,
                borderBottom: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                position: "relative",
                "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -2,
                    left: 0,
                    width: 60,
                    height: 2,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, transparent)`
                }
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}22, ${theme.palette.primary.dark}44)`,
                    color: theme.palette.primary.main,
                    fontSize: 28
                }}
            >
                {icon}
            </Box>
            <Box>
                <Typography
                    variant="h5"
                    fontWeight={700}
                    color="text.primary"
                    sx={{
                        letterSpacing: -0.5
                    }}
                >
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}
