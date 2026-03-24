import { TextField } from "@mui/material";
import type { JSX } from "react";
import type { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";

interface CommentaryProps<U extends FieldValues> {
    isRequired: boolean;
    register: UseFormRegister<U>;
    errors: FieldErrors<U>;
    commentaryMessage: string;
}

export default function CommentaryLayout<U extends FieldValues>(
    props: Readonly<CommentaryProps<U>>
): JSX.Element {
    return (
        <TextField
            label="Commentaire"
            multiline
            rows={3}
            required={props.isRequired}
            helperText={props.isRequired ? props.commentaryMessage : ""}
            error={!!props.errors.commentaire}
            {...props.register("commentaire" as Path<U>, {
                required: props.isRequired ? props.commentaryMessage : false
            })}
            fullWidth
            margin="normal"
        />
    );
}
