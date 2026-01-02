import { Box } from "@mui/material";
import {
    MaterialReactTable,
    type MRT_ColumnDef,
    type MRT_ColumnFiltersState,
    type MRT_Row,
    type MRT_RowData,
    type MRT_TableInstance
} from "material-react-table";
import type { OnChangeFn } from "@tanstack/react-table";
import type { JSX } from "react";
import type { Pagination } from "../models/table-model";

interface TablePageLayoutProps<T extends MRT_RowData> {
    titleTable: string;
    columns: MRT_ColumnDef<T>[];
    data: T[];
    paginationConfig: Pagination;
    rowId?: (originalRow: T, index?: number, parentRow?: MRT_Row<T>) => string;
    renderTopCustom?: (props: { table: MRT_TableInstance<T> }) => React.ReactNode;
    columnFilters?: MRT_ColumnFiltersState;
    onColumnFiltersChange?: OnChangeFn<MRT_ColumnFiltersState>;
}

export default function TablePageLayout<T extends MRT_RowData>(
    props: Readonly<TablePageLayoutProps<T>>
): JSX.Element {
    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "100vh",
                padding: 0,
                margin: 0
            }}
        >
            {<h1 style={{ textAlign: "center" }}>{props.titleTable}</h1>}

            <MaterialReactTable
                data={props.data}
                columns={props.columns}
                enableExpanding={true}
                enableColumnFilters={true}
                enableHiding={false}
                enableDensityToggle={false}
                state={{
                    columnFilters: props.columnFilters,
                    showColumnFilters: true
                }}
                initialState={{
                    pagination: props.paginationConfig.pagination,
                    showColumnFilters: true
                }}
                onColumnFiltersChange={props.onColumnFiltersChange}
                getRowId={props.rowId}
                renderTopToolbarCustomActions={props.renderTopCustom}
            />
        </Box>
    );
}
