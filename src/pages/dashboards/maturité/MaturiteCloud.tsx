import type { IndicateurApplicationMaturite } from "models/indicateurs";
import { Fragment, useEffect, useState } from "react";
import { Divider, Stack, TextField } from "@mui/material";

import { useFilterContext } from "store/filterContext";
import { applyDevFilters } from "utils/filters-functions";
import DashboardPageLayout from "components/dashboardsPagesLayout/dashboardPageLayout";
import { FilterSidebar } from "components/filtersLayout/FilterSideBar";

import { fetchMaturiteData } from "./maturite-config";
import { DisclaimerMaturity, MaturiteBlock, OpportuniteBlock } from "./MaturiteContent";

export default function MaturiteCloud() {
    const [maturiteData, setMaturiteData] = useState<IndicateurApplicationMaturite[]>([]);
    const [selectedApp, setSelectedApp] = useState<IndicateurApplicationMaturite | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { state, dispatch } = useFilterContext();

    const getLabel = (app: IndicateurApplicationMaturite) =>
        app.applicationName ?? (app.applicationId ? `Application ${app.applicationId}` : "Application inconnue");

    useEffect(() => {
        async function loadMaturiteData() {
            setLoading(true);
            try {
                const result = await fetchMaturiteData();
                setMaturiteData(result);
            } catch (error) {
                console.error("Erreur fetchMaturiteData:", error);
            } finally {
                setLoading(false);
            }
        }
        loadMaturiteData();
    }, []);

    const filteredData = maturiteData.filter(item => applyDevFilters(item, state));

    return (
        <Fragment>
            <DashboardPageLayout
                title={"Synthèse Maturité Cloud"}
                dashboardData={filteredData}
                filters={<FilterSidebar state={state} dispatch={dispatch} data={maturiteData} />}
                loading={loading}
                setter={setSelectedApp}
                getter={selectedApp}
                subHeader={undefined}
                renderInputAutoComplete={params => (
                    <TextField
                        {...params}
                        label="Rechercher une application"
                        variant="outlined"
                        placeholder="Tapez le nom…"
                    />
                )}
                titleCard={selectedApp?.applicationName}
                renderContent={
                    <Stack spacing={3} sx={{ width: "100%" }}>
                        <OpportuniteBlock selectedApp={selectedApp} />
                        <Divider />
                        <MaturiteBlock selectedApp={selectedApp} />
                    </Stack>
                }
                label={getLabel}
            />
            <DisclaimerMaturity />
        </Fragment>
    );
}