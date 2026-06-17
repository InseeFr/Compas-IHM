import { Box, Grid, CircularProgress } from "@mui/material";
import { CloudQueueOutlined } from "@mui/icons-material";
import { ChartCard } from "pages/dashboards/overview/ChartCard";
import { SpecializedDashboardLayout } from "./SpecializedDashboardLayout";
import { MeteoDistributionChart, MeteoEvolutionChart } from "../overview/Charts/MeteoCharts";

import { formattedApps } from "pages/indicateurs/main-indicator/formatted-mod-and-app";

import {
    getApplications1,
    getIndicateurQualiteByApplicationByDate,
    getApplications2,
    listerApplicationsMeteo,
    getApplications,
    listerApplicationA11y,
    getIndicateurSecuriteByApplication,
    getMaturiteCloud
} from "todos-api/client.gen";
import { useQueryDashboard } from "hooks/useQueryDashboard";

const MeteoDashboard = () => {
    const fetchData = async () => {
        try {
            const [
                apps,
                qualiteAppData,
                devopsAppData,
                meteoData,
                consoAppData,
                a11yDataApps,
                securiteApps,
                maturiteCloudApps
            ] = await Promise.all([
                getApplications1(),
                getIndicateurQualiteByApplicationByDate(),
                getApplications2(),
                listerApplicationsMeteo(),
                getApplications(),
                listerApplicationA11y(),
                getIndicateurSecuriteByApplication(),
                getMaturiteCloud()
            ]);

            const formattedApplications = formattedApps({
                apps,
                qualiteAppData,
                devopsAppData,
                meteoData,
                consoAppData,
                a11yDataApps,
                securiteApps,
                maturiteCloudApps
            });
            return formattedApplications;
        } catch (err) {
            console.log("Erreur lors de l'appel Meteo dashboard", err);
        }
    };
    const { data, isLoading, filteredData } = useQueryDashboard({
        queryKey: ["MeteoDashboard"],
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
            title="Météo"
            subtitle="Indicateurs météo et ressentis des applications"
            icon={<CloudQueueOutlined fontSize="large" />}
            data={data}
        >
            <Box>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <ChartCard>
                            <MeteoDistributionChart data={filteredData} />
                        </ChartCard>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 6 }}>
                        <ChartCard>
                            <MeteoEvolutionChart />
                        </ChartCard>
                    </Grid>
                </Grid>
            </Box>
        </SpecializedDashboardLayout>
    );
};

export default MeteoDashboard;
