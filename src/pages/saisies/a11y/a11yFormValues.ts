import type { ModsIndicateur } from "models/indicateurs";
import {
    getModules1,
    listerModulesA11y,
    type IndicateursModuleA11Y,
    type InfosSaisiesA11yToSaveDTO,
    type Module
} from "todos-api/client.gen";

export type A11yFormValues = Omit<InfosSaisiesA11yToSaveDTO, "idModule"> & {
    idsModule: number[];
};

export const TYPES_AUDIT: number[] = [511, 512, 513];

export const DEFAULT_TYPE_AUDIT: number = 510;

export async function fetchModules(): Promise<ModsIndicateur[]> {
    const [a11yMods, modules] = await Promise.all([listerModulesA11y(), getModules1()]);
    const filteredModules = filterModules(modules, a11yMods);
    const mappedModules = mapModules(filteredModules);
    return sortModules(mappedModules);
}

function filterModules(modules: Module[], a11yMods: IndicateursModuleA11Y[]): Module[] {
    return modules.filter(m => a11yMods.some(a => a.idModule === m.id));
}

function mapModules(modules: Module[]): ModsIndicateur[] {
    return modules.map(mod => ({
        id: mod.id,
        nomTechnique: mod.nomTechnique,
        applicationTechnique: mod.applicationTechnique,
        sourceCreation: mod.sourceCreation,
        modName: mod.modName ?? "",
        idApplication: mod.idApplication,
        appName: mod.appName,
        domaine: mod.domaineSndi ?? "",
        domaineFonc: mod.domaineFonctionnel ?? "",
        sndi: mod.sndi ?? "",
        keySonar: mod.keySonar,
        statut: mod.statut,
        dateDerniereLivraisonEnProduction: mod.dateDerniereLivraisonEnProduction,
        typeLivrable: mod.typeLivrable,
        urlCodeSource: mod.urlCodeSource
    }));
}

function sortModules(modules: ModsIndicateur[]): ModsIndicateur[] {
    return modules.sort((a, b) => (a.modName ?? "").localeCompare(b.modName ?? ""));
}
