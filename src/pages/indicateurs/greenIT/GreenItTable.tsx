import type { ViewMode } from "constantes/constantes";
import { useState } from "react";
import { useFilterContext } from "store/filterContext";

import {
    columnsGreenIt,
    fetchData,
    onExport,
    paginationConfig,
    filteredViewMode
} from "./greenItConfig";

import TablePageLayout from "components/TablePageLayout";
import ButtonCsvExport from "components/ButtonCsvExport";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useQueryIndicators } from "hooks/useQueryIndicators";
import { GreenItDate } from "components/GreenItDate";
import { FilterSidebar } from "components/filtersLayout/FilterSideBar";
import { GreenItToggleButton } from "./GreenItCell";

const VM_COLUMNS = {
    _nbVmSort: true,
    _diskSort: true,
    _diskUsedSort: true,
    _cpuSort: true,
    _ramSort: true,
    _consoSort: true
};

const KUBE_COLUMNS = {
    _nbPodMaxiSort: true,
    _pvcUsedSort: true,
    _s3UsedSort: true,
    _cpuUsedSort: true,
    _ramUsedSort: true
};

export const GreenItTable = () => {
    const { state, dispatch } = useFilterContext();
    const [viewMode, setViewMode] = useState<ViewMode>("global");
    const columns = columnsGreenIt();
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
        // Kube
        _nbPodMaxiSort: true,
        _pvcUsedSort: true,
        _s3UsedSort: true,
        _cpuUsedSort: true,
        _ramUsedSort: true,
        // VM
        _nbVmSort: false,
        _diskSort: false,
        _diskUsedSort: false,
        _cpuSort: false,
        _ramSort: false,
        _consoSort: false
    });
    const [infraMode, setInfraMode] = useState<"kube" | "vm" | null>("kube");

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
                    <FilterSidebar data={data} state={state} dispatch={dispatch} />
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
                <>
                    <ToggleButtonGroup
                        value={infraMode}
                        exclusive
                        onChange={(_, val) => {
                            setInfraMode(val);
                            if (val === "vm") {
                                setColumnVisibility({
                                    ...Object.fromEntries(
                                        Object.keys(KUBE_COLUMNS).map(k => [k, false])
                                    ),
                                    ...Object.fromEntries(Object.keys(VM_COLUMNS).map(k => [k, true]))
                                });
                            } else if (val === "kube") {
                                setColumnVisibility({
                                    ...Object.fromEntries(Object.keys(VM_COLUMNS).map(k => [k, false])),
                                    ...Object.fromEntries(Object.keys(KUBE_COLUMNS).map(k => [k, true]))
                                });
                            }
                        }}
                        size="small"
                        color="secondary"
                    >
                        <ToggleButton value="vm">VM</ToggleButton>
                        <ToggleButton value="kube">Kube</ToggleButton>
                    </ToggleButtonGroup>
                    <GreenItToggleButton viewMode={viewMode} setViewMode={setViewMode} />
                    <ButtonCsvExport table={table} onExport={onExport} />
                </>
            )}
            fetch={refetch}
            enableHiding={true}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
        />
    );
};
