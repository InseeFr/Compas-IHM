import { Box, Grid, CircularProgress } from "@mui/material";
import { Co2Outlined } from "@mui/icons-material";
import { ChartCard } from "pages/dashboards/overview/ChartCard";
import { SpecializedDashboardLayout } from "./SpecializedDashboardLayout";

import {
    GreenITProdHorsProdGroupedChart,
    GreenITDomainProdChart
} from "../overview/Charts/GreenITCharts";
import { fetchData } from "utils/data-fetch-dashboard";
import { useQueryDashboard } from "hooks/useQueryDashboard";

const GreenITDashboard = () => {
    const { data, isLoading, filteredData } = useQueryDashboard({
        queryKey: ["GreenItDashboard"],
        fetchData: fetchData
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress color="success" />
            </Box>
        );
    }

    return (
        <SpecializedDashboardLayout
            title="Green IT"
            subtitle="Indicateurs écologiques et consommation"
            icon={<Co2Outlined fontSize="large" />}
            data={data}
        >
            <Box display="flex" flexDirection="column" gap={4}>
                {/* ── Prod vs Hors-Prod (2 colonnes) ── */}
                <Box>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, lg: 5 }}>
                            <ChartCard>
                                <GreenITProdHorsProdGroupedChart data={filteredData} />
                            </ChartCard>
                        </Grid>
                        <Grid size={{ xs: 12, lg: 7 }}>
                            <ChartCard>
                                <GreenITDomainProdChart data={filteredData} />
                            </ChartCard>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </SpecializedDashboardLayout>
    );
};

export default GreenITDashboard;
