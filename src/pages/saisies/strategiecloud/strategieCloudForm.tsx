import { useForm, useWatch, type SubmitHandler } from "react-hook-form";

import { FormPageLayout } from "components/formsPageLayout/FormPageLayout";
import { BaseFormLayout } from "components/formsPageLayout/BaseFormLayout";

import { getModules1, saisirStrategieCloud } from "todos-api/client.gen";
import type { DemandeCreationStrategieCloud as ApiDemandeCreationStrategieCloud } from "todos-api/client.gen";

import {
    RenderModuleSelection,
    RenderStrategieCloudSelection,
    RenderEnvCibleSelection
} from "./strategieCloudFormCell";
import { useFilterContext } from "store/filterContext";
import { Filters } from "pages/Filters";
import type { ModsIndicateur } from "models/indicateurs";
import CommentaryLayout from "components/formsPageLayout/CommentaryPageLayout";
import { useSnackbar } from "hooks/useSnackbar";
import { useQueryForm } from "hooks/useQueryForm";

interface FormDemandeCreationStrategieCloud {
    idsModule: number[];
    strategieCloud: string;
    envCibleProd: string;
    commentaire: string;
}

const STRATEGIE_CLOUD_MAPPING: Record<string, number> = {
    "A instruire": 1,
    "En cours": 2,
    Validée: 3
};

const ENV_CIBLE_MAPPING: Record<string, number> = {
    NonDefini: 0,
    Kube: 1,
    VM: 2,
    "cloud externe": 3,
    Autre: 4
};

const defaultValues: FormDemandeCreationStrategieCloud = {
    idsModule: [],
    strategieCloud: "A instruire",
    envCibleProd: "Kube",
    commentaire: ""
};

export function StrategieCloudForm() {
    const { state, dispatch } = useFilterContext();
    const { snackbar, showSuccess, showError, close } = useSnackbar();
    const fetchData = async (): Promise<ModsIndicateur[]> => {
        const items = await getModules1();
        return (items ?? [])
            .filter(item => item.id != null)
            .map(item => ({
                id: item.id!,
                modName: item.modName ?? item.nomTechnique ?? "NR",
                domaine: item.domaineSndi ?? "",
                sndi: item.sndi ?? "",
                domaineFonc: item.domaineFonctionnel ?? "",
                nomTechnique: item.nomTechnique,
                applicationTechnique: item.applicationTechnique,
                sourceCreation: item.sourceCreation,
                idApplication: item.idApplication,
                appName: item.appName,
                keySonar: item.keySonar,
                statut: item.statut,
                dateDerniereLivraisonEnProduction: item.dateDerniereLivraisonEnProduction,
                typeLivrable: item.typeLivrable,
                urlCodeSource: item.urlCodeSource
            }))
            .sort((a, b) => (a.modName ?? "").localeCompare(b.modName ?? ""));
    };

    const { data, filteredData } = useQueryForm({
        queryKey: ["StrategieCloudForm"],
        fetchData
    });

    const {
        control,
        handleSubmit,
        register,
        reset,
        formState: { errors }
    } = useForm<FormDemandeCreationStrategieCloud>({ defaultValues });

    const strategieCloud = useWatch({ control, name: "strategieCloud" });
    const isCommentaryRequired =
        strategieCloud !== undefined && ["En cours", "Validée"].includes(strategieCloud);

    const creer: SubmitHandler<FormDemandeCreationStrategieCloud> = async data => {
        try {
            const apiData: ApiDemandeCreationStrategieCloud = {
                idsModule: data.idsModule,
                avancement: STRATEGIE_CLOUD_MAPPING[data.strategieCloud],
                commentaire: data.commentaire,
                envCibleProd: ENV_CIBLE_MAPPING[data.envCibleProd],
                date: new Date().toISOString().split("T")[0]
            };
            await saisirStrategieCloud(apiData);
            showSuccess("Mise à jour de la stratégie cloud réussie.");
            reset(defaultValues);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Erreur Mise à jour de la stratégie cloud:", error);
            const message = error.response?.data?.detail || "";
            showError(
                `Une erreur est survenue lors de la mise à jour de la stratégie cloud. ${message}`
            );
        }
    };

    return (
        <BaseFormLayout
            title="Saisir une stratégie cloud"
            filtres={<Filters state={state} dispatch={dispatch} data={data} />}
            formulaires={
                <>
                    <FormPageLayout
                        required={true}
                        title="Choisir les modules"
                        label="Modules"
                        control={control}
                        name="idsModule"
                        render={field => RenderModuleSelection(field, filteredData)}
                    />
                    <FormPageLayout
                        required={true}
                        title="État d'avancement de la stratégie"
                        label="Stratégie cloud"
                        control={control}
                        name="strategieCloud"
                        render={field => RenderStrategieCloudSelection(field)}
                    />
                    <FormPageLayout
                        required={true}
                        title="Environnement cible de production"
                        label="Environnement cible"
                        control={control}
                        name="envCibleProd"
                        render={field => RenderEnvCibleSelection(field)}
                    />
                    <CommentaryLayout
                        register={register}
                        isRequired={isCommentaryRequired}
                        errors={errors}
                        commentaryMessage="Le commentaire est obligatoire pour cet état d’avancement."
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
