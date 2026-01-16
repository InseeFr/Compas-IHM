import type { GlobalIndicator } from "models/indicateurs";

/**
 * Compte le nombre d'occurrences pour une propriété donnée
 */
export function countBy(arr: GlobalIndicator[], key: keyof GlobalIndicator): Record<string, number> {
    const counts: Record<string, number> = {};
    arr.forEach(item => {
        const val = item[key];
        const label = val === null || val === undefined || val === -1 ? "NR" : val.toString();
        counts[label] = (counts[label] || 0) + 1;
    });
    return counts;
}

/**
 * Catégorise la dette technique (minutes → jours /420)
 */
export function getDetteBucket(minutesStr?: string): string {
    const val = parseFloat(minutesStr ?? "-1");
    if (isNaN(val) || val < 0) return "NR";

    const jours = val / 420;
    if (jours <= 5) return "0-5";
    if (jours <= 15) return "6-15";
    if (jours <= 30) return "16-30";
    if (jours <= 90) return "31-90";
    return ">90";
}

/**
 * Catégorise le délai depuis la dernière MEP (en jours)
 */
export function getMepBucket(days?: number | string): string {
    const num = days !== undefined && days !== null ? Number(days) : -1;
    if (isNaN(num) || num === -1) return "NR";

    if (num <= 30) return "0-30";
    if (num <= 60) return "31-60";
    if (num <= 90) return "61-90";
    if (num <= 180) return "91-180";
    return ">180";
}

/**
 * Calcule le total de CVE pour une application
 */
export function getCveTotal(d: GlobalIndicator): number {
    return ["nbCveCritical", "nbCveHigh", "nbCveMedium", "nbCveLow"]
        .map(k => parseInt(String(d[k as keyof GlobalIndicator] ?? "0"), 10))
        .reduce((a, b) => a + b, 0);
}

/**
 * Calcule la dette technique cumulée en jours
 */
export function calculateDetteCumulee(data: GlobalIndicator[]): string {
    const minutes = data.map(d => parseFloat(d.detteTechnique ?? "-1")).filter(v => !isNaN(v) && v >= 0);

    if (minutes.length === 0) return "NR";

    const totalMinutes = minutes.reduce((a, b) => a + b, 0);
    const jours = totalMinutes / 420;
    return `${jours.toFixed(1)} jours`;
}

/**
 * Calcule le pourcentage d'applications avec maturité Cloud forte (A/B)
 */
export function calculateMaturiteStrongPct(data: GlobalIndicator[]): string {
    const apps = data.filter(d => !d.isModule);
    const known = apps.filter(a => (a.maturite ?? "NR") !== "NR" && (a.maturite ?? "NR") !== "SO");

    if (known.length === 0) return "NR";

    const strong = known.filter(a => ["A", "B"].includes((a.maturite ?? "").toUpperCase())).length;

    return `${((strong / known.length) * 100).toFixed(1)}% (${strong}/${known.length})`;
}

/**
 * Calcule le nombre total de CVE critiques
 */
export function calculateTotalCriticalCve(data: GlobalIndicator[]): number {
    return data
        .map(d => parseInt(String(d.nbCveCritical ?? "0"), 10))
        .filter(v => !isNaN(v))
        .reduce((a, b) => a + b, 0);
}

/**
 * Compte le nombre d'applications sans MEP depuis plus de N jours
 */
export function countAppsSinceLastMep(data: GlobalIndicator[], days: number): number {
    return data.filter(d => Number(d.distanceCount ?? -1) > days).length;
}
