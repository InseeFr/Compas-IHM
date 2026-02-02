// ============================================================================
// EXPORT CSV GLOBAL - Array utilisé directement dans les exports
// ============================================================================
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

// ============================================================================
// COLONNES DE BASE (communes à tous les tableaux)
// ============================================================================
export const BASE_HEADERS = {
    NOM: "Nom",
    NOM_APPLICATION: "Nom d'application",
    NOM_MODULE: "Nom de module",
    SERVICE_DEV: "Service dev.",
    DOMAINE_DEV: "Domaine dev.",
    DOMAINE_FONCTIONNEL: "Domaine fonctionnel"
} as const;

// ============================================================================
// INDICATEURS GLOBAUX (tableau principal)
// ============================================================================
export const GLOBAL_HEADERS = {
    ...BASE_HEADERS,
    SYNTHESE_QUALITE: "Synthèse Qualité",
    SYNTHESE_DEVOPS: "Synthèse DevOps",
    QUALITE: "Qualité",
    SECURITE: "Sécurité",
    DEVOPS: "DevOps",
    GREENIT: "GreenIt",
    METEO_RESSENTIE: "Météo ressentie",
    ACCESSIBILITE: "Accessibilité",
    MATURITE_CLOUD: "Maturité Cloud"
} as const;

// ============================================================================
// QUALITÉ
// ============================================================================
export const QUALITE_HEADERS = {
    ...BASE_HEADERS,
    COUVERTURE_TEST: "Couverture de Test",
    NIVEAU_COUVERTURE_TEST: "Niveau couverture test",
    POURCENTAGE_COUVERTURE_TEST: "% couverture test",
    FIABILITE: "Fiabilité",
    NIVEAU_FIABILITE: "Niveau fiabilité",
    DETTE_TECHNIQUE: "Dette Technique",
    NIVEAU_DETTE_TECHNIQUE: "Niveau dette technique",
    DETTE_TECHNIQUE_JOURS: "Dette technique (jours)"
} as const;

// ============================================================================
// SÉCURITÉ
// ============================================================================
export const SECURITE_HEADERS = {
    ...BASE_HEADERS,
    CVE: "CVE",
    NIVEAU_CVE: "Niveau CVE",
    CVE_CRITIQUE: "CVE critique",
    CVE_ELEVE: "CVE élevé",
    CVE_MOYEN: "CVE moyen",
    CVE_FAIBLE: "CVE faible",
    NB_VMS_HORS_DELAI: "nb de VMs hors délai",
    MAX_DELAI_MAJ_VM: "Max delai Maj VM"
} as const;

// ============================================================================
// DEVOPS
// ============================================================================
export const DEVOPS_HEADERS = {
    ...BASE_HEADERS,
    CONTRIBUTEUR: "Contributeur",
    NB_MEP: "Nombre de MEP",
    DERNIERE_MEP: "Dernière MEP",
    NIVEAU_FRAICHEUR_MEP: "Niveau fraîcheur MEP",
    DERNIERE_MEP_NOMBRE_JOURS: "Dernière MEP (nombre de jours)"
} as const;

// ============================================================================
// GREENIT
// ============================================================================
export const GREENIT_HEADERS = {
    ...BASE_HEADERS,
    CONSO_WH: "Conso (Wh)",
    CPU_ALLOUE_GHZ: "CPU alloué (GHz)",
    RAM_ALLOUEE_GO: "RAM allouée (Go)",
    DISQUE_ALLOUE_GO: "Disque alloué (Go)",
    NOMBRE_VM: "Nombre de VM",
    NIVEAU_GREENIT: "Niveau GreenIT",
    CONSO_GREENIT_BRUTE: "Conso GreenIT (brute)",
    SCORE_CONSO_GREENIT: "Score conso GreenIT (normalisé)",
    SCORE_IMPACT_GREENIT: "Score impact GreenIT (normalisé)",
    SCORE_GASPILLAGE_GREENIT: "Score gaspillage GreenIT",
    // Colonnes globales
    NB_VM: "Nb VM",
    CPU_ALLOUE: "CPU alloué",
    CPU_MAXI: "CPU maxi",
    RAM_ALLOUEE: "RAM allouée",
    RAM_MAXI: "RAM maxi",
    DISQUE_ALLOUE: "Disque alloué",
    DISQUE_UTILISE: "Disque utilisé",
    // Colonnes prod
    NB_VM_PROD: "Nb VM (prod)",
    CPU_ALLOUE_PROD: "CPU alloué (prod)",
    CPU_MAXI_PROD: "CPU maxi (prod)",
    RAM_ALLOUEE_PROD: "RAM allouée (prod)",
    RAM_MAXI_PROD: "RAM maxi (prod)",
    DISQUE_ALLOUE_PROD: "Disque alloué (prod)",
    DISQUE_UTILISE_PROD: "Disque utilisé (prod)",
    CONSO_GREENIT_PROD_BRUTE: "Conso GreenIT prod (brute)"
} as const;

// ============================================================================
// MÉTÉO
// ============================================================================
export const METEO_HEADERS = {
    ...BASE_HEADERS,
    NOM: "Nom",
    DATE_DERNIERE_METEO: "Date de la dernière météo",
    METEO: "Météo",
    COMMENTAIRE_METEO: "Commentaire météo"
} as const;

// ============================================================================
// ACCESSIBILITÉ
// ============================================================================
export const ACCESSIBILITE_HEADERS = {
    ...BASE_HEADERS,
    LETTRE_ACCESSIBILITE: "Notation Évaluation",
    SCORE_ACCESSIBILITE: "Score accessibilité",
    DATE_DECLARATION: "Date de déclaration",
    TYPE_AUDIT: "Type d'audit",
    DATE_AUDIT: "Date d'audit",
    ISSUE_SONAR: "Problème Sonar",
    NBR_ISSUE_SONAR: "Nombre d'issue Sonar"
} as const;
