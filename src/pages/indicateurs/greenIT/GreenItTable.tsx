import type { ViewMode } from "constantes/constantes";
import { useState, Fragment } from "react";
import { useFilterContext } from "store/filterContext";
import {
    columnsGreenIt,
    fetchData,
    filteredViewMode,
    onExport,
    paginationConfig
} from "./greenItConfig";
import TablePageLayout from "components/TablePageLayout";
import ButtonCsvExport from "components/ButtonCsvExport";
import { ToggleButton, ToggleButtonGroup, Box } from "@mui/material";
import { Filters } from "pages/Filters";
import { useQueryIndicators } from "hooks/useQueryIndicators";
import { GreenItDate } from "components/GreenItDate";

export const GreenItTable = () => {
    const { state, dispatch } = useFilterContext();
    const [viewMode, setViewMode] = useState<ViewMode>("global");
    const columns = columnsGreenIt();

    const { data, isLoading, filteredData, refetch } = useQueryIndicators({
        queryKey: ["GreenItIndicator"],
        fetchData,
        hasModules: false
    });

    return (
        <TablePageLayout
            titleTable="Table Indicateur GreenIT"
            filters={
                <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                    <Filters data={data} state={state} dispatch={dispatch} />
                    <GreenItDate />
                </Box>
            }
            data={filteredViewMode(viewMode, filteredData)}
            isLoading={isLoading}
            columns={columns}
            paginationConfig={paginationConfig}
            rowId={row =>
                row.isModule ? `${row.parentApplication}-${row.applicationName}` : row.applicationName
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
            fetch={refetch}
        />
    );
};
