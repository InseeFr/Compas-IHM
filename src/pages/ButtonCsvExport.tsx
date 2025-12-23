import { Box, Button } from "@mui/material";

interface ButtonCsvExportProps {
    onExport: () => void;
}

export default function ButtonCsvExport({ onExport }: Readonly<ButtonCsvExportProps>) {
    return (
        <Box display="flex" alignItems="center" gap={1}>
        <Button variant="contained" color="primary" onClick={onExport}>
            Exporter en CSV
        </Button>
        </Box>
    );
}
