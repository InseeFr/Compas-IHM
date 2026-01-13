import { handleExportCsv, escapeCsvValue, flattenRows, formatMainCsvRow } from "utils/exportCsv";
import { CSV_HEADERS } from "constantes/constantes-csv";
import type { GlobalIndicator } from "models/indicateurs";
import type { MRT_Row, MRT_TableInstance } from "material-react-table";

export const onExport = (table: MRT_TableInstance<GlobalIndicator>): void => {
    const headers = CSV_HEADERS.map(escapeCsvValue);

    const filteredRows: MRT_Row<GlobalIndicator>[] = flattenRows(table.getExpandedRowModel().rows);

    const csvData: string[] = filteredRows.map(row => formatMainCsvRow(row));

    handleExportCsv("indicateurs-globaux", headers, csvData);
};
