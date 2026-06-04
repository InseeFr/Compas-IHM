import { TextField } from "@mui/material";
import type { JSX } from "react";
import type { Control, FieldErrors, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

interface CommentaryProps<U extends FieldValues> {
    isRequired: boolean;
    control: Control<U>;
    errors: FieldErrors<U>;
    commentaryMessage: string;
}

export default function CommentaryLayout<U extends FieldValues>(
    props: Readonly<CommentaryProps<U>>
): JSX.Element {
    return (
        <Controller
            name={"commentaire" as Path<U>}
            control={props.control}
            rules={{
                validate: value =>
                    !props.isRequired ||
                    (typeof value === "string" && value.trim() !== "") ||
                    props.commentaryMessage
            }}
            render={({ field }) => (
                <TextField
                    {...field}
                    label="Commentaire"
                    multiline
                    rows={3}
                    required={props.isRequired}
                    helperText={props.isRequired ? props.commentaryMessage : ""}
                    error={!!props.errors.commentaire}
                    fullWidth
                    margin="normal"
                />
            )}
        />
    );
}
