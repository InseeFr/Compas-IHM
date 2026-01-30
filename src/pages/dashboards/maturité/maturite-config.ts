import type { IndicateurApplicationMaturite } from "models/indicateurs";
import {
    getMaturiteCloud,
    getApplications1,
    type IndicateurApplicationMaturiteCloud,
    type Application,
    type ApplicationTip,
    getApplicationConseils
} from "todos-api/client.gen";
import { green, orange, red, yellow } from "@mui/material/colors";

export async function fetchTipsData(
    selectedApp: IndicateurApplicationMaturite | null
): Promise<ApplicationTip[]> {
    if (!selectedApp?.applicationName) {
        return [];
    }
    try {
        const tips: ApplicationTip[] = await getApplicationConseils({
            nom_oscar: selectedApp.applicationName
        });
        return tips.sort((a, b) => {
            const sameDate = a.date === b.date;

            if (sameDate) {
                return (b.id ?? 0) - (a.id ?? 0);
            }

            const aDate = a.date ?? "";
            const bDate = b.date ?? "";

            return aDate < bDate ? 1 : -1;
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des tips de maturité: ", error);
        return [];
    }
}

export async function fetchMaturiteData(): Promise<IndicateurApplicationMaturite[]> {
    try {
        const [maturite, apps] = await Promise.all([getMaturiteCloud(), getApplications1()]);
        return buildMaturiteResult(maturite, apps);
    } catch (error) {
        console.error("Erreur lors de la récupération de donnée sur la Maturité cloud", error);
        return [];
    }
}

function priorityValue(p?: string | null): number {
    if (p == null) return Number.POSITIVE_INFINITY;
    const n = Number.parseFloat(p.trim());
    return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

export function bottom3ByPriority(items: ApplicationTip[]): ApplicationTip[] {
    const seen = new Set<string>();
    const uniq: ApplicationTip[] = [];
    for (const t of items) {
        const key = (t.conseil ?? "").trim();
        if (key && !seen.has(key)) {
            seen.add(key);
            uniq.push(t);
        }
    }
    uniq.sort((a, b) => {
        const pa = priorityValue(a.priorite);
        const pb = priorityValue(b.priorite);
        if (pa !== pb) return pa - pb;
        const da = a.date ?? "";
        const db = b.date ?? "";
        if (da !== db) return da < db ? 1 : -1;
        return (b.id ?? 0) - (a.id ?? 0);
    });

    return uniq.slice(0, 3);
}

function buildMaturiteResult(
    maturite: IndicateurApplicationMaturiteCloud[],
    apps: Application[]
): IndicateurApplicationMaturite[] {
    return maturite
        .map(m => buildWithApplicationName(m, apps))
        .sort((a, b) => (a.applicationName ?? "").localeCompare(b.applicationName ?? ""));
}

function buildWithApplicationName(
    maturite: IndicateurApplicationMaturiteCloud,
    apps: Application[]
): IndicateurApplicationMaturite {
    const app: Application | undefined = apps.find(a => a.idApplication === maturite.applicationId);

    return {
        ...maturite,
        applicationName: app?.appName ? app.appName : `Application ${app?.idApplication}`,
        domaine: app?.domaineSndi ?? "",
        sndi: app?.sndi ?? "",
        domaineFonc: app?.domaineFonctionnel ?? ""
    };
}

export const formatNum = (v?: string, fallback = 0) =>
    Number.isFinite(Number.parseFloat(v ?? "")) ? Number.parseFloat(v!) : fallback;
export const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function getScoreColor(score: number, type: "default" | "complexite" = "default"): string {
    if (type === "complexite") {
        if (score < -0.45) return orange[500];
        if (score < -0.22) return yellow[300];
        if (score <= 0) return green[600];
        return green[600];
    } else {
        if (score < 0.23) return red[500];
        if (score < 0.45) return orange[500];
        if (score < 0.67) return yellow[300];
        return green[600];
    }
}

export function maturiteLevel(m?: string): "forte" | "faible" {
    return m === "A" || m === "B" ? "forte" : "faible";
}
export function maturiteLabel(m?: string): string {
    switch (m) {
        case "A":
            return "très forte";
        case "B":
            return "assez forte";
        case "C":
            return "moyenne";
        case "D":
            return "faible";
        default:
            return "inconnue";
    }
}

export function computeConseil(
    maturite?: string,
    benefStr?: string,
    risqueStr?: string
): {
    favorable: boolean;
    texte: string;
} {
    const benef = formatNum(benefStr, 0);
    const risque = formatNum(risqueStr, 0);
    const balance = benef + risque;
    const forte = maturite === "A" || maturite === "B";

    const showLiftShift = risque > -0.22;

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
        if (risque < 0 && benef >= 0) {
            pieces.push("En cas de refonte, le Cloud est la cible technique à privilégier.");
        }
        if (showLiftShift && benef < 0.25) {
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
