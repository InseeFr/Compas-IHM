import { Box, FormControl, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import type { JSX } from "react";
import { parse } from "date-fns";

export interface TendancePeriodeFormProps {
    dateFin: string;
    dateDebut: string;
    handleChange: (field: "dateFin" | "dateDebut", value: Date | null) => void;
}

export function TendancePeriodeForm({
    dateFin,
    dateDebut,
    handleChange
}: Readonly<TendancePeriodeFormProps>): JSX.Element {
    return (
        <FormControl
            size="medium"
            sx={{
                minWidth: 300,
                bgcolor: "background.paper",
                borderRadius: 1,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 2
            }}
        >
            {/* Label remplacé */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mr: 1 }}>
                <CalendarMonthIcon fontSize="small" />
                <Typography variant="body2" fontWeight={500}>
                    Période
                </Typography>
            </Box>

            {/* Date début */}
            <DatePicker
                label="Date début"
                value={dateDebut ? parse(dateDebut, "dd/MM/yyyy", new Date()) : null}
                onChange={newValue => handleChange("dateDebut", newValue)}
                slotProps={{
                    textField: { size: "small" }
                }}
            />

            {/* Date fin */}
            <DatePicker
                label="Date fin"
                value={dateFin ? parse(dateFin, "dd/MM/yyyy", new Date()) : null}
                onChange={newValue => handleChange("dateFin", newValue)}
                slotProps={{
                    textField: { size: "small" }
                }}
            />
        </FormControl>
    );
}
