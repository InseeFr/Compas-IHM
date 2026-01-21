import { useMemo } from "react";
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
import ButtonCsvExport from "pages/ButtonCsvExport";
import { Filters } from "components/Filters";
import { onExport } from "./csvexport";
import { UseQueryIndicators } from "utils/useQueryIndicators";

export const MainIndicator = () => {
    const { state, dispatch } = useFilterContext();
    const columns = useMemo(() => columnsGlobal(), []);

    const fetchData = async () => {
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

        return [...formattedApplications, ...formattedModulesData];
    };

    const { data, modulesByApp, isLoading, filteredData } = UseQueryIndicators({
        queryKey: ["GlobalIndicator"],
        fetchData,
        hasModules: true
    });

    return (
        <>
            <Filters data={data} state={state} dispatch={dispatch} />
            <TablePageLayout
                titleTable={"Table Global Indicateur"}
                columns={columns}
                isLoading={isLoading}
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
