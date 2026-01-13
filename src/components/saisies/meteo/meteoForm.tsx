import { Alert, Button, Stack, TextField } from "@mui/material";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";

import { FormPageLayout } from "pages/formsPageLayout/FormPageLayout";
import { MainFormPageLayout } from "pages/formsPageLayout/MainPageLayout";
import { SnackBarPageLayout } from "pages/formsPageLayout/SnackBarPageLayout";

import { creerMeteo, getApplications1, type DemandeCreationMeteo } from "todos-api/client.gen";

import { RenderAppSelections, RenderMeteoSelection } from "./meteoCell";
import { useFilterContext } from "store/filterContext";
import { Filters } from "components/Filters";
import type { AppsIndicateur } from "models/indicateurs";
import { applyDevFilters } from "utils/filters-functions";

export function MeteoForm() {
    const [apps, setApps] = useState<AppsIndicateur[]>([]);
    const { state, dispatch } = useFilterContext();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
    const [alertMessage, setAlertMessage] = useState("");

    useEffect(() => {
        async function fetchData() {
            const getApps = await getApplications1();
            const mappedApps: AppsIndicateur[] = getApps
                .map(app => ({
                    idApplication: app.idApplication ?? 0,
                    appName: app.appName ?? "",
                    domaine: app.domaineSndi ?? "",
                    domaineFonc: app.domaineFonctionnel ?? "",
                    sndi: app.sndi ?? ""
                }))
                .sort((a, b) => a.appName.localeCompare(b.appName));

            setApps(mappedApps);
        }
        fetchData();
    }, []);

    const filteredData = useMemo(() => apps.filter(item => applyDevFilters(item, state)), [apps, state]);
    const defaultValues: DemandeCreationMeteo = {
        valeurMeteo: 4,
        idsApplication: [],
        date: new Date().toISOString().split("T")[0],
        commentaire: ""
    };

    const {
        control,
        handleSubmit,
        register,
        reset,
        formState: { errors }
    } = useForm<DemandeCreationMeteo>({
        defaultValues
    });

    const typeMeteo = useWatch({
        control,
        name: "valeurMeteo"
    });

    const isCommentaryRequired: boolean = typeMeteo !== undefined && [1, 2].includes(typeMeteo);

    const creer: SubmitHandler<DemandeCreationMeteo> = async data => {
        if (!data.idsApplication || data.idsApplication.length === 0) {
            setSnackbarSeverity("error");
            setAlertMessage("Veuillez sélectionner au moins une application.");
            setSnackbarOpen(true);
            return;
        }

        try {
            await creerMeteo(data);
            setSnackbarSeverity("success");
            setAlertMessage("Création de la météo réussie.");
            setSnackbarOpen(true);
            reset(defaultValues);
        } catch (error) {
            console.error("Erreur création météo:", error);
            setSnackbarSeverity("error");
            setAlertMessage("Une erreur est survenue lors de la création météo.");
            setSnackbarOpen(true);
        }
    };

    return (
        <>
            <Filters state={state} dispatch={dispatch} data={apps} />

            <MainFormPageLayout
                title="Saisir une météo"
                formulaires={
                    <>
                        <FormPageLayout
                            title="Choisir les applications"
                            label="Applications"
                            control={control}
                            name="idsApplication"
                            render={field => RenderAppSelections(field, filteredData)}
                        />

                        <FormPageLayout
                            title="Météo ressentie"
                            label="Choisir la météo"
                            control={control}
                            name="valeurMeteo"
                            render={field => RenderMeteoSelection(field)}
                        />

                        <TextField
                            label="Commentaire"
                            multiline
                            rows={3}
                            required={isCommentaryRequired}
                            error={!!errors.commentaire}
                            helperText={errors.commentaire?.message}
                            {...register("commentaire", {
                                required: isCommentaryRequired
                                    ? "Le commentaire est obligatoire pour cette météo"
                                    : false
                            })}
                            fullWidth
                            margin="normal"
                        />

                        <Stack direction="row" spacing={2} justifyContent="center" sx={{ marginTop: 2 }}>
                            <Button variant="outlined" onClick={() => reset(defaultValues)}>
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
                        {alertMessage}
                    </Alert>
                }
            />
        </>
    );
}
