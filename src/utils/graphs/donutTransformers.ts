/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GlobalIndicator } from "models/indicateurs";
import { countBy, getDetteBucket, getMepBucket } from "./calculations";
import {
    DETTE_COLORS,
    MEP_COLORS,
    METEO_COLORS,
    METEO_LABELS,
    ORDERED_DETTE,
    ORDERED_MEP,
    ORDERED_METEO,
    ORDERED_QUALITE,
    QUALITE_COLORS
} from "constantes/couleurs";

export type DonutChartData = {
    name: string;
    value: number;
    color: string;
    [key: string]: any;
};

/**
 * Transformateur pour le donut de qualité
 */
export function transformQualiteData(data: GlobalIndicator[]): DonutChartData[] {
    const qualiteCounts = countBy(data, "lettreQualiteGenerale");
    return ORDERED_QUALITE.map(letter => ({
        name: letter,
        value: qualiteCounts[letter] ?? 0,
        color: QUALITE_COLORS[letter] ?? "#999"
    }));
}

/**
 * Transformateur pour le donut de météo
 */
export function transformMeteoData(data: GlobalIndicator[]): DonutChartData[] {
    const meteoCounts = countBy(data, "meteo");
    return ORDERED_METEO.map(val => ({
        name: METEO_LABELS[val],
        value: (meteoCounts as any)[val] ?? 0,
        color: METEO_COLORS[val]
    }));
}

/**
 * Transformateur pour le donut de dette technique
 */
export function transformDetteData(data: GlobalIndicator[]): DonutChartData[] {
    const detteCounts: Record<string, number> = {
        "0-5": 0,
        "6-15": 0,
        "16-30": 0,
        "31-90": 0,
        ">90": 0,
        NR: 0
    };

    data.forEach(d => {
        const bucket = getDetteBucket(d.detteTechnique);
        detteCounts[bucket]++;
    });

    return ORDERED_DETTE.map(cat => ({
        name: cat,
        value: detteCounts[cat] ?? 0,
        color: DETTE_COLORS[cat]
    }));
}

/**
 * Transformateur pour le donut de MEP
 */
export function transformMepData(data: GlobalIndicator[]): DonutChartData[] {
    const mepCounts: Record<string, number> = {
        "0-30": 0,
        "31-60": 0,
        "61-90": 0,
        "91-180": 0,
        ">180": 0,
        NR: 0
    };

    data.forEach(d => {
        const bucket = getMepBucket(d.distanceCount);
        mepCounts[bucket]++;
    });

    return ORDERED_MEP.map(cat => ({
        name: cat,
        value: mepCounts[cat] ?? 0,
        color: MEP_COLORS[cat]
    }));
}
