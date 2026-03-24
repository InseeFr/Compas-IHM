import { Fragment, useState } from "react";
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
import TablePageLayout from "components/TablePageLayout";
import ButtonCsvExport from "components/ButtonCsvExport";
import { Filters } from "pages/Filters";
import { applyDevFilters } from "utils/filters-functions";
import { MeteoFormMonths } from "./meteoCell";
import { useQuery } from "@tanstack/react-query";

export const MeteoTable = () => {
    const { state, dispatch } = useFilterContext();
    const [nbMois, setNbMois] = useState<number>(6);

    const fetchData = async () => {
        const [meteoHistory, apps] = await Promise.all([
            getHistory({ nbMois: nbMois }),
            getApplications1()
        ]);
        const items = meteoHistory.filter(meteo => meteo.idApplication !== undefined);
        const getMonths: string[] = month(items);
        const domaineFoncMap = buildDomaineFoncMap(apps);
        const meteoData = buildMeteo(meteoHistory, getMonths, domaineFoncMap);

        return { data: meteoData, months: getMonths };
    };

    const {
        data: queryResult,
        isLoading,
        refetch
    } = useQuery({
        queryKey: ["meteoIndicator", nbMois],
        queryFn: fetchData,
        staleTime: 0
    });

    const data = queryResult?.data ?? [];
    const months = queryResult?.months ?? [];

    const columns = columnsMeteo(months);

    const filteredData = data.filter(item => applyDevFilters(item, state));

    return (
        <TablePageLayout
            reactKey={months.join("|")}
            fetch={refetch}
            titleTable="Table Indicateur Météo"
            filters={<Filters data={data} state={state} dispatch={dispatch} />}
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
            paginationConfig={paginationConfig}
            rowId={r => String(r.idApp ?? r.applicationName)}
            renderTopCustom={({ table }) => (
                <Fragment>
                    <MeteoFormMonths
                        nbMois={nbMois}
                        handleChange={event => setNbMois(Number(event.target.value))}
                        disabled={isLoading}
                    />
                    <ButtonCsvExport table={table} onExport={onExport} />
                </Fragment>
            )}
        />
    );
};
