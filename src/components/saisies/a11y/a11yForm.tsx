import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { Alert, Button, Stack } from "@mui/material";
import { majInfosSaisiesA11Y, type InfosSaisiesA11yToSaveDTO } from "todos-api/client.gen";
import { FormPageLayout } from "pages/formsPageLayout/FormPageLayout";
import { MainFormPageLayout } from "pages/formsPageLayout/MainPageLayout";
import { SnackBarPageLayout } from "pages/formsPageLayout/SnackBarPageLayout";
import {
    RenderDateAudit,
    RenderDateDeclaration,
    RenderDeclaration,
    RenderModuleSelections,
    RenderScoreAudit,
    RenderTypeAudit
} from "components/saisies/a11y/a11yCell";
import { DEFAULT_TYPE_AUDIT, fetchModules, TYPES_AUDIT, type A11yFormValues } from "./a11yFormValues";
import type { ModsIndicateur } from "models/indicateurs";
import { useFilterContext } from "store/filterContext";
import { Filters } from "components/Filters";
import { applyDevFilters } from "utils/filters-functions";

export default function A11yForm() {
    const [modules, setModules] = useState<ModsIndicateur[]>([]);
    const { state, dispatch } = useFilterContext();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
    const [alertMessage, setAlertMessage] = useState("");

    useEffect(() => {
        async function fetchData() {
            const modules: ModsIndicateur[] = await fetchModules();
            setModules(modules);
        }
        fetchData();
    }, []);

    const filteredData = useMemo(
        () => modules.filter(item => applyDevFilters(item, state)),
        [modules, state]
    );

    const defaultValues: A11yFormValues = {
        idsModule: [],
        isDeclaration: false,
        dateMajInfosSaisies: new Date().toLocaleDateString("fr-CA"),
        idIndicateurTypeAudit: DEFAULT_TYPE_AUDIT,
        scoreAudit: 0,
        dateAudit: undefined,
        dateDeclaration: undefined
    };

    const { control, handleSubmit, reset } = useForm<A11yFormValues>({
        defaultValues
    });

    const watchedDeclaration: boolean | undefined = useWatch({
        control,
        name: "isDeclaration"
    });

    const watchedTypeAudit: number | undefined = useWatch({
        control,
        name: "idIndicateurTypeAudit"
    });

    const save: SubmitHandler<A11yFormValues> = async data => {
        if (data.idsModule.length === 0) {
            setSnackbarSeverity("error");
            setAlertMessage("Veuillez sélectionner au moins un module.");
            setSnackbarOpen(true);
            return;
        }

        try {
            for (const idModule of data.idsModule) {
                const payload: InfosSaisiesA11yToSaveDTO = {
                    ...data,
                    idModule
                };
                await majInfosSaisiesA11Y(payload);
            }

            setSnackbarSeverity("success");
            setAlertMessage(`A11y créée pour les modules choisis`);
            setSnackbarOpen(true);
            reset(defaultValues);
        } catch (e) {
            console.error(e);
            setSnackbarSeverity("error");
            setAlertMessage("Erreur lors de la création A11y");
            setSnackbarOpen(true);
        }
    };

    return (
        <>
            <Filters state={state} dispatch={dispatch} data={modules} />

            <MainFormPageLayout
                title="Saisir une A11y"
                onSubmit={handleSubmit(save)}
                formulaires={
                    <>
                        <FormPageLayout
                            title="Modules"
                            label="Modules"
                            control={control}
                            name="idsModule"
                            render={fieldProps => (
                                <RenderModuleSelections {...fieldProps} modules={filteredData} />
                            )}
                        />

                        <FormPageLayout
                            title="Déclaration"
                            label="Déclaration d'accessibilité"
                            control={control}
                            name="isDeclaration"
                            render={field => RenderDeclaration(field)}
                        />
                        {watchedDeclaration && (
                            <FormPageLayout
                                title="Date de déclaration"
                                label="Date de déclaration"
                                control={control}
                                name="dateDeclaration"
                                render={field => RenderDateDeclaration(field)}
                            />
                        )}

                        <FormPageLayout
                            title="Audit"
                            label="Type d'audit"
                            control={control}
                            name="idIndicateurTypeAudit"
                            render={field => RenderTypeAudit(field)}
                        />

                        {TYPES_AUDIT.includes(watchedTypeAudit ?? DEFAULT_TYPE_AUDIT) && (
                            <>
                                <FormPageLayout
                                    title="Détails de l'audit"
                                    label="Score"
                                    control={control}
                                    name="scoreAudit"
                                    render={scoreField => RenderScoreAudit(scoreField)}
                                />

                                <FormPageLayout
                                    title="Date de l'audit"
                                    label="Date"
                                    control={control}
                                    name="dateAudit"
                                    render={dateField => RenderDateAudit(dateField)}
                                />
                            </>
                        )}
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
            />

            <SnackBarPageLayout
                openSnack={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
                autoDuration={4000}
                render={
                    <Alert severity={snackbarSeverity} sx={{ width: "100%" }}>
                        {alertMessage}
                    </Alert>
                }
            />
        </>
    );
}
