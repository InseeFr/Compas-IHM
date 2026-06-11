import type { TableCellProps } from "@mui/material";
import type { MRT_Cell, MRT_Row, MRT_RowData } from "material-react-table";

export const generateAriaLabelCell = (
    titleColumn: string,
    appName: string,
    valueCell: string,
    isModule?: boolean,
    currentLineName?: string
): string => {
    const nameToCheck = currentLineName ?? appName;
    if (isModule && valueCell === nameToCheck) return `Module: ${valueCell} Application: ${appName}`;
    if (valueCell === nameToCheck) return `Application: ${valueCell}`;
    if (isModule) return `${titleColumn} du module ${appName} : ${valueCell}`;
    return `${titleColumn} de l'application ${appName} : ${valueCell}`;
};

export const muiAriaCell = <T extends MRT_RowData>({
    title,
    cell,
    row
}: Readonly<{ title: string; cell: MRT_Cell<T, unknown>; row: MRT_Row<T> }>): TableCellProps => {
    const parentRow = row.getParentRow?.() ?? null;
    const parentAppName = parentRow ? parentRow.original.applicationName : row.original.applicationName;
    const currentLineName = row.original.applicationName;

    return {
        "aria-label": generateAriaLabelCell(
            title,
            parentAppName,
            cell.getValue<string>(),
            row.original.isModule,
            currentLineName
        )
    };
};
