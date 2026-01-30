import { FormControl, FormLabel } from "@mui/material";
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

interface FormPageLayoutProps<T extends FieldValues, TName extends Path<T>> {
    title: string;
    label?: string;
    required?: boolean;
    control: Control<T>;
    name: TName;
    render: ({
        field,
        fieldState,
        formState
    }: {
        field: ControllerRenderProps<T, TName>;
        fieldState: ControllerFieldState;
        formState: UseFormStateReturn<T>;
    }) => React.ReactElement;
}

export function FormPageLayout<T extends FieldValues, TName extends Path<T>>(
    props: Readonly<FormPageLayoutProps<T, TName>>
): JSX.Element {
    return (
        <FormControl sx={{ m: 1, width: 500 }} required={props.required}>
            <FormLabel id={props.label} tabIndex={0} aria-label={props.title}>
                {props.title}
            </FormLabel>
            <Controller
                control={props.control}
                name={props.name}
                render={controllerProps => props.render(controllerProps)}
            />
        </FormControl>
    );
}
