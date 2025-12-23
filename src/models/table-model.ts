import type { JSX } from "react";

export interface ColumnTable<U> {
    header: string;
    accessorKey: string;
    Cell?: ({row} : {row: {original: U}}) => JSX.Element;
}

export interface Pagination{
    pagination : {
        pageIndex: number,
        pageSize: number,
    }
}