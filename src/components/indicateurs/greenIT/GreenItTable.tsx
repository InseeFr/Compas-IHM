import type { ViewMode } from "constantes/constantes";
import { useMemo, useState, Fragment } from "react";
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
import { UseQueryIndicators } from "utils/useQueryIndicators";

export const GreenItTable = () => {
    const { state, dispatch } = useFilterContext();
    const [viewMode, setViewMode] = useState<ViewMode>("global");
    const columns = useMemo(() => columnsGreenIt(), []);

    const fetchData = async () => {
        try {
            const [sndiAndDomainApp, appGreenIt] = await Promise.all([
                getApplications1(),
                getApplications()
            ]);
            return [...formatIndicateur(sndiAndDomainApp, appGreenIt)];
        } catch (error) {
            console.error("Erreur lors de la récupération des données: ", error);
        }
    };

    const { data, isLoading, filteredData } = UseQueryIndicators({
        queryKey: ["GreenItIndicator"],
        fetchData,
        hasModules: false
    });

    return (
        <>
            <Filters data={data} state={state} dispatch={dispatch} />
            <TablePageLayout
                titleTable="Table Indicateur GreenIT"
                data={filteredViewMode(viewMode, filteredData)}
                isLoading={isLoading}
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
