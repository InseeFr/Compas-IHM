import { FormControl, Typography } from "@mui/material";
import {
    Controller,
    type Control,
    type ControllerFieldState,
    type ControllerRenderProps,
    type FieldValues,
    type Path,
    type UseFormStateReturn
} from "react-hook-form";
import type { JSX } from "react";

interface FormPageLayoutProps<T extends FieldValues> {
    title: string;
    label?: string;
    control: Control<T>;
    name: Path<T>;
    render: ({
        field,
        fieldState,
        formState
    }: {
        field: ControllerRenderProps<T, Path<T>>;
        fieldState: ControllerFieldState;
        formState: UseFormStateReturn<T>;
    }) => React.ReactElement;
}

export function FormPageLayout<T extends FieldValues>(
    props: Readonly<FormPageLayoutProps<T>>
): JSX.Element {
    return (
        <FormControl sx={{ m: 1, width: 500 }}>
            <Typography variant="h6">{props.title}</Typography>
            <Controller control={props.control} name={props.name} render={props.render} />
        </FormControl>
    );
}
