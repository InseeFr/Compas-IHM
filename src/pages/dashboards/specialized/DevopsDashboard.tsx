import { Box, Grid, CircularProgress } from "@mui/material";
import { BuildOutlined } from "@mui/icons-material";
import { ChartCard } from "pages/dashboards/overview/ChartCard";
import { SpecializedDashboardLayout } from "./SpecializedDashboardLayout";
// Charts
import {
    DevopsMEPChart,
    DevopsDeploymentChart,
    DevopsContributorChart,
    DevopsRadarChart
} from "../overview/Charts/DevopsCharts";
import { fetchData } from "utils/data-fetch-dashboard";
import { useQueryDashboard } from "hooks/useQueryDashboard";

const DevopsDashboard = () => {
    const { data, isLoading, filteredData } = useQueryDashboard({
        queryKey: ["DevopsDashboard"],
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
            title="DevOps"
            subtitle="Dette technique, MEP et indicateurs DevOps"
            icon={<BuildOutlined fontSize="large" />}
            data={data}
        >
            <Box>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <ChartCard>
                            <DevopsMEPChart data={filteredData} />
                        </ChartCard>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <ChartCard>
                            <DevopsContributorChart data={filteredData} />
                        </ChartCard>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <ChartCard>
                            <DevopsRadarChart data={filteredData} />
                        </ChartCard>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <ChartCard>
                            <DevopsDeploymentChart data={filteredData} />
                        </ChartCard>
                    </Grid>
                </Grid>
            </Box>
        </SpecializedDashboardLayout>
    );
};

export default DevopsDashboard;
