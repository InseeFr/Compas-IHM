export const HEADERS_DEVOPS: string[] = [
    "Nom d'application",
    "Nom de module",
    "Service dev.",
    "Domaine dev.",
    "Contributeur",
    "Déploiement",
    "Distance"
];

export const HEADERS_QUALITE: string[] = [
    "Nom d'application",
    "Nom de module",
    "Service dev.",
    "Domaine dev.",
    "Niveau couverture test",
    "% couverture Test",
    "Niveau dette technique",
    "Dette technique (mn)",
    "Niveau fiabilité"
];

export const HEADERS_GREEN_IT: string[] = [
    "Nom d'application",
    "Service dev.",
    "Domaine dev.",
    "Lettre Green IT",
    "Conso (Wh)",
    "CPU alloué (GHz)",
    "RAM allouée (Go)",
    "Disque alloué (Go)",
    "Gaspillage",
    "Consommation Normalisée",
    "Impact Normalisé",
    "Nombre de VM"
];

export const HEADERS_SECURITE: string[] = [
    "Nom d'application",
    "Nom de module",
    "Service dev.",
    "Domaine dev.",
    "Lettre CVE",
    "Nombre de VM hors délai",
    "Maximum du délai maj VM"
];

export const HEADERS_A11Y: string[] = [
    "Nom du module",
    "Service dev.",
    "Domaine dev.",
    "Notation Évaluation",
    "Lettre Issue Accessibilité",
    "Nb Issue Accessibilité"
];

export const HEADERS_METEO: string[] = ["Application", "Service dev.", "Domaine dev."];

export const CSV_HEADERS = [
    "Nom d'application",
    "Nom de module",
    "Service dev.",
    "Domaine dev.",
    "Domaine fonctionnel",
    "Synthèse Qualité",
    "Synthèse DevOps",
    "Niveau couverture test",
    "% couverture test",
    "Niveau dette technique",
    "Dette technique (jours)",
    "Niveau fiabilité",
    "Niveau CVE",
    "CVE critique",
    "CVE élevé",
    "CVE moyen",
    "CVE faible",
    "Niveau fraîcheur MEP",
    "Dernière MEP (nombre de jours)",
    "Date de la dernière météo",
    "Météo",
    "Commentaire météo",
    "Accessibilité",
    "Score accessibilité",
    "Niveau GreenIT",
    "Conso GreenIT (brute)",
    "Score conso GreenIT (normalisé)",
    "Score impact GreenIT (normalisé)",
    "Score gaspillage GreenIT",
    "Nb VM",
    "CPU alloué",
    "CPU maxi",
    "RAM allouée",
    "RAM maxi",
    "Disque alloué",
    "Disque utilisé",
    "Nb VM (prod)",
    "CPU alloué (prod)",
    "CPU maxi (prod)",
    "RAM allouée (prod)",
    "RAM maxi (prod)",
    "Disque alloué (prod)",
    "Disque utilisé (prod)",
    "Conso GreenIT prod (brute)"
] as const;
