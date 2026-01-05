import type { QualiteIndicateur } from "models/indicateurs";
import { useEffect, useMemo, useState } from "react";
import { useFilterContext } from "store/filterContext";
import { columnsTable, formatIndicateur, OnExport, paginationConfig } from "./qualiteConfig";
import { getIndicateurQualiteByApplication, getIndicateurQualiteByModule } from "todos-api/client.gen";
import TablePageLayout from "pages/TablePageLayout";
import { groupModulesByApp } from "utils/group-module-by-apps";
import { columnFilters, handleColumnFiltersChange } from "utils/filterFunctions";
import ButtonCsvExport from "pages/ButtonCsvExport";

const QualiteIndicateurTable = () => {
    const { state, dispatch } = useFilterContext();
    const [qualiteIndicateur, setQualiteIndicateur] = useState<QualiteIndicateur[]>([]);
    const columns = useMemo(() => columnsTable(qualiteIndicateur), [qualiteIndicateur]);
    const modulesByApp = useMemo(() => groupModulesByApp(qualiteIndicateur), [qualiteIndicateur]);

    useEffect(() => {
        async function fetchData(): Promise<void> {
            try {
                const [apps, modules] = await Promise.all([
                    getIndicateurQualiteByApplication(),
                    getIndicateurQualiteByModule()
                ]);
                const formattedApps = apps.map(app => formatIndicateur(app));
                const formattedModules = modules.map(mod => formatIndicateur(mod, true));
                setQualiteIndicateur([...formattedApps, ...formattedModules]);
            } catch (error) {
                console.log("Erreur lors de la récupération des données qualité: ", error);
            }
        }
        fetchData();
    }, []);
    console.log(qualiteIndicateur);
    return (
        <TablePageLayout
            titleTable="Table Indicateur Qualité"
            data={qualiteIndicateur}
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

export default QualiteIndicateurTable;
