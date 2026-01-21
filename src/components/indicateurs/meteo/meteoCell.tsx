import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    type SelectChangeEvent
} from "@mui/material";
import type { MeteoIndicateur } from "models/indicateurs";
import { ToolTipLayout } from "pages/ToolTipLayout";
import React, { type JSX } from "react";
import { getMeteoIcon } from "utils/meteoIcon";
import AccessTimeIcon from "@mui/icons-material/CalendarMonth";

export function MeteoCell({
    row,
    column
}: Readonly<{ row: { original: MeteoIndicateur }; column: { id?: string } }>): JSX.Element | null {
    const mk = column.id?.replace("m-", "") ?? "";
    const points = row.original.byMonth?.[mk] ?? [];

    if (!points.length) return null;

    return (
        <React.Fragment>
            {points.map((p, i) => (
                <ToolTipLayout
                    key={`${p.date}-${i}`}
                    title={
                        <div style={{ whiteSpace: "pre-line" }}>
                            <strong>Date :</strong> {p.date}
                            {p.commentaire ? `\n${p.commentaire}` : ""}
                        </div>
                    }
                    content={
                        <Box
                            component="span"
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 24,
                                height: 24
                            }}
                        >
                            {getMeteoIcon(p.valeur)}
                        </Box>
                    }
                />
            ))}
        </React.Fragment>
    );
}

export function MeteoFormMonths({
    nbMois,
    handleChange,
    disabled = false
}: Readonly<{
    nbMois: number;
    handleChange: (event: SelectChangeEvent<number>) => void;
    disabled?: boolean;
}>): JSX.Element {
    const periods = [
        { value: 3, label: "3 mois" },
        { value: 6, label: "6 mois" },
        { value: 12, label: "12 mois" }
    ];

    return (
        <FormControl
            size="medium"
            disabled={disabled}
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
                id="input-label-meteo-mois"
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
                labelId="label-meteo-mois"
                id="id-meteo-mois"
                value={nbMois}
                label="Période mi"
                onChange={handleChange}
            >
                {periods.map(period => (
                    <MenuItem key={period.value} value={period.value}>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                            <Typography variant="body1" fontWeight={500}>
                                {period.label}
                            </Typography>
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
