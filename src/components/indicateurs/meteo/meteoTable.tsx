import { Fragment, useMemo, useState } from "react";
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

    const { data: queryResult, isLoading } = useQuery({
        queryKey: ["meteoIndicator", nbMois],
        queryFn: fetchData,
        staleTime: 0
    });

    const data = useMemo(() => queryResult?.data ?? [], [queryResult?.data]);
    const months = useMemo(() => queryResult?.months ?? [], [queryResult?.months]);

    const columns = useMemo(() => columnsMeteo(months), [months]);

    const filteredData = useMemo(() => data.filter(item => applyDevFilters(item, state)), [data, state]);

    return (
        <>
            <Filters data={data} state={state} dispatch={dispatch} />
            <TablePageLayout
                reactKey={months.join("|")}
                titleTable="Table Indicateur Météo"
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
        </>
    );
};
