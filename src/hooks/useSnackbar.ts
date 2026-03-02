import { useState } from "react";

interface SnackbarState {
    open: boolean;
    severity: "success" | "error";
    message: string;
}

export function useSnackbar() {
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        severity: "success",
        message: ""
    });

    const showSuccess = (message: string) =>
        setSnackbar({ open: true, severity: "success", message });

    const showError = (message: string) =>
        setSnackbar({ open: true, severity: "error", message });

    const close = () => setSnackbar(prev => ({ ...prev, open: false }));

    return { snackbar, showSuccess, showError, close };
}