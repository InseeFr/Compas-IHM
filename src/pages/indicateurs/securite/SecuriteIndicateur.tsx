import type { SecuriteIndicateur } from "models/indicateurs";
import { useMemo } from "react";
import { useFilterContext } from "store/filterContext";
import {
    columnsTable,
    formatApplicationSecurite,
    formatModuleSecurite,
    OnExport,
    paginationConfig
} from "./securiteConfig";
import {
    getApplications1,
    getIndicateurSecuriteByApplication,
    getIndicateurSecuriteByModule,
    getModules1,
    type Application,
    type Module,
    type IndicateurSecuriteView
} from "todos-api/client.gen";
import TablePageLayout from "components/TablePageLayout";
import ButtonCsvExport from "components/ButtonCsvExport";
import { Filters } from "pages/Filters";
import { UseQueryIndicators } from "utils/useQueryIndicators";

function formatApplicationsData(
    apps: Application[],
    securiteApps: IndicateurSecuriteView[]
): SecuriteIndicateur[] {
    return apps.map(app => {
        const securiteApp = securiteApps.find(s => s.applicationId === app.idApplication);
        return formatApplicationSecurite(app, securiteApp);
    });
}

function formatModulesData(
    modules: Module[],
    securiteModules: IndicateurSecuriteView[]
): SecuriteIndicateur[] {
    return modules.map(mod => {
        const securiteModule = securiteModules.find(s => s.moduleId === mod.id);
        return formatModuleSecurite(mod, securiteModule);
    });
}

const SecuriteIndicateurTable = () => {
    const { state, dispatch } = useFilterContext();
    const columns = useMemo(() => columnsTable(), []);

    const fetchData = async () => {
        try {
            const [apps, modules, securiteApps, securiteModules] = await Promise.all([
                getApplications1(),
                getModules1(),
                getIndicateurSecuriteByApplication(),
                getIndicateurSecuriteByModule()
            ]);

            const formattedApps = formatApplicationsData(apps, securiteApps);
            const formattedModules = formatModulesData(modules, securiteModules);

            return [...formattedApps, ...formattedModules];
        } catch (error) {
            console.error("Erreur lors de la récupération des données sécurité: ", error);
        }
    };

    const { data, isLoading, modulesByApp, filteredData } = UseQueryIndicators({
        queryKey: ["SecuriteIndicator"],
        fetchData,
        hasModules: true
    });

    return (
        <TablePageLayout
            titleTable="Table Indicateur Sécurité"
            filters={<Filters data={data} state={state} dispatch={dispatch} />}
            data={filteredData.filter(item => (item.isModule ? null : item))}
            columns={columns}
            isLoading={isLoading}
            paginationConfig={paginationConfig}
            rowId={row =>
                row.isModule ? `${row.parentApplication}-${row.applicationName}` : row.applicationName
            }
            subRow={subRow => (subRow.isModule ? undefined : modulesByApp[subRow.applicationName])}
            renderTopCustom={({ table }) => <ButtonCsvExport table={table} onExport={OnExport} />}
        />
    );
};

export default SecuriteIndicateurTable;
