import { Box, Grid, CircularProgress } from "@mui/material";
import { AccessibilityOutlined } from "@mui/icons-material";
import { ChartCard } from "pages/dashboards/overview/ChartCard";
import { SpecializedDashboardLayout } from "./SpecializedDashboardLayout";

import {
    AccessibiliteGaugeChart,
    AccessibiliteAuditedAppsChart
} from "../overview/Charts/AccessibiliteCharts";

import { formattedApps } from "pages/indicateurs/main-indicator/formatted-mod-and-app";

import {
    getApplications1,
    getIndicateurQualiteByApplication,
    getApplications2,
    listerApplicationsMeteo,
    getApplications,
    listerApplicationA11y,
    getIndicateurSecuriteByApplication,
    getMaturiteCloud
} from "todos-api/client.gen";
import { useQueryDashboard } from "hooks/useQueryDashboard";

const AccessibiliteDashboard = () => {
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
                getIndicateurQualiteByApplication(),
                getApplications2(),
                listerApplicationsMeteo(),
                getApplications(),
                listerApplicationA11y(),
                getIndicateurSecuriteByApplication(),
                getMaturiteCloud()
            ]);

            return formattedApps({
                apps,
                qualiteAppData,
                devopsAppData,
                meteoData,
                consoAppData,
                a11yDataApps,
                securiteApps,
                maturiteCloudApps
            });
        } catch (error) {
            console.error("Erreur chargement données accessibilité:", error);
        }
    };

    const { data, isLoading, filteredData } = useQueryDashboard({
        queryKey: ["A11yDashboard"],
        fetchData: fetchData
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <SpecializedDashboardLayout
            title="Accessibilité"
            subtitle="Indicateurs d'accessibilité et conformité"
            icon={<AccessibilityOutlined fontSize="large" />}
            data={data}
        >
            <Box display="flex" flexDirection="column" gap={4}>
                <Grid container spacing={3} alignItems="flex-start">
                    {/* Gauge couverture */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <ChartCard>
                            <AccessibiliteGaugeChart data={filteredData} />
                        </ChartCard>
                    </Grid>

                    {/* Détail apps auditées */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <ChartCard>
                            <AccessibiliteAuditedAppsChart data={filteredData} />
                        </ChartCard>
                    </Grid>
                </Grid>
            </Box>
        </SpecializedDashboardLayout>
    );
};

export default AccessibiliteDashboard;
