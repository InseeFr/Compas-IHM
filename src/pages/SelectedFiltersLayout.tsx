import {
    alpha,
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Typography,
    type SelectChangeEvent
} from "@mui/material";
import type { JSX } from "react";

interface Filter<T> {
    title: string;
    selectedOne: string;
    onChange: (event: SelectChangeEvent<string>) => void;
    dataFilter: T[];
    getValue: (item: T) => string;
}

interface SelectedFiltersLayoutProps<T> {
    filters: Filter<T>[];
}

export function SelectedFiltersLayout<T>(props: Readonly<SelectedFiltersLayoutProps<T>>): JSX.Element {
    return (
        <Box px={{ xs: 2, md: 3 }} py={3}>
            <Paper
                elevation={0}
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 5,
                    backdropFilter: "blur(6px)",
                    borderRadius: 3,
                    border: t => `1px solid ${alpha(t.palette.divider, 0.8)}`,
                    p: 2,
                    mb: 3,

                    mx: "auto",
                    maxWidth: 900,
                    width: "100%"
                }}
            >
                <Typography variant="h6" fontWeight={300} mb={2}>
                    Filtres
                </Typography>
                <Stack direction="row" spacing={2}>
                    {props.filters.map(filter => {
                        const values = Array.from(
                            new Set(filter.dataFilter.map(item => filter.getValue(item)).filter(Boolean))
                        ).sort((a, b) => a.localeCompare(b));

                        return (
                            <FormControl style={{ minWidth: 200 }} key={filter.title}>
                                <InputLabel>{filter.title}</InputLabel>
                                <Select
                                    value={filter.selectedOne}
                                    onChange={filter.onChange}
                                    label={filter.title}
                                >
                                    <MenuItem>Tous</MenuItem>
                                    {values.map(value => (
                                        <MenuItem key={value} value={value}>
                                            {value}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        );
                    })}
                </Stack>
            </Paper>
        </Box>
    );
}
