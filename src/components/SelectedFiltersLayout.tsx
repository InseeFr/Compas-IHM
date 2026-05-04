import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from "@mui/material";
import type { JSX } from "react";
import "styles/filter.css";

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
        <div className="filters-left-container">
            {props.filters.map((filter, index) => {
                const labelId: string = `filter-label-${index}`;
                const selectId: string = `filter-select-${index}`;
                const values = Array.from(
                    new Set(filter.dataFilter.map(item => filter.getValue(item)).filter(Boolean))
                ).sort((a, b) => a.localeCompare(b));

                return (
                    <FormControl className="filter-item" key={filter.title}>
                        <InputLabel id={labelId}>{filter.title}</InputLabel>
                        <Select
                            id={selectId}
                            labelId={labelId}
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
        </div>
    );
}
