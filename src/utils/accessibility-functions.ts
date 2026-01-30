import type { TableCellProps } from "@mui/material";
import type { MRT_Cell, MRT_Row, MRT_RowData } from "material-react-table";

export const generateAriaLabelCell = (
    titleColumn: string,
    appName: string,
    valueCell: string,
    isModule?: boolean
): string => {
    if (isModule && valueCell === appName) return `Module: ${valueCell}`;
    if (valueCell === appName) return `Application: ${valueCell}`;
    if (isModule) return `${titleColumn} du module ${appName} : ${valueCell}`;
    return `${titleColumn} de l'application ${appName} : ${valueCell}`;
};

export const muiAriaCell = <T extends MRT_RowData>({
    title,
    cell,
    row
}: Readonly<{ title: string; cell: MRT_Cell<T, unknown>; row: MRT_Row<T> }>): TableCellProps => ({
    "aria-label": generateAriaLabelCell(
        title,
        row.original.applicationName,
        cell.getValue<string>(),
        row.original.isModule
    )
});
