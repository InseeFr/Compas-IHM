/**
 * Palettes de couleurs pour les différents indicateurs du dashboard
 */

// Qualité générale (lettres A-E)
export const QUALITE_COLORS: Record<string, string> = {
    A: "#2e7d32",
    B: "#66bb6a",
    C: "#ffee58",
    D: "#ffa726",
    E: "#e53935",
    NR: "#bdbdbd",
    SO: "#90a4ae"
};

export const ORDERED_QUALITE = ["A", "B", "C", "D", "E", "NR", "SO"] as const;

// Météo ressentie (1=Orage, 4=Soleil)
export const METEO_LABELS: Record<string, string> = {
    "1": "Orage",
    "2": "Pluie",
    "3": "Nuage",
    "4": "Soleil",
    NR: "NR"
};

export const METEO_COLORS: Record<string, string> = {
    "1": "#d32f2f",
    "2": "#f57c00",
    "3": "#fbc02d",
    "4": "#388e3c",
    NR: "#bdbdbd"
};

export const ORDERED_METEO = ["4", "3", "2", "1", "NR"] as const;

// Dette technique (en jours)
export const DETTE_COLORS: Record<string, string> = {
    "0-5": "#388e3c",
    "6-15": "#66bb6a",
    "16-30": "#fbc02d",
    "31-90": "#f57c00",
    ">90": "#d32f2f",
    NR: "#bdbdbd"
};

export const ORDERED_DETTE = ["0-5", "6-15", "16-30", "31-90", ">90", "NR"] as const;

// Dernière MEP (en jours)
export const MEP_COLORS: Record<string, string> = {
    "0-30": "#388e3c",
    "31-60": "#8bc34a",
    "61-90": "#ffee58",
    "91-180": "#ffa726",
    ">180": "#e53935",
    NR: "#bdbdbd"
};

export const ORDERED_MEP = ["0-30", "31-60", "61-90", "91-180", ">180", "NR"] as const;

// CVE (niveaux de sévérité)
export const CVE_COLORS = {
    critical: "#d32f2f",
    high: "#f57c00",
    medium: "#fbc02d",
    low: "#388e3c"
} as const;
