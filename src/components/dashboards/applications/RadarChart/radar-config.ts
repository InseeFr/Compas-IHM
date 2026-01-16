import type { AppForRadar } from "./RadarQualiteChar";

const letterToScore = (letter?: string): number => {
    if (!letter) return 0;
    const L = letter.toUpperCase().trim();
    if (L === "NR" || L === "SO") return 0;
    switch (L) {
        case "A":
            return 5;
        case "B":
            return 4;
        case "C":
            return 3;
        case "D":
            return 2;
        case "E":
            return 1;
        default:
            return 0;
    }
};

export const scoreToLetter = (v: number): string => {
    if (v <= 0) return "NR/SO";
    if (v >= 4.5) return "A";
    if (v >= 3.5) return "B";
    if (v >= 2.5) return "C";
    if (v >= 1.5) return "D";
    return "E";
};

export const pickSixAxisScores = (a: AppForRadar): number[] => [
    letterToScore(a.lettreQualiteGenerale),
    letterToScore(a.lettreNiveauCve),
    letterToScore(a.distanceNote),
    letterToScore(a.lettreFiabilite),
    letterToScore(a.lettreGreen),
    letterToScore(a.maturite)
];

export const avgArrays = (rows: number[][]): number[] => {
    if (!rows.length) return [0, 0, 0, 0, 0, 0];
    const sums = rows.reduce((acc, r) => acc.map((v, i) => v + (r[i] ?? 0)), [0, 0, 0, 0, 0, 0]);
    return sums.map(v => v / rows.length);
};
