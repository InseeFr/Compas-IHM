import type { ViewMode } from "constantes/constantes";
import { useState, Fragment, useMemo } from "react";
import { useFilterContext } from "store/filterContext";

import {
    fetchData,
    onExport,
    paginationConfig,
    filteredViewMode  
} from "./greenItConfig";

import {
    buildInfraColumns,
    type InfraType
} from "utils/greenit-type";

import TablePageLayout from "components/TablePageLayout";
import ButtonCsvExport from "components/ButtonCsvExport";
import { ToggleButton, ToggleButtonGroup, Box } from "@mui/material";
import { Filters } from "pages/Filters";
import { useQueryIndicators } from "hooks/useQueryIndicators";
import { GreenItDate } from "components/GreenItDate";

export const GreenItTable = () => {
    const { state, dispatch } = useFilterContext();
    const [viewMode, setViewMode]       = useState<ViewMode>("global");
    const [columnVisibility, setColumnVisibility] = useState<InfraType>("ALL");

    const { data, isLoading, filteredData = [], refetch } = useQueryIndicators({
        queryKey: ["GreenItIndicator"],
        fetchData,
        hasModules: false
    });

    const columns = useMemo(
        () => buildInfraColumns(viewMode, columnVisibility),
        [viewMode, columnVisibility]
    );

    const finalData = useMemo(() => {
        const safeData = filteredData?.length > 0 ? filteredData : data ?? [];
        return filteredViewMode(viewMode, safeData, columnVisibility);
    }, [data, filteredData, viewMode, columnVisibility]);

    return (
        <TablePageLayout
            titleTable="Table Indicateur GreenIT"
            filters={
                <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                    <Filters data={data} state={state} dispatch={dispatch} />
                    <GreenItDate />
                </Box>
            }
            data={finalData}
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
                    <ToggleButtonGroup
                        value={columnVisibility}
                        exclusive
                        onChange={(_, val) => val && setColumnVisibility(val)}
                        size="small"
                        color="secondary"
                    >
                        <ToggleButton value="ALL">All</ToggleButton>
                        <ToggleButton value="KUB">Kubernetes</ToggleButton>
                        <ToggleButton value="VM">VM</ToggleButton>
                    </ToggleButtonGroup>
                    <ButtonCsvExport table={table} onExport={onExport} />
                </Fragment>
            )}
            fetch={refetch}
        />
    );
};