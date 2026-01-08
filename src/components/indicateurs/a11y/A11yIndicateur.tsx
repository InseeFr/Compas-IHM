import type { A11yIndicateur } from "models/indicateurs";
import { useEffect, useMemo, useState } from "react";
import { useFilterContext } from "store/filterContext";
import { columnsTable, formatIndicateur, OnExport, paginationConfig } from "./a11yConfig";
import { listerModulesA11y } from "todos-api/client.gen";
import TablePageLayout from "pages/TablePageLayout";
import { columnFilters, handleColumnFiltersChange } from "utils/filterFunctions";
import ButtonCsvExport from "pages/ButtonCsvExport";

export const A11yIndicateurTable = () => {
    const [a11yIndicateur, setA11yIndicateur] = useState<A11yIndicateur[]>([]);
    const { state, dispatch } = useFilterContext();
    const columns = useMemo(() => columnsTable(a11yIndicateur), [a11yIndicateur]);

    useEffect(() => {
        async function fetchData(): Promise<void> {
            try {
                const modules = await listerModulesA11y();
                const formattedModules = modules.map(mod => formatIndicateur(mod));
                setA11yIndicateur(formattedModules);
            } catch (error) {
                console.error("Erreur lors de la récupération des données A11y: ", error);
            }
        }
        fetchData();
    }, []);

    return (
        <TablePageLayout
            titleTable="Table Indicateur Accessibilité"
            data={a11yIndicateur}
            columns={columns}
            paginationConfig={paginationConfig}
            rowId={row => row.modName}
            columnFilters={columnFilters(state)}
            onColumnFiltersChange={handleColumnFiltersChange(state, dispatch)}
            renderTopCustom={({ table }) => <ButtonCsvExport table={table} onExport={OnExport} />}
        />
    );
};
