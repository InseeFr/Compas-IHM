/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useEffect } from "react";
import { Box, Grid, CircularProgress, Divider, useTheme } from "@mui/material";
import {
    BuildCircleOutlined,
    CloudOutlined,
    SecurityOutlined,
    UpdateOutlined,
    DashboardOutlined,
    BugReportOutlined,
    InsightsOutlined
} from "@mui/icons-material";

// Components
import { Filters } from "components/Filters";
import { KpiTile } from "./KpiTile";
import { ChartCard } from "./ChartCard";
import { GenericDonut } from "./Charts/GenericDonut";
import TreeGraphCveCritiques from "./Charts/Treegraph";
import { CveBarChart } from "./Charts/CveBarChart";
import { CveTreemap } from "./Charts/CveTreemap";
import { CveHistoryChart } from "./Charts/CveHistoryChart";
import { CorrelationChart } from "./Charts/ScatterChart";
import { SectionHeader } from "./SectionHeader";

// Utils
import {
    calculateDetteCumulee,
    calculateMaturiteStrongPct,
    calculateTotalCriticalCve,
    countAppsSinceLastMep
} from "../../../utils/graphs/calculations";

import {
    transformQualiteData,
    transformMeteoData,
    transformMepData,
    transformDetteData
} from "../../../utils/graphs/donutTransformers";

import type { GlobalIndicator } from "models/indicateurs";
import { useFilterContext } from "store/filterContext";
import {
    getIndicateurQualiteByApplication,
    getApplications2,
    listerApplicationsMeteo,
    getApplications,
    listerApplicationA11y,
    getIndicateurSecuriteByApplication,
    getMaturiteCloud,
    getApplications1,
    getCveCriticalMonthly
} from "todos-api/client.gen";
import { formattedApps } from "components/indicateurs/main-indicator/formatted-mod-and-app";
import { applyDevFilters } from "utils/filters-functions";

const DashboardCharts = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const [globalInd, setGlobalInd] = useState<GlobalIndicator[]>([]);
    const [cveMonthlyData, setCveMonthlyData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { state, dispatch } = useFilterContext();

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
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
                    getIndicateurQualiteByApplication(),
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

                setGlobalInd(formattedApplications);
                setCveMonthlyData(cveCriticalMonthly);
            } catch (error) {
                console.error("Erreur chargement données:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Filtrage des données
    const filteredData = useMemo(
        () => globalInd.filter(item => applyDevFilters(item, state)),
        [globalInd, state]
    );

    // Calculs des KPIs
    const kpis = useMemo(
        () => ({
            maturiteCloud: calculateMaturiteStrongPct(filteredData),
            detteCumulee: calculateDetteCumulee(filteredData),
            cveCritiques: calculateTotalCriticalCve(filteredData),
            appsSansMep: countAppsSinceLastMep(filteredData, 30)
        }),
        [filteredData]
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: isDark
                    ? "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)"
                    : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                px: { xs: 2, md: 4 },
                py: 4
            }}
        >
            {/* Header avec filtres */}

            <Filters data={globalInd} state={state} dispatch={dispatch} />

            {/* ========== SECTION 1: VUE D'ENSEMBLE ========== */}
            <Box mb={6}>
                <SectionHeader
                    icon={<DashboardOutlined />}
                    title="Vue d'ensemble"
                    subtitle="Indicateurs clés de performance et répartitions"
                />

                {/* KPIs */}
                <Grid container spacing={3} mb={4}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <KpiTile
                            label="Maturité Cloud (A/B)"
                            value={kpis.maturiteCloud}
                            helper="Part des applis A/B"
                            accent="success"
                            icon={<CloudOutlined />}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <KpiTile
                            label="Dette technique cumulée"
                            value={kpis.detteCumulee}
                            helper="Somme du périmètre"
                            accent="warning"
                            icon={<BuildCircleOutlined />}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <KpiTile
                            label="CVE critiques"
                            value={kpis.cveCritiques}
                            helper="Total périmètre filtré"
                            accent="error"
                            icon={<SecurityOutlined />}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <KpiTile
                            label="> 30 jours sans MEP"
                            value={kpis.appsSansMep}
                            helper="Applis > 30 j"
                            accent="info"
                            icon={<UpdateOutlined />}
                        />
                    </Grid>
                </Grid>

                {/* Donuts */}
                <ChartCard>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <GenericDonut
                                data={filteredData}
                                title="Répartition des lettres de qualité"
                                dataTransformer={transformQualiteData}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <GenericDonut
                                data={filteredData}
                                title="Répartition météo ressentie"
                                dataTransformer={transformMeteoData}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <GenericDonut
                                data={filteredData}
                                title="Répartition des dernières MEP"
                                dataTransformer={transformMepData}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <GenericDonut
                                data={filteredData}
                                title="Répartition de la dette technique"
                                dataTransformer={transformDetteData}
                            />
                        </Grid>
                    </Grid>
                </ChartCard>
            </Box>

            <Divider sx={{ my: 6, opacity: 0.3 }} />

            {/* ========== SECTION 2: CVE ========== */}
            <Box mb={6}>
                <SectionHeader
                    icon={<BugReportOutlined />}
                    title="Analyse des vulnérabilités"
                    subtitle="Suivi détaillé des CVE critiques et tendances"
                />

                {/* Graphiques CVE côte à côte */}
                <Grid container spacing={3} mb={3}>
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <ChartCard>
                            <CveBarChart data={filteredData} topN={10} />
                        </ChartCard>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <ChartCard>
                            <CveTreemap data={filteredData} topN={25} />
                        </ChartCard>
                    </Grid>
                </Grid>

                {/* Historique CVE */}
                <Box mb={3}>
                    <ChartCard>
                        <CveHistoryChart data={filteredData} monthlyData={cveMonthlyData} maxApps={6} />
                    </ChartCard>
                </Box>

                {/* TreeGraph CVE */}
                <ChartCard>
                    <TreeGraphCveCritiques data={filteredData} maxAppsPerSndi={30} height="600px" />
                </ChartCard>
            </Box>

            <Divider sx={{ my: 6, opacity: 0.3 }} />

            {/* ========== SECTION 3: ANALYSE CROISÉE ========== */}
            <Box mb={6}>
                <SectionHeader
                    icon={<InsightsOutlined />}
                    title="Analyse croisée"
                    subtitle="Corrélations et insights entre métriques"
                />

                <ChartCard>
                    <CorrelationChart data={filteredData} />
                </ChartCard>
            </Box>
        </Box>
    );
};

export default DashboardCharts;
