import type { IndicateurApplicationMaturite } from "models/indicateurs";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useFilterContext } from "store/filterContext";
import { bottom3ByPriority, computeConseil, fetchMaturiteData, fetchTipsData } from "./maturite-config";
import { Filters } from "components/Filters";
import DashboardPageLayout from "pages/dashboardsPagesLayout/dashboardPageLayout";
import { applyDevFilters } from "utils/filters-functions";
import { TextField } from "@mui/material";
import {
    ComplexitySection,
    ConseilComplexity,
    DisclaimerMaturity,
    MaturiteHeader,
    TechAndOrga
} from "./MaturiteContent";
import type { ApplicationTip } from "todos-api/client.gen";

export default function MaturiteCloud() {
    const [maturiteData, setMaturiteData] = useState<IndicateurApplicationMaturite[]>([]);
    const [selectedApp, setSelectedApp] = useState<IndicateurApplicationMaturite | null>(null);
    const [tips, setTips] = useState<ApplicationTip[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { state, dispatch } = useFilterContext();

    const getLabel = (app: IndicateurApplicationMaturite) =>
        app.applicationName ?? `Application ${app.applicationId}`;

    useEffect(() => {
        async function loadMaturiteData() {
            setLoading(true);
            try {
                const result = await fetchMaturiteData();
                setMaturiteData(result);
            } finally {
                setLoading(false);
            }
        }
        loadMaturiteData();
    }, []);

    useEffect(() => {
        async function loadTips() {
            const result = await fetchTipsData(selectedApp);
            setTips(result);
        }
        loadTips();
    }, [selectedApp]);

    const filteredData = useMemo(
        () => maturiteData.filter(item => applyDevFilters(item, state)),
        [maturiteData, state]
    );

    const tipsTechTop3 = useMemo(() => bottom3ByPriority(tips.filter(t => t.sourceId === 1)), [tips]);
    const tipsOrgaTop3 = useMemo(() => bottom3ByPriority(tips.filter(t => t.sourceId === 2)), [tips]);

    const conseil: {
        favorable: boolean;
        texte: string;
    } | null = useMemo(() => {
        if (!selectedApp) return null;
        return computeConseil(
            selectedApp.maturite,
            selectedApp.scoreBenefice,
            selectedApp.scoreComplexite
        );
    }, [selectedApp]);

    return (
        <Fragment>
            <Filters state={state} dispatch={dispatch} data={maturiteData} />
            <DashboardPageLayout
                title={"Synthése Maturité Cloud"}
                dashboardData={filteredData}
                loading={loading}
                setter={setSelectedApp}
                getter={selectedApp}
                renderInputAutoComplete={params => (
                    <TextField
                        {...params}
                        label="Rechercher une application"
                        variant="outlined"
                        placeholder="Tapez le nom…"
                    />
                )}
                titleCard={selectedApp?.applicationName}
                subHeader={<MaturiteHeader selectedApp={selectedApp} />}
                renderContent={
                    <Fragment>
                        <ComplexitySection selectedApp={selectedApp} />
                        {conseil && <ConseilComplexity conseil={conseil} />}
                        <TechAndOrga
                            selectedApp={selectedApp}
                            tipsItemsTech={tipsTechTop3}
                            tipsItemsOrga={tipsOrgaTop3}
                        />
                    </Fragment>
                }
                label={getLabel}
            />
            <DisclaimerMaturity />
        </Fragment>
    );
}
