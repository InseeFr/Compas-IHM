import type { MRT_RowData, MRT_SortingFn } from "material-react-table";
import type { JSX } from "react";

export interface ColumnTable<U extends MRT_RowData> {
    header: string;
    accessorKey: string;
    id?: string;
    enableColumnFilter?: false | true;
    filterVariant?: "multi-select" | "select";
    filterSelectOptions?: string[];
    Cell?: ({ row, column }: { row: { original: U }; column: { id?: string } }) => JSX.Element | null;
    sortingFn?: MRT_SortingFn<U>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    accessorFn?: (originalRow: U) => any;
}
export interface Pagination {
    pagination: {
        pageIndex: number;
        pageSize: number;
    };
}
