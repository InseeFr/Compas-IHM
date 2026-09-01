import type { IndicateurApplicationMaturite } from "models/indicateurs";
import {
    getMaturiteCloud,
    getApplications1,
    type IndicateurApplicationMaturiteCloud,
    type Application
} from "todos-api/client.gen";
import { green, orange, red, yellow } from "@mui/material/colors";

export async function fetchMaturiteData(): Promise<IndicateurApplicationMaturite[]> {
    try {
        const [maturite, apps] = await Promise.all([getMaturiteCloud(), getApplications1()]);
        return buildMaturiteResult(maturite, apps);
    } catch (error) {
        console.error("Erreur lors de la récupération de donnée sur la Maturité cloud", error);
        return [];
    }
}

function buildMaturiteResult(
    maturite: IndicateurApplicationMaturiteCloud[],
    apps: Application[]
): IndicateurApplicationMaturite[] {
    return maturite
        .map(m => buildWithApplicationName(m, apps))
        .filter(app => app.applicationName !== undefined)
        .sort((a, b) => (a.applicationName ?? "").localeCompare(b.applicationName ?? ""));
}

function buildWithApplicationName(
    maturite: IndicateurApplicationMaturiteCloud,
    apps: Application[]
): IndicateurApplicationMaturite {
    const app: Application | undefined = apps.find(a => a.idApplication === maturite.applicationId);

    let applicationName: string | undefined;
    if (app?.appName) {
        applicationName = app.appName;
    } else if (app?.idApplication) {
        applicationName = `Application ${app.idApplication}`;
    } else {
        applicationName = undefined;
    }

    return {
        ...maturite,
        applicationName,
        domaine: app?.domaineSndi ?? "",
        sndi: app?.sndi ?? "",
        domaineFonc: app?.domaineFonctionnel ?? ""
    };
}

/* -------------------------------------------------------------------------- */
/*  Helpers numériques                                                        */
/* -------------------------------------------------------------------------- */
type NumericInput = string | number | null;

export const formatNum = (v?: NumericInput, fallback = 0): number => {
    const n = typeof v === "number" ? v : Number.parseFloat(v ?? "");
    return Number.isFinite(n) ? n : fallback;
};

export const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

/** Score 0..1 -> "59 %" */
export const toPct = (score: number): string => `${Math.round(clamp01(score) * 100)} %`;

/**
 * Magnitude de la complexité (0..1), robuste au signe renvoyé par l'API.
 * Elle est toujours affichée avec un préfixe « - » pour rappeler qu'un score
 * élevé est *défavorable* (cf. maquette).
 */
export const complexiteMagnitude = (v?: NumericInput): number =>
    clamp01(Math.abs(formatNum(v, 0)));

export const fmtComplexite = (v: number): string => `-${v.toFixed(2)}`;
export const fmtBenefice = (v: number): string => `${v >= 0 ? "+" : "-"}${Math.abs(v).toFixed(2)}`;

/* -------------------------------------------------------------------------- */
/*  Couleurs des scores (fichier Calc)                                        */
/* -------------------------------------------------------------------------- */

export type ScoreKind = "default" | "complexite";

/**
 * Score « normal » (opportunité, maturité, bénéfice, technique, orga…) :
 *   rouge  : score < 0,2
 *   orange : 0,2 ≤ score ≤ 0,45
 *   jaune  : 0,45 < score ≤ 0,7
 *   vert   : 0,7 < score
 *
 * Score de complexité (seuils inversés) :
 *   rouge  : score > 0,7
 *   orange : 0,45 < score ≤ 0,7
 *   jaune  : 0,2 ≤ score ≤ 0,45
 *   vert   : score < 0,2
 */
export function getScoreColor(score: number, kind: ScoreKind = "default"): string {
    if (kind === "complexite") {
        if (score > 0.7) return red[500];
        if (score > 0.45) return orange[500];
        if (score >= 0.2) return yellow[300];
        return green[600];
    }
    if (score < 0.2) return red[500];
    if (score <= 0.45) return orange[500];
    if (score <= 0.7) return yellow[300];
    return green[600];
}

/* -------------------------------------------------------------------------- */
/*  Classement (opportunité / maturité) — traduction de la couleur du score   */
/* -------------------------------------------------------------------------- */

export type ClassementKey = "forte" | "assez-forte" | "plutot-faible" | "tres-faible";

export interface Classement {
    key: ClassementKey;
    /** "forte" | "assez forte" | "plutôt faible" | "très faible" */
    label: string;
    /** ☑ (vrai) vs ☒ (faux) */
    positive: boolean;
    color: string;
}

export function getClassement(score: number): Classement {
    const color = getScoreColor(score);
    if (score < 0.2) return { key: "tres-faible", label: "très faible", positive: false, color };
    if (score <= 0.45)
        return { key: "plutot-faible", label: "plutôt faible", positive: false, color };
    if (score <= 0.7) return { key: "assez-forte", label: "assez forte", positive: true, color };
    return { key: "forte", label: "forte", positive: true, color };
}

/* -------------------------------------------------------------------------- */
/*  Tendance (delta du fichier Calc)                                          */
/* -------------------------------------------------------------------------- */

export type Tendance = "hausse" | "stable" | "baisse";

/**
 *   hausse : delta > 0,05
 *   stable : -0,05 ≤ delta ≤ 0,05
 *   baisse : delta < -0,05
 */
export function getTendance(delta?: NumericInput): Tendance {
    const d = formatNum(delta, 0);
    if (d > 0.05) return "hausse";
    if (d < -0.05) return "baisse";
    return "stable";
}

/* -------------------------------------------------------------------------- */
/*  Normalisation d'une application sélectionnée                              */
/* -------------------------------------------------------------------------- */

export interface NormalizedMaturite {
    scoreOpportunite: number;
    scoreMaturite: number;
    scoreTechnique: number;
    scoreOrga: number;
    complexite: number; // magnitude 0..1 (affichée avec un « - »)
    benefice: number; // 0..1
    deltaOpportunite: number;
    deltaMaturite: number;
}

const EMPTY_MATURITE: NormalizedMaturite = {
    scoreOpportunite: 0,
    scoreMaturite: 0,
    scoreTechnique: 0,
    scoreOrga: 0,
    complexite: 0,
    benefice: 0,
    deltaOpportunite: 0,
    deltaMaturite: 0
};

export function normalizeMaturite(app: IndicateurApplicationMaturite | null): NormalizedMaturite {
    if (!app) return EMPTY_MATURITE;

    const scoreTechnique = clamp01(formatNum(app.scoreTechnique, 0));
    const scoreOrga = clamp01(formatNum(app.scoreOrga, 0));

    return {
        // ⚠️ Champs à confirmer côté DTO :
        scoreOpportunite: clamp01(formatNum(app.scoreOpportunite, 0)),
        scoreMaturite: clamp01(formatNum(app.scoreMaturite, (scoreTechnique + scoreOrga) / 2)),
        deltaOpportunite: formatNum(app.deltaOpportunite, 0),
        deltaMaturite: formatNum(app.deltaMaturite, 0),
        // Champs déjà présents :
        scoreTechnique,
        scoreOrga,
        complexite: complexiteMagnitude(app.scoreComplexite),
        benefice: clamp01(formatNum(app.scoreBenefice, 0))
    };
}

/* -------------------------------------------------------------------------- */
/*  Conseil migration                                                         */
/* -------------------------------------------------------------------------- */

export interface Conseil {
    favorable: boolean;
    texte: string;
}

/**
 * @param scoreMaturite maturité 0..1 (forte si > 0,45, i.e. jaune ou vert)
 * @param benefice      bénéfice 0..1
 * @param complexite    complexité 0..1 (magnitude, plus c'est haut plus c'est défavorable)
 */
export function computeConseil(
    scoreMaturite: number,
    benefice: number,
    complexite: number
): Conseil {
    const balance = benefice - complexite;
    const forte = scoreMaturite > 0.45;
    const showLiftShift = complexite < 0.22;

    if (forte) {
        if (balance >= 0) {
            return {
                favorable: true,
                texte: "Les caractéristiques de l’application sont favorables à un chantier de migration vers une technologie ou une infrastructure Cloud."
            };
        }
        return {
            favorable: false,
            texte: "Au regard des caractéristiques de l’application, une migration vers une technologie ou une infrastructure Cloud est possible mais semble peu prioritaire."
        };
    }

    if (balance >= 0) {
        const pieces: string[] = [
            "Les caractéristiques de l’application sont peu favorables à un chantier de migration vers une technologie Cloud."
        ];
        if (complexite > 0 && benefice >= 0) {
            pieces.push("En cas de refonte, le Cloud est la cible technique à privilégier.");
        }
        if (showLiftShift && benefice < 0.25) {
            pieces.push(
                "Un portage sur infrastructure équivalente (« lift & shift ») peut être étudié."
            );
        }
        return { favorable: false, texte: pieces.join(" ") };
    }

    const parts = [
        "Les caractéristiques de l’application ne sont pas favorables à un chantier de migration vers une technologie Cloud."
    ];
    if (showLiftShift) {
        parts.push("Un portage sur infrastructure équivalente (« lift & shift ») peut être étudié.");
    }
    return { favorable: false, texte: parts.join(" ") };
}