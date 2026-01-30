import { Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { type ReactNode } from "react";
import "styles/formulaire.css";

interface MainFormPageLayoutProps {
    title: string;
    formulaires: ReactNode;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    reset: () => void;
    filtres: ReactNode;
}

export function MainFormPageLayout(props: Readonly<MainFormPageLayoutProps>) {
    return (
        <Paper className="main-paper">
            <Typography variant="h4" className="main-title" tabIndex={0} aria-label={props.title}>
                {props.title}
            </Typography>

            <Typography
                tabIndex={0}
                aria-label="Veuillez renseigner les champs obligatoires (*)"
                className="main-subtitle"
            >
                Veuillez renseigner les champs obligatoires *
            </Typography>

            <Divider sx={{ marginBottom: 3 }} />

            <Typography tabIndex={0} aria-label="Filtres" className="filters-title">
                Filtres
            </Typography>
            <Paper variant="outlined" className="filters-container">
                {props.filtres}
            </Paper>

            <form onSubmit={props.onSubmit} className="form-stack">
                {props.formulaires}

                <Stack direction="row" className="button-stack">
                    <Button
                        variant="outlined"
                        onClick={props.reset}
                        color="secondary"
                        className="button-outlined"
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        className="button-contained"
                    >
                        Saisir
                    </Button>
                </Stack>
            </form>
        </Paper>
    );
}
