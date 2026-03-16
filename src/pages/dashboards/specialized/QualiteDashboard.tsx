import { Box, Grid, CircularProgress } from "@mui/material";
import { CheckCircleOutlineOutlined } from "@mui/icons-material";
import { ChartCard } from "pages/dashboards/overview/ChartCard";
import { SpecializedDashboardLayout } from "./SpecializedDashboardLayout";
import {
    QualiteCoverageChart,
    QualiteDetteChart,
    QualiteRadarChart
} from "../overview/Charts/QualiteCharts";
import { fetchData } from "utils/data-fetch-dashboard";
import { useQueryDashboard } from "hooks/useQueryDashboard";

const QualiteDashboard = () => {
    const { data, isLoading, filteredData } = useQueryDashboard({
        queryKey: ["QualiteDashboard"],
        fetchData: fetchData
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <SpecializedDashboardLayout
            title="Qualité"
            subtitle="Analyse détaillée des indicateurs qualité"
            icon={<CheckCircleOutlineOutlined fontSize="large" />}
            data={data}
        >
            <Box>
                <Grid container spacing={3}>
                    {/* Ligne 1 — deux charts complémentaires côte à côte */}
                    <Grid size={{ xs: 12, lg: 5 }}>
                        <ChartCard sx={{ height: "100%" }}>
                            <QualiteCoverageChart data={filteredData} />
                        </ChartCard>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 7 }}>
                        <ChartCard sx={{ height: "100%" }}>
                            <QualiteRadarChart data={filteredData} />
                        </ChartCard>
                    </Grid>

                    {/* Ligne 2 — scatter en pleine largeur, plus de place pour les points */}
                    <Grid size={{ xs: 12 }}>
                        <ChartCard>
                            <QualiteDetteChart data={filteredData} />
                        </ChartCard>
                    </Grid>
                </Grid>
            </Box>
        </SpecializedDashboardLayout>
    );
};

export default QualiteDashboard;
