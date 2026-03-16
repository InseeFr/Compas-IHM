// components/formsPageLayout/BaseFormLayout.tsx
import { Alert } from "@mui/material";
import { MainFormPageLayout } from "./MainPageLayout";
import { SnackBarPageLayout } from "./SnackBarPageLayout";
import { useSnackbar } from "hooks/useSnackbar";

interface BaseFormLayoutProps {
    title: string;
    filtres: React.ReactNode;
    formulaires: React.ReactNode;
    reset: () => void;
    onSubmit: () => void;
    snackbar: ReturnType<typeof useSnackbar>["snackbar"];
    onCloseSnackbar: () => void;
}

export function BaseFormLayout({
    title,
    filtres,
    formulaires,
    reset,
    onSubmit,
    snackbar,
    onCloseSnackbar
}: Readonly<BaseFormLayoutProps>) {
    return (
        <>
            <MainFormPageLayout
                title={title}
                filtres={filtres}
                formulaires={formulaires}
                reset={reset}
                onSubmit={onSubmit}
            />
            <SnackBarPageLayout
                openSnack={snackbar.open}
                onClose={onCloseSnackbar}
                autoDuration={4000}
                render={
                    <Alert severity={snackbar.severity} sx={{ width: "100%" }} onClose={onCloseSnackbar}>
                        {snackbar.message}
                    </Alert>
                }
            />
        </>
    );
}
