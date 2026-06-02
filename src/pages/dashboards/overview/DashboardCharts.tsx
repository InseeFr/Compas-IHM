import { useState, useEffect } from "react";
import { Box, Grid, CircularProgress, useTheme, Typography } from "@mui/material";
import {
    BuildCircleOutlined,
    CloudOutlined,
    SecurityOutlined,
    UpdateOutlined,
    DashboardOutlined
} from "@mui/icons-material";

// Components
import { Filters } from "pages/Filters";
import { KpiTile } from "./KpiTile";
import { ChartCard } from "./ChartCard";
import { GenericDonut } from "./Charts/GenericDonut";
import { SectionHeader } from "./SectionHeader";
import { SpecializedDashboardLinks } from "./SpecializedDashboardLinks";

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
    getIndicateurQualiteByApplicationByDate,
    getApplications2,
    listerApplicationsMeteo,
    getApplications,
    listerApplicationA11y,
    getIndicateurSecuriteByApplication,
    getMaturiteCloud,
    getApplications1
} from "todos-api/client.gen";
import { formattedApps } from "pages/indicateurs/main-indicator/formatted-mod-and-app";
import { applyDevFilters } from "utils/filters-functions";
import Ariane from "components/Ariane";

const DashboardCharts = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const [globalInd, setGlobalInd] = useState<GlobalIndicator[]>([]);
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

                setGlobalInd(formattedApplications);
            } catch (error) {
                console.error("Erreur chargement données:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Filtrage des données
    const filteredData = globalInd.filter(item => applyDevFilters(item, state));
    // Calculs des KPIs
    const kpis = {
        maturiteCloud: calculateMaturiteStrongPct(filteredData),
        detteCumulee: calculateDetteCumulee(filteredData),
        cveCritiques: calculateTotalCriticalCve(filteredData),
        appsSansMep: countAppsSinceLastMep(filteredData, 30)
    };

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
                py: 4,
                paddingTop: 10
            }}
        >
            <Ariane items={[{ nav: "Vue d'ensemble", link: "" }]} />
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
                <Typography
                    variant="body2"
                    sx={{
                        textAlign: "right",
                        color: "text.primary",
                        mb: 3,
                        mt: 2
                    }}
                >
                    💡 Cliquez sur les carrés de la légende pour afficher/masquer les courbes
                </Typography>
            </Box>

            <SpecializedDashboardLinks />
        </Box>
    );
};

export default DashboardCharts;
