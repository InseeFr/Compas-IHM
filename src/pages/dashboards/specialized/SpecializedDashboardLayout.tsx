import { Box, useTheme, Typography } from "@mui/material";
import type { ReactNode } from "react";
import Ariane from "components/Ariane";
import { Filters } from "components/filtersLayout/FiltersForms";
import type { GlobalIndicator } from "models/indicateurs";
import { useFilterContext } from "store/filterContext";

interface SpecializedDashboardLayoutProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    children: ReactNode;
    data: GlobalIndicator[];
}

export const SpecializedDashboardLayout = ({
    title,
    subtitle,
    icon,
    children,
    data
}: SpecializedDashboardLayoutProps) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const { state, dispatch } = useFilterContext();

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: isDark
                    ? "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)"
                    : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                px: { xs: 2, md: 4 },
                py: 4,
                paddingTop: 10
            }}
        >
            <Ariane
                items={[
                    { nav: "Vue d'ensemble", link: "/dashboard/overview" },
                    { nav: title, link: "" }
                ]}
            />

            <Filters data={data} state={state} dispatch={dispatch} />
            <Box sx={{ mt: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box sx={{ mr: 2, color: "primary.main" }}>{icon}</Box>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                            {title}
                        </Typography>
                        <Typography variant="subtitle1" component="h2" color="text.secondary">
                            {subtitle}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ mt: 4 }}>{children}</Box>
            </Box>
        </Box>
    );
};
