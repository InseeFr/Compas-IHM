import {
    MaterialReactTable,
    type MRT_ColumnDef,
    type MRT_Row,
    type MRT_RowData,
    type MRT_TableInstance
} from "material-react-table";
import { MRT_Localization_FR } from "material-react-table/locales/fr";
import { type JSX, type ReactNode } from "react";
import type { Pagination } from "../models/table-model";
import AnimatedTitle from "./AnimatedTitleLayout";
import { Paper, Stack } from "@mui/material";
import "styles/tablePageLayout.css";

interface TablePageLayoutProps<T extends MRT_RowData> {
    titleTable: string;
    columns: MRT_ColumnDef<T>[];
    data: T[];
    isLoading: boolean;
    paginationConfig: Pagination;
    reactKey?: string;
    rowId?: (originalRow: T, index?: number, parentRow?: MRT_Row<T>) => string;
    subRow?: (originalRow: T, index: number) => T[] | undefined;
    renderTopCustom: (props: { table: MRT_TableInstance<T> }) => React.ReactNode;
    filters: ReactNode;
}

export default function TablePageLayout<T extends MRT_RowData>(
    props: Readonly<TablePageLayoutProps<T>>
): JSX.Element {
    return (
        <Paper className="table-page-layout">
            <AnimatedTitle text={props.titleTable} />
            <MaterialReactTable
                key={props.reactKey}
                data={props.data}
                columns={props.columns}
                enableFullScreenToggle={false}
                enableExpanding={true}
                enableColumnFilters={false}
                enableColumnActions={false}
                enableHiding={false}
                enableGlobalFilter={true}
                enableDensityToggle={false}
                state={{
                    isLoading: props.isLoading
                }}
                initialState={{
                    pagination: props.paginationConfig.pagination,
                    showGlobalFilter: true
                }}
                getRowId={props.rowId}
                getSubRows={props.subRow}
                renderTopToolbarCustomActions={({ table }) => (
                    <Stack
                        direction="row"
                        flexWrap="wrap"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        width={"100%"}
                        gap={2}
                    >
                        <Stack direction="row" gap={4}>
                            {props.filters}
                        </Stack>
                        <Stack direction={"row"} gap={10}>
                            {props.renderTopCustom({ table })}
                        </Stack>
                    </Stack>
                )}
                localization={MRT_Localization_FR}
            />
        </Paper>
    );
}
