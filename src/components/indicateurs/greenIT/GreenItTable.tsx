import type { ViewMode } from "constantes/constantes";
import type { GreenITIndicateur } from "models/indicateurs";
import { useEffect, useMemo, useState, Fragment } from "react";
import { useFilterContext } from "store/filterContext";
import { getApplications, getApplications1 } from "todos-api/client.gen";
import {
    columnsGreenIt,
    filteredViewMode,
    formatIndicateur,
    onExport,
    paginationConfig
} from "./greenItConfig";
import TablePageLayout from "pages/TablePageLayout";
import ButtonCsvExport from "pages/ButtonCsvExport";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Filters } from "components/Filters";
import { applyDevFilters } from "utils/filters-functions";

export const GreenItTable = () => {
    const [greenItData, setGreenItData] = useState<GreenITIndicateur[]>([]);
    const { state, dispatch } = useFilterContext();
    const [viewMode, setViewMode] = useState<ViewMode>("global");
    const columns = useMemo(() => columnsGreenIt(), []);

    useEffect(() => {
        async function fetchData(): Promise<void> {
            try {
                const [sndiAndDomainApp, appGreenIt] = await Promise.all([
                    getApplications1(),
                    getApplications()
                ]);
                setGreenItData([...formatIndicateur(sndiAndDomainApp, appGreenIt)]);
            } catch (error) {
                console.error("Erreur lors de la récupération des données: ", error);
            }
        }
        fetchData();
    }, []);

    const filteredData = useMemo(
        () => greenItData.filter(item => applyDevFilters(item, state)),
        [greenItData, state]
    );

    return (
        <>
            <Filters data={greenItData} state={state} dispatch={dispatch} />
            <TablePageLayout
                titleTable="Table Indicateur GreenIT"
                data={filteredViewMode(viewMode, filteredData)}
                columns={columns}
                paginationConfig={paginationConfig}
                rowId={row =>
                    row.isModule
                        ? `${row.parentApplication}-${row.applicationName}`
                        : row.applicationName
                }
                renderTopCustom={({ table }) => (
                    <Fragment>
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={(_, val) => val && setViewMode(val)}
                            size="small"
                            color="secondary"
                        >
                            <ToggleButton value="global">Global</ToggleButton>
                            <ToggleButton value="prod">Prod</ToggleButton>
                            <ToggleButton value="horsprod">Hors-prod</ToggleButton>
                        </ToggleButtonGroup>
                        <ButtonCsvExport table={table} onExport={onExport} />
                    </Fragment>
                )}
            />
        </>
    );
};
