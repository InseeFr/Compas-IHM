import type { JSX } from "react";

export interface ColumnTable<U> {
    header: string;
    accessorKey: string;
    enableColumnFilter?: false | true;
    filterVariant?: "multi-select" | "select";
    filterSelectOptions?: string[];
    Cell?: ({ row }: { row: { original: U } }) => JSX.Element;
}
export interface Pagination {
    pagination: {
        pageIndex: number;
        pageSize: number;
    };
}
