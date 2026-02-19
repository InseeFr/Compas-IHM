import type { IndicateurApplicationSynthese } from "models/indicateurs";
import { useEffect, useState } from "react";
import { useFilterContext } from "store/filterContext";
import {
    fetchApplicationSynthesis,
    handleGenerateReport,
    normalize,
    transformModuleData
} from "./application-synthesis-config";
import { applyDevFilters } from "utils/filters-functions";
import { Filters } from "pages/Filters";
import DashboardPageLayout from "components/dashboardsPagesLayout/dashboardPageLayout";
import { TextField } from "@mui/material";
import ApplicationReportPreview, { ButtonGenerateReport } from "./preview/ApplicationContent";

export const ApplicationSynthesis = () => {
    const [apps, setApps] = useState<IndicateurApplicationSynthese[]>([]);
    const [selectedApp, setSelectedApp] = useState<IndicateurApplicationSynthese | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [modules, setModules] = useState<IndicateurApplicationSynthese[]>([]);
    const { state, dispatch } = useFilterContext();

    const getLabel = (app: IndicateurApplicationSynthese) =>
        app.applicationName ?? `Application ${app.applicationId}`;

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [resultApp, resultMod] = await fetchApplicationSynthesis();
                setApps(resultApp);
                setModules(resultMod);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredData = apps.filter(item => applyDevFilters(item, state));

    const normalizedAppName = selectedApp ? normalize(selectedApp.applicationName) : null;
    const normalizedAppId = selectedApp ? normalize(selectedApp.applicationId) : null;

    const selectedModules = modules
        .filter(module => {
            const normalizedParent = normalize(module.parentApplication);
            return normalizedParent === normalizedAppName || normalizedParent === normalizedAppId;
        })
        .map(transformModuleData);

    return (
        <DashboardPageLayout
            title={"Synthèse   d'une   application"}
            dashboardData={filteredData}
            filters={<Filters state={state} dispatch={dispatch} data={apps} />}
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
            subHeader={
                selectedApp && (
                    <ButtonGenerateReport
                        handle={handleGenerateReport}
                        appName={selectedApp.applicationName}
                    />
                )
            }
            renderContent={
                selectedApp && (
                    <ApplicationReportPreview
                        key={`app-report-${selectedApp.applicationName}`}
                        appDetails={selectedApp}
                        modules={selectedModules}
                        population={apps}
                    />
                )
            }
            label={getLabel}
        />
    );
};
