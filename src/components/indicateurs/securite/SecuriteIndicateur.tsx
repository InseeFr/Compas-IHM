import type { SecuriteIndicateur } from "models/indicateurs";
import { useEffect, useMemo, useState } from "react";
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
import TablePageLayout from "pages/TablePageLayout";
import { groupModulesByApp } from "utils/group-module-by-apps";
import { columnFilters, handleColumnFiltersChange } from "utils/filterFunctions";
import ButtonCsvExport from "pages/ButtonCsvExport";

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
    const [securiteIndicateur, setSecuriteIndicateur] = useState<SecuriteIndicateur[]>([]);
    const columns = useMemo(() => columnsTable(securiteIndicateur), [securiteIndicateur]);

    const applicationsOnly = useMemo(
        () => securiteIndicateur.filter(item => !item.isModule),
        [securiteIndicateur]
    );

    const modulesByApp = useMemo(() => groupModulesByApp(securiteIndicateur), [securiteIndicateur]);

    useEffect(() => {
        async function fetchData(): Promise<void> {
            try {
                const [apps, modules, securiteApps, securiteModules] = await Promise.all([
                    getApplications1(),
                    getModules1(),
                    getIndicateurSecuriteByApplication(),
                    getIndicateurSecuriteByModule()
                ]);

                const formattedApps = formatApplicationsData(apps, securiteApps);
                const formattedModules = formatModulesData(modules, securiteModules);

                setSecuriteIndicateur([...formattedApps, ...formattedModules]);
            } catch (error) {
                console.error("Erreur lors de la récupération des données sécurité: ", error);
            }
        }
        fetchData();
    }, []);

    return (
        <TablePageLayout
            titleTable="Table Indicateur Sécurité"
            data={applicationsOnly}
            columns={columns}
            paginationConfig={paginationConfig}
            rowId={row =>
                row.isModule ? `${row.parentApplication}-${row.applicationName}` : row.applicationName
            }
            subRow={subRow => (subRow.isModule ? undefined : modulesByApp[subRow.applicationName])}
            columnFilters={columnFilters(state)}
            onColumnFiltersChange={handleColumnFiltersChange(state, dispatch)}
            renderTopCustom={({ table }) => <ButtonCsvExport table={table} onExport={OnExport} />}
        />
    );
};

export default SecuriteIndicateurTable;
