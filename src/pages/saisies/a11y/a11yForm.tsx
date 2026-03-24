import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { majInfosSaisiesA11Y, type InfosSaisiesA11yToSaveDTO } from "todos-api/client.gen";
import { FormPageLayout } from "components/formsPageLayout/FormPageLayout";
import {
    RenderDateAudit,
    RenderDateDeclaration,
    RenderDeclaration,
    RenderModuleSelections,
    RenderScoreAudit,
    RenderTypeAudit
} from "pages/saisies/a11y/a11yCell";
import { DEFAULT_TYPE_AUDIT, fetchModules, TYPES_AUDIT, type A11yFormValues } from "./a11yFormValues";
import type { ModsIndicateur } from "models/indicateurs";
import { useFilterContext } from "store/filterContext";
import { Filters } from "pages/Filters";
import { useQueryForm } from "hooks/useQueryForm";
import { useSnackbar } from "hooks/useSnackbar";
import { BaseFormLayout } from "components/formsPageLayout/BaseFormLayout";

export default function A11yForm() {
    const { state, dispatch } = useFilterContext();
    const { snackbar, showSuccess, showError, close } = useSnackbar();

    const fetchData = async (): Promise<ModsIndicateur[]> => {
        const modules: ModsIndicateur[] = await fetchModules();
        return modules;
    };

    const { data, filteredData } = useQueryForm({
        queryKey: ["A11yForm"],
        fetchData
    });

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
        try {
            for (const idModule of data.idsModule) {
                const payload: InfosSaisiesA11yToSaveDTO = {
                    ...data,
                    idModule
                };
                await majInfosSaisiesA11Y(payload);
            }
            showSuccess(`A11y créée pour les modules choisis`);
            reset(defaultValues);
        } catch (e) {
            console.error(e);
            showError("Erreur lors de la création A11y");
        }
    };

    return (
        <BaseFormLayout
            title="Saisir une A11y"
            filtres={<Filters state={state} dispatch={dispatch} data={data} />}
            onSubmit={handleSubmit(save)}
            reset={() => reset(defaultValues)}
            formulaires={
                <>
                    <FormPageLayout
                        title="Modules"
                        label="Modules"
                        required={true}
                        control={control}
                        name="idsModule"
                        render={fieldProps => (
                            <RenderModuleSelections {...fieldProps} modules={filteredData} />
                        )}
                    />

                    <FormPageLayout
                        title="Déclaration"
                        label="Déclaration"
                        control={control}
                        name="isDeclaration"
                        render={field => RenderDeclaration(field)}
                    />
                    {watchedDeclaration && (
                        <FormPageLayout
                            title="Date de déclaration"
                            label="Date de déclaration"
                            required={true}
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
                                required={true}
                                control={control}
                                name="scoreAudit"
                                render={scoreField => RenderScoreAudit(scoreField)}
                            />

                            <FormPageLayout
                                title="Date de l'audit"
                                label="Date"
                                required={true}
                                control={control}
                                name="dateAudit"
                                render={dateField => RenderDateAudit(dateField)}
                            />
                        </>
                    )}
                </>
            }
            snackbar={snackbar}
            onCloseSnackbar={close}
        />
    );
}
