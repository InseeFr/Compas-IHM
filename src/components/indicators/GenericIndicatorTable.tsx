/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFilterContext } from "store/filterContext";
import { Filters } from "pages/Filters";
import TablePageLayout from "components/TablePageLayout";
import ButtonCsvExport from "components/ButtonCsvExport";
import { Box } from "@mui/material";
import type { Pagination } from "models/table-model";
import type { AllIndicators } from "models/indicateurs";
import { useQueryIndicators } from "hooks/useQueryIndicators";
import { useTendanceContext } from "store/tendance-context";
import { TendancePeriodeForm } from "./TendanceForm";
import { Fragment } from "react/jsx-runtime";
import { format } from "date-fns";

interface GenericIndicatorTableProps {
    title: string;
    fetchData: () => Promise<AllIndicators[] | undefined>;
    columns: any[];
    queryKey: string[];
    hasModules?: boolean;
    rowId?: (row: any) => string;
    subRow?: (row: any) => any[] | undefined;
    onExport?: (table: any) => void;
    paginationConfig: Pagination;
    customFilters?: React.ReactNode;
}

export const GenericIndicatorTable = ({
    title,
    fetchData,
    columns,
    queryKey,
    hasModules = false,
    rowId,
    subRow,
    onExport,
    paginationConfig,
    customFilters
}: GenericIndicatorTableProps) => {
    const { state, dispatch } = useFilterContext();
    const { stateTendance, dispatchTendance } = useTendanceContext();

    const queryKeyProps = [...queryKey];
    const { data, isLoading, modulesByApp, filteredData, refetch } = useQueryIndicators({
        queryKey: queryKeyProps,
        fetchData,
        hasModules
    });

    const defaultRowId = (row: any) => {
        if (row?.isModule) {
            return `${row.parentApplication}-${row.applicationName}`;
        }
        return row.applicationName || row.modName;
    };

    const defaultSubRow = (row: any) => {
        if (row?.isModule) {
            return undefined;
        }
        return modulesByApp[row.applicationName];
    };

    // Logique par défaut pour filtrer les modules si hasModules est true
    const processedData = hasModules
        ? (filteredData as any[]).filter(item => (item?.isModule ? null : item))
        : filteredData;

    return (
        <TablePageLayout
            titleTable={title}
            filters={
                customFilters ? (
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                        <Filters data={data} state={state} dispatch={dispatch} />

                        {customFilters}
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                        <Filters data={data} state={state} dispatch={dispatch} />
                    </Box>
                )
            }
            data={processedData}
            fetch={refetch}
            columns={columns}
            isLoading={isLoading}
            paginationConfig={paginationConfig}
            rowId={rowId || defaultRowId}
            subRow={hasModules ? subRow || defaultSubRow : undefined}
            renderTopCustom={({ table }) => (
                <Fragment>
                    <TendancePeriodeForm
                        dateFin={stateTendance.dateFin}
                        dateDebut={stateTendance.dateDebut}
                        handleChange={(field, value) => {
                            const formatted = value ? format(value, "dd/MM/yyyy") : "";
                            if (field === "dateFin") {
                                dispatchTendance({ type: "SET_DATE_FIN", payload: formatted });
                            } else {
                                dispatchTendance({ type: "SET_DATE_DEBUT", payload: formatted });
                            }
                        }}
                    />
                    {onExport && <ButtonCsvExport table={table} onExport={onExport} />}
                </Fragment>
            )}
        />
    );
};

export default GenericIndicatorTable;
