import { useEffect, useMemo, useState } from "react";
import type { DevopsIndicateur } from "../../../models/indicateurs";
import { getApplications2, getModules2 } from "../../../todos-api/client.gen";
import ButtonCsvExport from "../../../pages/ButtonCsvExport";
import TablePageLayout from "../../../pages/TablePageLayout";
import { columnsTable, formatIndicateur, onExport, paginationConfig } from "./devopsConfig";
import { useFilterContext } from "store/filterContext";
import { columnFilters, handleColumnFiltersChange } from "utils/filterFunctions";
import { groupModulesByApp } from "utils/group-module-by-apps";

export const DevopsIndicateurTable = () => {
    const [devopsIndicateur, setDevopsIndicateur] = useState<DevopsIndicateur[]>([]);
    const { state, dispatch } = useFilterContext();

    const columns = useMemo(() => columnsTable(devopsIndicateur), [devopsIndicateur]);

    const modulesByApp = useMemo(() => groupModulesByApp(devopsIndicateur), [devopsIndicateur]);

    useEffect(() => {
        async function fetchData(): Promise<void> {
            try {
                const [apps, modules] = await Promise.all([getApplications2(), getModules2()]);

                const formattedApplications = apps.map(app => formatIndicateur(app));
                const formattedModules = modules.map(module => formatIndicateur(module, true));

                setDevopsIndicateur([...formattedApplications, ...formattedModules]);
            } catch (error) {
                console.error("Erreur lors de la récupération des données :", error);
            }
        }

        fetchData();
    }, []);

    return (
        <TablePageLayout
            titleTable="Table Indicateur DEVOPS"
            data={devopsIndicateur.filter(item => (item.isModule ? null : item))}
            columns={columns}
            paginationConfig={paginationConfig}
            rowId={row =>
                row.isModule ? `${row.parentApplication}-${row.applicationName}` : row.applicationName
            }
            subRow={subRow => (subRow.isModule ? undefined : modulesByApp[subRow.applicationName])}
            columnFilters={columnFilters(state)}
            onColumnFiltersChange={handleColumnFiltersChange(state, dispatch)}
            renderTopCustom={({ table }) => <ButtonCsvExport table={table} onExport={onExport} />}
        />
    );
};
