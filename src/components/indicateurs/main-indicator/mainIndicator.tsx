import type { GlobalIndicator } from "models/indicateurs";
import { useEffect, useMemo, useState } from "react";
import { useFilterContext } from "store/filterContext";
import {
    getIndicateurQualiteByApplication,
    getIndicateurQualiteByModule,
    getApplications2,
    getModules2,
    listerApplicationsMeteo,
    getApplications,
    listerModulesA11y,
    listerApplicationA11y,
    getIndicateurSecuriteByApplication,
    getIndicateurSecuriteByModule,
    getMaturiteCloud,
    getModules1,
    getApplications1
} from "todos-api/client.gen";
import { formattedApps, formattedModules } from "./formatted-mod-and-app";
import TablePageLayout from "pages/TablePageLayout";
import { columnsGlobal, paginationConfig } from "./main-config";
import { groupModulesByApp } from "utils/group-module-by-apps";
import ButtonCsvExport from "pages/ButtonCsvExport";
import { Filters } from "components/Filters";
import { onExport } from "./csvexport";
import { applyDevFilters } from "utils/filters-functions";

export const MainIndicator = () => {
    const [globalInd, setGlobalInd] = useState<GlobalIndicator[]>([]);
    const { state, dispatch } = useFilterContext();
    const columns = useMemo(() => columnsGlobal(), []);
    const modulesByApp = useMemo(() => groupModulesByApp(globalInd), [globalInd]);

    useEffect(() => {
        async function fetchData() {
            const [
                apps,
                modules,
                qualiteAppData,
                qualiteModule,
                devopsAppData,
                devopsModulesData,
                meteoData,
                consoAppData,
                a11yDataModules,
                a11yDataApps,
                securiteApps,
                securiteModules,
                maturiteCloudApps
            ] = await Promise.all([
                getApplications1(),
                getModules1(),
                getIndicateurQualiteByApplication(),
                getIndicateurQualiteByModule(),
                getApplications2(),
                getModules2(),
                listerApplicationsMeteo(),
                getApplications(),
                listerModulesA11y(),
                listerApplicationA11y(),
                getIndicateurSecuriteByApplication(),
                getIndicateurSecuriteByModule(),
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

            const formattedModulesData = formattedModules({
                modules,
                qualiteModule,
                devopsModulesData,
                meteoData,
                a11yDataModules,
                securiteModules
            });

            setGlobalInd([...formattedApplications, ...formattedModulesData]);
        }

        fetchData();
    }, []);

    const filteredData = useMemo(
        () => globalInd.filter(item => applyDevFilters(item, state)),
        [globalInd, state]
    );

    return (
        <>
            <Filters data={globalInd} state={state} dispatch={dispatch} />
            <TablePageLayout
                titleTable={"Table Global Indicateur"}
                columns={columns}
                data={filteredData.filter(item => (item.isModule ? null : item))}
                paginationConfig={paginationConfig}
                rowId={row =>
                    row.isModule
                        ? `${row.parentApplication}-${row.applicationName}`
                        : row.applicationName
                }
                subRow={subRow => (subRow.isModule ? undefined : modulesByApp[subRow.applicationName])}
                renderTopCustom={({ table }) => <ButtonCsvExport table={table} onExport={onExport} />}
            />
        </>
    );
};
