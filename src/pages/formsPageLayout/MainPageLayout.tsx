import { Paper, Typography } from "@mui/material";
import { type ReactNode } from "react";

interface MainFormPageLayoutProps {
    title: string;
    formulaires: ReactNode;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function MainFormPageLayout(props: Readonly<MainFormPageLayoutProps>) {
    return (
        <Paper
            sx={{
                padding: 4,
                margin: "2rem auto",
                maxWidth: 600,
                borderRadius: 3,
                boxShadow: 6,
                backgroundColor: "background.paper",
                "& .MuiTextField-root": { marginBottom: 2 }
            }}
        >
            <Typography variant="h4" sx={{ marginBottom: 3, textAlign: "center" }}>
                {props.title}
            </Typography>
            <form
                onSubmit={props.onSubmit}
                style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
                {props.formulaires}
            </form>
        </Paper>
    );
}
