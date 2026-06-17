import { useState } from "react";
import { Box, Grid, CircularProgress } from "@mui/material";
import { SecurityOutlined } from "@mui/icons-material";
import { ChartCard } from "pages/dashboards/overview/ChartCard";
import { SpecializedDashboardLayout } from "./SpecializedDashboardLayout";

import { CveBarChart } from "pages/dashboards/overview/Charts/CveBarChart";
import { CveTreemap } from "pages/dashboards/overview/Charts/CveTreemap";
import { CveHistoryChart } from "pages/dashboards/overview/Charts/CveHistoryChart";
import TreeGraphCveCritiques from "pages/dashboards/overview/Charts/Treegraph";

import { formattedApps } from "pages/indicateurs/main-indicator/formatted-mod-and-app";

import {
    getApplications1,
    getIndicateurQualiteByApplicationByDate,
    getApplications2,
    listerApplicationsMeteo,
    getApplications,
    listerApplicationA11y,
    getIndicateurSecuriteByApplication,
    getMaturiteCloud,
    getCveCriticalMonthly,
    type CveCriticalMonthlyView
} from "todos-api/client.gen";
import { useQueryDashboard } from "hooks/useQueryDashboard";

const SecuriteDashboard = () => {
    const [cveMonthlyData, setCveMonthlyData] = useState<CveCriticalMonthlyView[]>([]);
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
                maturiteCloudApps,
                cveCriticalMonthly
            ] = await Promise.all([
                getApplications1(),
                getIndicateurQualiteByApplicationByDate(),
                getApplications2(),
                listerApplicationsMeteo(),
                getApplications(),
                listerApplicationA11y(),
                getIndicateurSecuriteByApplication(),
                getMaturiteCloud(),
                getCveCriticalMonthly()
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
            setCveMonthlyData(cveCriticalMonthly);
            return formattedApplications;
        } catch (error) {
            console.error("Erreur chargement données sécurité:", error);
        }
    };

    const { data, isLoading, filteredData } = useQueryDashboard({
        queryKey: ["SecuriteDashboard"],
        fetchData
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
            title="Sécurité"
            subtitle="Analyse des vulnérabilités et indicateurs sécurité"
            icon={<SecurityOutlined fontSize="large" />}
            data={data}
        >
            <Box mb={4}>
                {/* Bar Chart et Treemap côte à côte */}
                <Grid container spacing={3} mb={3}>
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <ChartCard>
                            <CveBarChart data={filteredData} topN={15} />
                        </ChartCard>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <ChartCard>
                            <CveTreemap data={filteredData} topN={30} />
                        </ChartCard>
                    </Grid>
                </Grid>

                {/* Historique CVE */}
                <Box mb={3}>
                    <ChartCard>
                        <CveHistoryChart data={filteredData} monthlyData={cveMonthlyData} maxApps={10} />
                    </ChartCard>
                </Box>

                {/* TreeGraph CVE */}
                <ChartCard>
                    <TreeGraphCveCritiques data={filteredData} maxAppsPerSndi={50} height="600px" />
                </ChartCard>
            </Box>
        </SpecializedDashboardLayout>
    );
};

export default SecuriteDashboard;
