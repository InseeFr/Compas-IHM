import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    type SelectChangeEvent
} from "@mui/material";
import type { JSX } from "react";
import AccessTimeIcon from "@mui/icons-material/CalendarMonth";

export interface TendancePeriodeFormProps {
    periode: string;
    handleChange: (event: SelectChangeEvent<string>) => void;
}

export function TendancePeriodeForm({
    periode,
    handleChange
}: Readonly<TendancePeriodeFormProps>): JSX.Element {
    const PERIODE_TENDANCE: string[] = ["VEILLE", "MOIS", "ANNEE", "TRIMESTRE", "SEMESTRE"];

    return (
        <FormControl
            size="medium"
            sx={{
                minWidth: 160,
                bgcolor: "background.paper",
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.2s",
                    "&:hover": {
                        boxShadow: 1
                    },
                    "&.Mui-focused": {
                        boxShadow: 2
                    }
                }
            }}
        >
            <InputLabel
                id="label-tendance"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5
                }}
            >
                <AccessTimeIcon fontSize="small" />
                Période
            </InputLabel>
            <Select
                labelId="label-tendance"
                id="id-tendance"
                value={periode}
                label={"Période"}
                onChange={handleChange}
            >
                {PERIODE_TENDANCE.map(period => (
                    <MenuItem key={period} value={period}>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                            <Typography variant="body1" fontWeight={500}>
                                {period}
                            </Typography>
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
