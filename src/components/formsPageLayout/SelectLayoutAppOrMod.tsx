import { Checkbox, ListItemText, MenuItem, Select, type SelectChangeEvent } from "@mui/material";
import type { JSX, ReactNode } from "react";

const ALL: string = "__all__";

interface ISelectLayoutProps<U> {
    children: ReactNode;
    id: string;
    labelId: string;
    selected: U[];
    allIds: U[];
    allSelected: boolean;
    renderValue: (item: U[]) => JSX.Element;
    onChange: (value: U[]) => void;
}
export default function SelectLayoutAppOrMod<U>(props: Readonly<ISelectLayoutProps<U>>): JSX.Element {
    const handleChange = (e: SelectChangeEvent<U[]>) => {
        const value = e.target.value as (U | string)[];
        if (value.includes(ALL)) {
            props.onChange(props.allSelected ? [] : props.allIds);
        } else {
            props.onChange(value as U[]);
        }
    };

    return (
        <Select
            id={props.id}
            labelId={props.labelId}
            multiple
            value={props.selected}
            MenuProps={{
                PaperProps: {
                    style: {
                        maxHeight: 48 * 4.5 + 8,
                        width: 300
                    }
                }
            }}
            onChange={handleChange}
            renderValue={props.renderValue}
        >
            <MenuItem value={ALL}>
                <Checkbox
                    checked={props.allSelected}
                    indeterminate={props.selected.length > 0 && !props.allSelected}
                />
                <ListItemText primary="Tout sélectionner" />
            </MenuItem>
            {props.children}
        </Select>
    );
}
