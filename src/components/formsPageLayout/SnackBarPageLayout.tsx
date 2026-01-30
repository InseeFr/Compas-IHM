import { Snackbar } from "@mui/material";
import type { JSX } from "react";

interface SnackBarPageLayoutProps {
    openSnack: boolean;
    onClose: () => void;
    render: JSX.Element;
    autoDuration?: number;
}

export function SnackBarPageLayout(props: Readonly<SnackBarPageLayoutProps>): JSX.Element {
    return (
        <Snackbar
            open={props.openSnack}
            autoHideDuration={props.autoDuration ?? 3000}
            onClose={props.onClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
            {props.render}
        </Snackbar>
    );
}
