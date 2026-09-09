import type { ViewMode } from "constantes/constantes";
import { useState } from "react";
import { useFilterContext } from "store/filterContext";
import { filterByApplicationName } from "constantes/constantes";

import {
    columnsGreenIt,
    onExport,
    paginationConfig,
    filteredViewMode,
    formatIndicateur
} from "./greenItConfig";

import TablePageLayout from "components/TablePageLayout";
import ButtonCsvExport from "components/ButtonCsvExport";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useQueryIndicators } from "hooks/useQueryIndicators";
import { GreenItDate } from "components/GreenItDate";
import { FilterSidebar } from "components/filtersLayout/FilterSideBar";
import { GreenItToggleButton } from "./GreenItCell";
import { useTendanceContext } from "store/tendance-context";
import {
    getApplications,
    getApplications1,
    type GetApplicationsParams,
} from "todos-api/client.gen";
import { useInitTendanceDates, useValidDates } from "hooks/useCompasDataDate";

const VM_COLUMNS = {
    _nbVmSort: true,
    _diskSort: true,
    _diskUsedSort: true,
    _cpuSort: true,
    _ramSort: true,
    _consoSort: true,
    _asUsedSort: true,
    _asAllocatedSort: true
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
    const { stateTendance, dispatchTendance } = useTendanceContext();
    const { validDates, validDatesSet } = useValidDates();

    useInitTendanceDates(validDates, dispatchTendance);

    const [viewMode, setViewMode] = useState<ViewMode>("global");
    const columns = columnsGreenIt(viewMode);
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
        _consoSort: false,
        _asUsedSort: false,
        _asAllocatedSort: false
    });
    const [infraMode, setInfraMode] = useState<"KUBE" | "VM">("KUBE");

    const handleInfraModeChange = (_: unknown, val: "KUBE" | "VM" | null) => {
        if (!val) return;
        setInfraMode(val);

        const newColumnVisibility = { ...columnVisibility };

        if (val === "VM") {
            Object.keys(KUBE_COLUMNS).forEach(key => {
                newColumnVisibility[key] = false;
            });
            Object.keys(VM_COLUMNS).forEach(key => {
                newColumnVisibility[key] = true;
            });
        } else if (val === "KUBE") {
            Object.keys(VM_COLUMNS).forEach(key => {
                newColumnVisibility[key] = false;
            });
            Object.keys(KUBE_COLUMNS).forEach(key => {
                newColumnVisibility[key] = true;
            });
        }

        setColumnVisibility(newColumnVisibility);
    };

     const fetchData = async () => {
        try {
            const params: GetApplicationsParams = {
                origine: stateTendance.dateFin,
                passee: stateTendance.dateDebut
            };
            
            const [applications, appGreenItKube, appGreenItVm] = await Promise.all([
                getApplications1(),
                getApplications("KUBE", params),
                getApplications("VM", params)
            ]);

            const appNameLongMap = new Map(
                applications.map(app => [app.idApplication, app.appNameLong])
            );

            return formatIndicateur(appGreenItKube, appGreenItVm, appNameLongMap);
        } catch (error) {
            console.error("Erreur lors de la récupération des données: ", error);
            throw error;
        }
    };

    const { data, isLoading, filteredData, refetch } = useQueryIndicators({
        queryKey: ["GreenItIndicator", stateTendance.dateDebut, stateTendance.dateFin],
        fetchData,
        hasModules: false
    });

    return (
        <TablePageLayout
            titleTable="Table Indicateur Écoconception"
            filters={
                <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                    <FilterSidebar
                        data={data}
                        state={state}
                        dispatch={dispatch}
                        stateTendance={stateTendance}
                        dispatchTendance={dispatchTendance}
                        validDatesSet={validDatesSet}
                    />
                    <GreenItDate
                        lastDate={stateTendance.dateFin}
                        penultimateDate={stateTendance.dateDebut}
                    />
                </Box>
            }
            data={filteredViewMode(viewMode, filteredData)}
            isLoading={isLoading}
            columns={columns}
            paginationConfig={paginationConfig}
            rowId={row => row.applicationId + row.applicationName}
            renderTopCustom={({ table }) => (
                <>
                    <ToggleButtonGroup
                        value={infraMode}
                        exclusive
                        onChange={handleInfraModeChange}
                        size="small"
                        color="secondary"
                    >
                        <ToggleButton value="VM">VM</ToggleButton>
                        <ToggleButton value="KUBE">Kube</ToggleButton>
                    </ToggleButtonGroup>
                    <GreenItToggleButton viewMode={viewMode} setViewMode={setViewMode} />
                    <ButtonCsvExport table={table} onExport={onExport} />
                </>
            )}
            fetch={refetch}
            enableHiding={true}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            filterPredicate={filterByApplicationName}
        />
    );
};
