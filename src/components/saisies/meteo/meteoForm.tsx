import { Alert, Button, Stack, TextField } from "@mui/material";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FormPageLayout } from "pages/formsPageLayout/FormPageLayout";
import {
    creerMeteo,
    getApplications1,
    type Application,
    type DemandeCreationMeteo
} from "todos-api/client.gen";
import { useEffect, useState } from "react";
import { RenderAppSelections, RenderMeteoSelection } from "./meteoCell";
import { MainFormPageLayout } from "pages/formsPageLayout/MainPageLayout";
import { SnackBarPageLayout } from "pages/formsPageLayout/SnackBarPageLayout";

export function MeteoForm() {
    const [apps, setApps] = useState<Application[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
    const [alertMessage, setAlertMessage] = useState<string>("");
    const [idsApps, setIdsApps] = useState<number[]>([]);

    useEffect(() => {
        async function fetchData(): Promise<void> {
            const getApps: Application[] = await getApplications1();
            setApps([...getApps].sort((a, b) => (a.appName ?? "").localeCompare(b.appName ?? "")));
        }
        fetchData();
    }, []);

    const defaultValues: DemandeCreationMeteo = {
        valeurMeteo: 4,
        idsApplication: [],
        date: new Date().toISOString().split("T")[0],
        commentaire: ""
    };

    const { control, handleSubmit, register, reset } = useForm<DemandeCreationMeteo>({
        defaultValues: defaultValues
    });

    const creer: SubmitHandler<DemandeCreationMeteo> = async (data: DemandeCreationMeteo) => {
        if (!data.idsApplication || data.idsApplication.length === 0) {
            setSnackbarSeverity("error");
            setAlertMessage("Veuillez sélectionner au moins une application.");
            setSnackbarOpen(true);
            return;
        }
        try {
            await creerMeteo(data);
            setIdsApps(data.idsApplication ?? []);
            setSnackbarSeverity("success");
            setAlertMessage(
                `Création de Météo Réussie pour les applications: ${apps
                    .filter(
                        (app): app is Application & { idApplication: number } =>
                            app.idApplication !== undefined && idsApps.includes(app.idApplication)
                    )
                    .map(app => app.appName)
                    .join(", ")}`
            );
            setSnackbarOpen(true);
            reset(defaultValues);
        } catch (error) {
            console.log("Une erreur est survenue lors de la création météo: ", error);
            setSnackbarSeverity("error");
            setAlertMessage("Une erreur est survenue lors de la création météo");
            setSnackbarOpen(true);
        }
    };

    return (
        <>
            <MainFormPageLayout
                title="Saisir une météo"
                formulaires={
                    <>
                        <FormPageLayout<DemandeCreationMeteo>
                            title="Choisir les applications"
                            label="Applications"
                            control={control}
                            name="idsApplication"
                            render={field => RenderAppSelections(field, apps)}
                        />
                        <FormPageLayout<DemandeCreationMeteo>
                            title="Météo ressentie"
                            label="Choisir la météo"
                            control={control}
                            name="valeurMeteo"
                            render={field => RenderMeteoSelection(field)}
                        />
                        <TextField label="Commentaire" {...register("commentaire")} multiline rows={3} />
                        <Stack direction="row" spacing={2} justifyContent="center" sx={{ marginTop: 2 }}>
                            <Button onClick={() => reset(defaultValues)} variant="outlined">
                                Annuler
                            </Button>
                            <Button type="submit" variant="contained">
                                Saisir
                            </Button>
                        </Stack>
                    </>
                }
                onSubmit={handleSubmit(creer)}
            />
            <SnackBarPageLayout
                openSnack={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
                autoDuration={4000}
                render={
                    <Alert
                        severity={snackbarSeverity}
                        sx={{ width: "100%" }}
                        onClose={() => setSnackbarOpen(false)}
                    >
                        {alertMessage}{" "}
                    </Alert>
                }
            />
        </>
    );
}
