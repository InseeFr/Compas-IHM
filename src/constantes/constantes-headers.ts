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
    SYNTHESE_SECURITE: "Synthèse Sécurité",
    SYNTHESE_DEVOPS: "Synthèse DevOps",
    SYNTHESE_GREENIT: "Synthèse Green",
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
    CONSO_GREENIT_BRUTE: "Conso GreenIT (Wh)",
    SCORE_CONSO_GREENIT: "Score conso GreenIT (normalisé)",
    SCORE_IMPACT_GREENIT: "Score impact GreenIT (normalisé)",
    SCORE_GASPILLAGE_GREENIT: "Score gaspillage GreenIT",
    // Colonnes globales
    NB_VM: "Nb VM",
    CPU_ALLOUE: "CPU alloué (GHz)",
    CPU_MAXI: "CPU maxi (GHz)",
    RAM_ALLOUEE: "RAM allouée (Go)",
    RAM_MAXI: "RAM maxi (Go)",
    DISQUE_ALLOUE: "Disque alloué (Go)",
    DISQUE_UTILISE: "Disque utilisé (Go)",
    // Colonnes prod
    NB_VM_PROD: "Nb VM (prod)",
    CPU_ALLOUE_PROD: "CPU alloué prod (GHz)",
    CPU_MAXI_PROD: "CPU maxi prod (GHz)",
    RAM_ALLOUEE_PROD: "RAM allouée prod (Go)",
    RAM_MAXI_PROD: "RAM maxi prod (Go)",
    DISQUE_ALLOUE_PROD: "Disque alloué prod (Go)",
    DISQUE_UTILISE_PROD: "Disque utilisé prod (Go)",
    CONSO_GREENIT_PROD_BRUTE: "Conso GreenIT prod (Wh)"
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

// ============================================================================
// EXPORT CSV GLOBAL - Construit à partir des headers existants
// ============================================================================
export const CSV_HEADERS = [
    BASE_HEADERS.NOM_APPLICATION,
    BASE_HEADERS.NOM_MODULE,
    BASE_HEADERS.SERVICE_DEV,
    BASE_HEADERS.DOMAINE_DEV,
    BASE_HEADERS.DOMAINE_FONCTIONNEL,
    GLOBAL_HEADERS.SYNTHESE_QUALITE,
    GLOBAL_HEADERS.SYNTHESE_SECURITE,
    GLOBAL_HEADERS.SYNTHESE_DEVOPS,
    GLOBAL_HEADERS.SYNTHESE_GREENIT,
    METEO_HEADERS.METEO,
    QUALITE_HEADERS.NIVEAU_COUVERTURE_TEST,
    QUALITE_HEADERS.POURCENTAGE_COUVERTURE_TEST,
    QUALITE_HEADERS.NIVEAU_DETTE_TECHNIQUE,
    QUALITE_HEADERS.DETTE_TECHNIQUE_JOURS,
    QUALITE_HEADERS.NIVEAU_FIABILITE,
    SECURITE_HEADERS.NIVEAU_CVE,
    SECURITE_HEADERS.CVE_CRITIQUE,
    SECURITE_HEADERS.CVE_ELEVE,
    SECURITE_HEADERS.CVE_MOYEN,
    SECURITE_HEADERS.CVE_FAIBLE,
    DEVOPS_HEADERS.NIVEAU_FRAICHEUR_MEP,
    DEVOPS_HEADERS.DERNIERE_MEP_NOMBRE_JOURS,
    METEO_HEADERS.DATE_DERNIERE_METEO,
    METEO_HEADERS.COMMENTAIRE_METEO,
    ACCESSIBILITE_HEADERS.LETTRE_ACCESSIBILITE,
    ACCESSIBILITE_HEADERS.SCORE_ACCESSIBILITE,
    GREENIT_HEADERS.NIVEAU_GREENIT,
    GREENIT_HEADERS.CONSO_GREENIT_BRUTE,
    GREENIT_HEADERS.SCORE_CONSO_GREENIT,
    GREENIT_HEADERS.SCORE_IMPACT_GREENIT,
    GREENIT_HEADERS.SCORE_GASPILLAGE_GREENIT,
    GREENIT_HEADERS.NB_VM,
    GREENIT_HEADERS.CPU_ALLOUE,
    GREENIT_HEADERS.CPU_MAXI,
    GREENIT_HEADERS.RAM_ALLOUEE,
    GREENIT_HEADERS.RAM_MAXI,
    GREENIT_HEADERS.DISQUE_ALLOUE,
    GREENIT_HEADERS.DISQUE_UTILISE,
    GREENIT_HEADERS.NB_VM_PROD,
    GREENIT_HEADERS.CPU_ALLOUE_PROD,
    GREENIT_HEADERS.CPU_MAXI_PROD,
    GREENIT_HEADERS.RAM_ALLOUEE_PROD,
    GREENIT_HEADERS.RAM_MAXI_PROD,
    GREENIT_HEADERS.DISQUE_ALLOUE_PROD,
    GREENIT_HEADERS.DISQUE_UTILISE_PROD,
    GREENIT_HEADERS.CONSO_GREENIT_PROD_BRUTE
] as const;
