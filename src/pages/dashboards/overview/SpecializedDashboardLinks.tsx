import { Box, Grid, Card, CardContent, Typography, useTheme } from "@mui/material";
import { Link } from "@tanstack/react-router";
import {
    SecurityOutlined,
    CheckCircleOutlineOutlined,
    CloudQueueOutlined,
    Co2Outlined,
    AccessibilityOutlined
} from "@mui/icons-material";
import { ChartCard } from "./ChartCard";

interface ColorToken {
    text: string;
    iconBackground: string;
}

interface DashboardLinkProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    to: string;
    colorToken: ColorToken;
}

const DashboardLinkCard = ({ title, description, icon, to, colorToken }: DashboardLinkProps) => {
    const theme = useTheme();

    return (
        <Card
            sx={{
                textDecoration: "none",
                height: "100%",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[6]
                },
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    backgroundColor: colorToken.text
                },
                background: theme.palette.background.paper,
                borderRadius: "12px"
            }}
            component={Link}
            to={to}
            preload="intent"
        >
            <CardContent
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3
                    }}
                >
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: colorToken.iconBackground,
                            color: colorToken.text,
                            transition: "transform 0.2s ease",
                            "&:hover": {
                                transform: "scale(1.05)"
                            }
                        }}
                    >
                        {icon}
                    </Box>
                    <Box
                        aria-hidden="true"
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            backgroundColor: colorToken.iconBackground,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: colorToken.text,
                            fontSize: "18px"
                        }}
                    >
                        →
                    </Box>
                </Box>
                <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                >
                    {title}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ flexGrow: 1, mb: 2, lineHeight: 1.5 }}
                >
                    {description}
                </Typography>
                <Box
                    sx={{
                        mt: "auto",
                        pt: 2,
                        borderTop: `1px solid ${theme.palette.divider}`
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 600,
                            color: colorToken.text,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}
                    >
                        Explorer les détails
                        <Box
                            aria-hidden="true"
                            sx={{
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                backgroundColor: colorToken.iconBackground,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: colorToken.text,
                                fontSize: "12px"
                            }}
                        >
                            →
                        </Box>
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export const SpecializedDashboardLinks = () => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    const links = [
        {
            title: "Qualité",
            description: "Analyse détaillée des indicateurs qualité",
            icon: <CheckCircleOutlineOutlined fontSize="large" />,
            to: "/dashboard/qualite",
            colorToken: isDarkMode
                ? { text: "#e1bee7", iconBackground: "#3a1a4a" }
                : { text: "#5c1085", iconBackground: "#f3e5f5" }
        },
        {
            title: "Sécurité",
            description: "Suivi des vulnérabilités CVE, analyses et tendances",
            icon: <SecurityOutlined fontSize="large" />,
            to: "/dashboard/securite",
            colorToken: isDarkMode
                ? { text: "#ffcdd2", iconBackground: "#4e1c1c" }
                : { text: "#b71c1c", iconBackground: "#ffebee" }
        },
        {
            title: "Météo",
            description: "Indicateurs météo et ressentis des applications",
            icon: <CloudQueueOutlined fontSize="large" />,
            to: "/dashboard/meteo",
            colorToken: isDarkMode
                ? { text: "#ffe0b2", iconBackground: "#4e2000" }
                : { text: "#bf360c", iconBackground: "#fbe9e7" }
        },
        {
            title: "Green IT",
            description: "Indicateurs écologiques et consommation énergétique",
            icon: <Co2Outlined fontSize="large" />,
            to: "/dashboard/greenit",
            colorToken: isDarkMode
                ? { text: "#c8e6c9", iconBackground: "#1a3a1a" }
                : { text: "#1b5e20", iconBackground: "#e8f5e9" }
        },
        {
            title: "Accessibilité",
            description: "Conformité et indicateurs d'accessibilité",
            icon: <AccessibilityOutlined fontSize="large" />,
            to: "/dashboard/accessibilite",
            colorToken: isDarkMode
                ? { text: "#bbdefb", iconBackground: "#0d2a5e" }
                : { text: "#0d47a1", iconBackground: "#e3f2fd" }
        }
    ];

    return (
        <ChartCard>
            <Box sx={{ p: { xs: 3, md: 5 }, borderRadius: "16px" }}>
                <Typography
                    variant="h4"
                    component="h2"
                    gutterBottom
                    sx={{
                        mb: 4,
                        fontWeight: 700,
                        textAlign: "center",
                        position: "relative",
                        display: "inline-block",
                        "&::after": {
                            content: '""',
                            position: "absolute",
                            bottom: -4,
                            left: 0,
                            right: 0,
                            height: "3px",
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: "3px"
                        }
                    }}
                >
                    Explorer par thème
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ textAlign: "center", mb: 5, maxWidth: "600px", mx: "auto" }}
                />
                <Grid container spacing={4}>
                    {links.map((link, index) => (
                        <Grid key={`${link.title}-${index}`} size={{ xs: 12, sm: 6, md: 4 }}>
                            <DashboardLinkCard {...link} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </ChartCard>
    );
};
