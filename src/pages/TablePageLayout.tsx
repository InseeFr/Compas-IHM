import { Box } from "@mui/material";
import {
    MaterialReactTable,
    type MRT_ColumnDef,
    type MRT_Row,
    type MRT_RowData,
    type MRT_TableInstance
} from "material-react-table";
import type { JSX } from "react";
import type { Pagination } from "../models/table-model";
import AnimatedTitle from "./AnimatedTitleLayout";

interface TablePageLayoutProps<T extends MRT_RowData> {
    titleTable: string;
    columns: MRT_ColumnDef<T>[];
    data: T[];
    paginationConfig: Pagination;
    rowId?: (originalRow: T, index?: number, parentRow?: MRT_Row<T>) => string;
    subRow?: (originalRow: T, index: number) => T[] | undefined;
    renderTopCustom?: (props: { table: MRT_TableInstance<T> }) => React.ReactNode;
}

export default function TablePageLayout<T extends MRT_RowData>(
    props: Readonly<TablePageLayoutProps<T>>
): JSX.Element {
    const isLoading: boolean = !props.data || props.data.length === 0;
    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "100vh",
                padding: 0,
                margin: 0
            }}
        >
            <AnimatedTitle text={props.titleTable} />
            <MaterialReactTable
                data={props.data}
                columns={props.columns}
                enableFullScreenToggle={false}
                enableExpanding={true}
                enableColumnFilters={false}
                enableHiding={false}
                enableDensityToggle={false}
                state={{
                    isLoading: isLoading
                }}
                initialState={{
                    pagination: props.paginationConfig.pagination,
                    isLoading: isLoading
                }}
                getRowId={props.rowId}
                getSubRows={props.subRow}
                renderTopToolbarCustomActions={props.renderTopCustom}
            />
        </Box>
    );
}
