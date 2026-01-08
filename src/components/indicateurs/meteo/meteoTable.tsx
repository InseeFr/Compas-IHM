import type { MeteoIndicateur } from "models/indicateurs";
import { useEffect, useMemo, useState } from "react";
import { useFilterContext } from "store/filterContext";
import { getHistory } from "todos-api/client.gen";
import { buildMeteo, columnsMeteo, month, onExport, paginationConfig } from "./meteo-config";
import TablePageLayout from "pages/TablePageLayout";
import { columnFilters, handleColumnFiltersChange } from "utils/filterFunctions";
import ButtonCsvExport from "pages/ButtonCsvExport";

export const MeteoTable = () => {
    const [meteoData, setMeteoData] = useState<MeteoIndicateur[]>([]);
    const { state, dispatch } = useFilterContext();
    const [months, setMonths] = useState<string[]>([]);
    const columns = useMemo(() => columnsMeteo(meteoData, months), [meteoData, months]);

    useEffect(() => {
        async function fetchData(): Promise<void> {
            try {
                const meteoHistory = await getHistory();
                const items = meteoHistory.filter(meteo => meteo.idApplication !== undefined);
                const getMonths: string[] = month(items);
                setMonths(getMonths);
                setMeteoData(buildMeteo(meteoHistory, getMonths));
            } catch (error) {
                console.error("Erreur lors de la récupération du meteo history: ", error);
            }
        }
        fetchData();
    }, []);

    return (
        <TablePageLayout
            titleTable={"Table Indicateur Météo"}
            columns={columns}
            data={meteoData}
            paginationConfig={paginationConfig}
            rowId={r => String(r.idApp ?? r.applicationName)}
            columnFilters={columnFilters(state)}
            onColumnFiltersChange={handleColumnFiltersChange(state, dispatch)}
            renderTopCustom={({ table }) => <ButtonCsvExport table={table} onExport={onExport} />}
        />
    );
};
