import { Box, Button } from "@mui/material";
import type { MRT_RowData, MRT_TableInstance } from "material-react-table";

interface ButtonCsvExportProps<T extends MRT_RowData> {
    table: MRT_TableInstance<T>;
    onExport: (table: MRT_TableInstance<T>) => void;
}

export default function ButtonCsvExport<T extends MRT_RowData>({
    table,
    onExport
}: Readonly<ButtonCsvExportProps<T>>) {
    return (
        <Box display="flex" alignItems="center" gap={1}>
            <Button
                data-testid={"button-export-csv"}
                variant="contained"
                color="secondary"
                onClick={() => onExport(table)}
            >
                Exporter en CSV
            </Button>
        </Box>
    );
}
