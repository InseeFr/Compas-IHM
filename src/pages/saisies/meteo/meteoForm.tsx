import { useForm, useWatch, type SubmitHandler } from "react-hook-form";

import { FormPageLayout } from "components/formsPageLayout/FormPageLayout";

import { creerMeteo, getApplications1, type DemandeCreationMeteo } from "todos-api/client.gen";

import { RenderAppSelections, RenderMeteoSelection } from "./meteoCell";
import { useFilterContext } from "store/filterContext";
import { Filters } from "pages/Filters";
import CommentaryLayout from "components/formsPageLayout/CommentaryPageLayout";
import { useSnackbar } from "hooks/useSnackbar";
import type { AppsIndicateur } from "models/indicateurs";
import { useQueryForm } from "hooks/useQueryForm";
import { BaseFormLayout } from "components/formsPageLayout/BaseFormLayout";

export function MeteoForm() {
    const { state, dispatch } = useFilterContext();
    const { snackbar, showSuccess, showError, close } = useSnackbar();
    const fetchData = async (): Promise<AppsIndicateur[]> => {
        const getApps = await getApplications1();
        return getApps
            .map(app => ({
                idApplication: app.idApplication ?? 0,
                appName: app.appName ?? "",
                domaine: app.domaineSndi ?? "",
                domaineFonc: app.domaineFonctionnel ?? "",
                sndi: app.sndi ?? ""
            }))
            .sort((a, b) => a.appName.localeCompare(b.appName));
    };
    const { data, filteredData } = useQueryForm({
        queryKey: ["MeteoForm"],
        fetchData
    });

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
    } = useForm<DemandeCreationMeteo>({ defaultValues });

    const typeMeteo = useWatch({ control, name: "valeurMeteo" });
    const isCommentaryRequired = typeMeteo !== undefined && [1, 2].includes(typeMeteo);

    const creer: SubmitHandler<DemandeCreationMeteo> = async data => {
        try {
            await creerMeteo(data);
            showSuccess("Création de la météo réussie.");
            reset(defaultValues);
        } catch (error) {
            console.error("Erreur création météo:", error);
            showError("Une erreur est survenue lors de la création météo.");
        }
    };

    return (
        <BaseFormLayout
            title="Saisir une météo"
            filtres={<Filters state={state} dispatch={dispatch} data={data} />}
            formulaires={
                <>
                    <FormPageLayout
                        required={true}
                        title="Choisir les applications"
                        label="Applications"
                        control={control}
                        name="idsApplication"
                        render={field => RenderAppSelections(field, filteredData)}
                    />
                    <FormPageLayout
                        required={true}
                        title="Météo ressentie"
                        label="Choisir la météo"
                        control={control}
                        name="valeurMeteo"
                        render={field => RenderMeteoSelection(field)}
                    />
                    <CommentaryLayout
                        register={register}
                        isRequired={isCommentaryRequired}
                        errors={errors}
                        commentaryMessage="Le commentaire est obligatoire pour cette météo."
                    />
                </>
            }
            reset={() => reset(defaultValues)}
            onSubmit={handleSubmit(creer)}
            snackbar={snackbar}
            onCloseSnackbar={close}
        />
    );
}
