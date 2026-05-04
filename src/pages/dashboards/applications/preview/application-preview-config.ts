import type { IndicateurApplicationSynthese } from "models/indicateurs";

interface Narrative {
    cloud: string;
    green: string;
    security: string;
    debt: string;
    tests: string;
    summary: string;
    quality: string;
    cloudMaturity: string;
    homologation: string;
}

type Grade = "A" | "B" | "C" | "D" | "E" | "SO" | "NR";

const normalizeGrade = (value: string | undefined | null): Grade => {
    const normalized = (value ?? "NR").toUpperCase().trim();
    return ["A", "B", "C", "D", "E", "SO", "NR"].includes(normalized) ? (normalized as Grade) : "NR";
};

const parsePositiveFloat = (value: string | undefined | null): number => {
    const num = Number.parseFloat(value ?? "-1");
    return !Number.isNaN(num) && num >= 0 ? num : -1;
};

const generateDebtNarrative = (detteTechnique: string | undefined): string => {
    const dette = parsePositiveFloat(detteTechnique);

    if (dette < 0) {
        return "La dette technique n'est pas renseignée pour cette application.";
    }

    const jours = dette / 420;
    return jours > 50
        ? "Le poids de la dette technique reste élevé pour cette application, nécessitant un effort de remédiation soutenu."
        : "La dette technique est maîtrisée, ce qui reflète une bonne maintenabilité de l'application.";
};

const generateTestCoverageNarrative = (couverture: string | undefined): string => {
    const coverage = parsePositiveFloat(couverture);

    if (coverage < 0) {
        return "La couverture de tests unitaires n'est pas renseignée.";
    }

    if (coverage > 80) {
        return "L'application dispose d'une excellente couverture de tests, garantissant une bonne robustesse aux évolutions.";
    }

    if (coverage < 40) {
        return "La couverture de tests est insuffisante, ce qui augmente les risques de régression.";
    }

    return "La couverture de tests est correcte, mais pourrait être renforcée.";
};

const generateSecurityNarrative = (lettreNiveauCve: string | undefined): string => {
    const grade = normalizeGrade(lettreNiveauCve);

    const narratives: Record<Grade, string> = {
        E: "Des vulnérabilités critiques subsistent et doivent être corrigées en priorité.",
        D: "Des failles de sécurité de niveau élevé sont présentes, nécessitant un plan de correction.",
        C: "Aucune vulnérabilité critique ou élevée n'a été détectée sur cette application.",
        B: "Aucune vulnérabilité critique ou élevée n'a été détectée sur cette application.",
        A: "Aucune vulnérabilité critique ou élevée n'a été détectée sur cette application.",
        SO: "L'indicateur de sécurité n'est pas applicable pour cette application.",
        NR: "Aucune information de sécurité n'est renseignée pour cette application."
    };

    return narratives[grade];
};
const generateHomologationNarrative = (
    sensitivity: string | undefined,
    statut: string | undefined,
    beginDate: string | undefined,
    endDate: string | undefined,
    homologationSI: string | undefined,
): string => {

    const sensitivityMap: Record<string, string> = {
        "1": "SI peu ou pas sensible",
        "2": "SI Moyennement sensible",
        "3": "SI important",
        "4": "SI sensible",
    };

    const sensitivityTexte =
        sensitivity && sensitivityMap[sensitivity]
            ? `catégorisé "${sensitivityMap[sensitivity]}".`
            : "la sensibilité du SI n'est pas déterminée.";

    if (statut === "homologuée" && homologationSI === "complète") {
        return `L'application a été homologuée le ${beginDate} (valable jusqu'au ${endDate}). Le système d'information de cette application a été homologué complètement et ${sensitivityTexte}`;
    }
    
    if (statut === "homologuée" && homologationSI === "partielle") {
        return `L'application a été homologuée le ${beginDate} (valable jusqu'au ${endDate}). Le système d'information de cette application a été homologué partiellement et ${sensitivityTexte}`;
    }

    if (statut === "non" && homologationSI === "partielle") {
        return `L'application n'a pas été homologuée mais son système d'information a été homologué partiellement et ${sensitivityTexte}`;
    }

    return "L'application n'a pas été homologuée.";
};


const generateGreenITNarrative = (lettreGreen: string | undefined): string => {
    const grade = normalizeGrade(lettreGreen);

    const narratives: Record<Grade, string> = {
        A: "Cette application est exemplaire en matière de pratiques d'éco-conception.",
        B: "L'impact environnemental du code est modéré mais pourrait être optimisé.",
        C: "L'impact environnemental du code est modéré mais pourrait être optimisé.",
        D: "L'impact environnemental du code est modéré mais pourrait être optimisé.",
        E: "L'application présente des opportunités significatives d'amélioration en matière d'éco-conception.",
        SO: "L'indicateur Green IT n'est pas applicable pour cette application.",
        NR: "Aucune information Green IT n'est renseignée pour cette application."
    };

    return narratives[grade];
};

const generateDeploymentFrequencyNarrative = (distanceNote: string | undefined): string => {
    const grade = normalizeGrade(distanceNote);

    const narratives: Record<Grade, string> = {
        A: "La fréquence de livraison est bonne.",
        B: "La fréquence de livraison est bonne.",
        C: "L'espacement entre les mises en production est long.",
        D: "L'espacement entre les mises en production est long.",
        E: "L'espacement entre les mises en production est long.",
        SO: "La fréquence de mise en production n'est pas applicable pour cette application.",
        NR: "Aucune donnée de fréquence de mise en production n'est disponible."
    };

    return narratives[grade];
};

const generateQualityNarrative = (lettreQualiteGenerale: string | undefined): string => {
    const grade = normalizeGrade(lettreQualiteGenerale);

    const narratives: Record<Grade, string> = {
        A: "L'application atteint un excellent niveau de qualité logicielle.",
        B: "La qualité logicielle est satisfaisante, mais pourrait encore être améliorée.",
        C: "La qualité logicielle est satisfaisante, mais pourrait encore être améliorée.",
        D: "La qualité logicielle est satisfaisante, mais pourrait encore être améliorée.",
        E: "La qualité du code est faible, un effort de refonte ou de remédiation est nécessaire.",
        SO: "L'indicateur de qualité logicielle n'est pas applicable pour cette application.",
        NR: "Aucune donnée de qualité n'est renseignée pour cette application."
    };

    return narratives[grade];
};

const generateCloudMaturityNarrative = (maturite: string | undefined): string => {
    const grade = normalizeGrade(maturite);

    const narratives: Record<Grade, string> = {
        A: "La maturité cloud est bonne, l'application est globalement prête.",
        B: "La maturité cloud est bonne, l'application est globalement prête.",
        C: "La maturité cloud est intermédiaire.",
        D: "La maturité cloud est faible, un plan de modernisation est conseillé.",
        E: "La maturité cloud est faible, un plan de modernisation est conseillé.",
        SO: "La maturité cloud n'est pas applicable à cette application.",
        NR: "La maturité cloud n'est pas renseignée."
    };

    return narratives[grade];
};

export function generateNarrative(app: IndicateurApplicationSynthese): Narrative {
    return {
        debt: generateDebtNarrative(app.detteTechnique),
        tests: generateTestCoverageNarrative(app.pourcentageCouvertureTestUniaire),
        security: generateSecurityNarrative(app.lettreNiveauCve),
        homologation: generateHomologationNarrative(app.sensitivity, app.statutHomologation, app.homologationBeginDate, app.homologationEndDate, app.homologationSI),
        green: generateGreenITNarrative(app.lettreGreen),
        cloud: generateDeploymentFrequencyNarrative(app.distanceNote),
        quality: generateQualityNarrative(app.lettreQualiteGenerale),
        cloudMaturity: generateCloudMaturityNarrative(app.maturite),
        summary: `Ce rapport met en évidence les principaux leviers de progression pour ${app.applicationName}.`
    };
}

export interface ModuleData {
    name: string;
    qualite?: string;
    couverture?: string;
    dette?: number;
    a11y?: string;
    distance?: number;
    lettreGreen?: string;
    lettreNiveauCve?: string;
}
export interface Props {
    appDetails: IndicateurApplicationSynthese;
    modules: ModuleData[];
    population: IndicateurApplicationSynthese[];
}
