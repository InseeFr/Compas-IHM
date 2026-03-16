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

interface DashboardLinkProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    to: string;
    color?: string;
}

const DashboardLinkCard = ({ title, description, icon, to, color }: DashboardLinkProps) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    return (
        <Card
            sx={{
                textDecoration: "none",
                height: "100%",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: `linear-gradient(90deg, ${color ?? theme.palette.primary.main}, ${color ?? theme.palette.primary.dark})`,
                    transition: "transform 0.3s ease"
                },
                background: isDark
                    ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
                    : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
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
                    flexDirection: "column",
                    position: "relative",
                    zIndex: 1
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
                            background: `linear-gradient(135deg, ${color}22, ${color}44)`,
                            color: color ?? theme.palette.primary.main,
                            boxShadow: `0 4px 12px ${color}33`,
                            transition: "transform 0.3s ease",
                            "&:hover": {
                                transform: "scale(1.05)"
                            }
                        }}
                    >
                        {icon}
                    </Box>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: color ? `${color}22` : theme.palette.primary.main + "22",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: color ?? theme.palette.primary.main,
                            opacity: 0.8
                        }}
                    >
                        <span style={{ fontSize: "18px" }}>→</span>
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
                        borderTop: `1px solid ${theme.palette.divider}`,
                        background: `linear-gradient(to right, ${color}11, transparent)`,
                        borderRadius: "0 0 12px 12px"
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 600,
                            color: color ?? theme.palette.primary.main,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}
                    >
                        Explorer les détails
                        <Box
                            sx={{
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                background: color ? `${color}33` : theme.palette.primary.main + "33",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <span style={{ fontSize: "12px" }}>→</span>
                        </Box>
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export const SpecializedDashboardLinks = () => {
    const theme = useTheme();

    const links = [
        {
            title: "Qualité",
            description: "Analyse détaillée des indicateurs qualité",
            icon: <CheckCircleOutlineOutlined fontSize="large" />,
            to: "/dashboard/qualite",
            color: theme.palette.success.main
        },
        {
            title: "Sécurité",
            description: "Suivi des vulnérabilités CVE, analyses et tendances",
            icon: <SecurityOutlined fontSize="large" />,
            to: "/dashboard/securite",
            color: theme.palette.error.main
        },
        {
            title: "Météo",
            description: "Indicateurs météo et ressentis des applications",
            icon: <CloudQueueOutlined fontSize="large" />,
            to: "/dashboard/meteo",
            color: theme.palette.info.main
        },
        {
            title: "Green IT",
            description: "Indicateurs écologiques et consommation énergétique",
            icon: <Co2Outlined fontSize="large" />,
            to: "/dashboard/greenit",
            color: theme.palette.success.dark
        },
        {
            title: "Accessibilité",
            description: "Conformité et indicateurs d'accessibilité",
            icon: <AccessibilityOutlined fontSize="large" />,
            to: "/dashboard/accessibilite",
            color: theme.palette.info.dark
        }
    ];

    return (
        <ChartCard>
            <Box
                sx={{
                    p: { xs: 3, md: 5 },
                    borderRadius: "16px"
                }}
            >
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
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            borderRadius: "3px"
                        }
                    }}
                >
                    Explorer par thème
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                        textAlign: "center",
                        mb: 5,
                        maxWidth: "600px",
                        mx: "auto"
                    }}
                ></Typography>
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
