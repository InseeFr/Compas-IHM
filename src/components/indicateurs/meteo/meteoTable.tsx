import type { MeteoIndicateur } from "models/indicateurs";
import { useEffect, useMemo, useState } from "react";
import { useFilterContext } from "store/filterContext";
import { getApplications1, getHistory } from "todos-api/client.gen";
import {
    buildDomaineFoncMap,
    buildMeteo,
    columnsMeteo,
    month,
    onExport,
    paginationConfig
} from "./meteo-config";
import TablePageLayout from "pages/TablePageLayout";
import ButtonCsvExport from "pages/ButtonCsvExport";
import { Filters } from "components/Filters";
import { applyDevFilters } from "utils/filters-functions";

export const MeteoTable = () => {
    const [meteoData, setMeteoData] = useState<MeteoIndicateur[]>([]);
    const { state, dispatch } = useFilterContext();
    const [months, setMonths] = useState<string[]>([]);
    const columns = useMemo(() => columnsMeteo(months), [months]);

    useEffect(() => {
        async function fetchData() {
            try {
                const [meteoHistory, apps] = await Promise.all([getHistory(), getApplications1()]);
                const items = meteoHistory.filter(meteo => meteo.idApplication !== undefined);
                const getMonths: string[] = month(items);
                const domaineFoncMap = buildDomaineFoncMap(apps);
                setMonths(getMonths);
                setMeteoData(buildMeteo(meteoHistory, getMonths, domaineFoncMap));
            } catch (error) {
                console.error("Erreur lors de la récupération du meteo history: ", error);
            }
        }
        fetchData();
    }, []);

    const filteredData = useMemo(
        () => meteoData.filter(item => applyDevFilters(item, state)),
        [meteoData, state]
    );

    return (
        <>
            <Filters data={meteoData} state={state} dispatch={dispatch} />
            <TablePageLayout
                titleTable="Table Indicateur Météo"
                columns={columns}
                data={filteredData}
                paginationConfig={paginationConfig}
                rowId={r => String(r.idApp ?? r.applicationName)}
                renderTopCustom={({ table }) => <ButtonCsvExport table={table} onExport={onExport} />}
            />
        </>
    );
};
