import type { MRT_ColumnDef, MRT_RowData } from "material-react-table";
import type { NavBarModel } from "../models/navbar-models";
import { muiAriaCell } from "utils/accessibility-functions";
import { BASE_HEADERS } from "./constantes-headers";

export type ACCESSIBILITE = "conforme" | "partiel" | "Non-conforme";

export type ViewMode = "global" | "prod" | "horsprod";

export const BYTES_PER_GB = 1024 ** 3;

// Fonction de filtre générique pour filtrer uniquement sur le nom d'application/module (pas les sous-modules)
// Elle gère plusieurs cas :
// - Objets avec isModule=true (modules) : exclus du filtre global
// - Objets avec applicationName : filtre sur applicationName
// - Objets avec modName mais pas applicationName : filtre sur modName
export const filterByApplicationName = (row: unknown, search: string): boolean => {
    const r = row as { isModule?: boolean; applicationName?: string; modName?: string };
    if (r.isModule === true) return true;
    const nom = r.applicationName ?? r.modName ?? "";
    return nom.toLowerCase().includes(search.trim().toLowerCase());
};

export const NAV_TEXTS: NavBarModel = {
    items: [
        {
            title: "Tableaux de bord",
            subItem: [
                { label: "Vue d'ensemble", to: "/dashboard/overview" },
                { label: "Synthèse par application", to: "/dashboard/synthese" },
                { label: "Maturité Cloud par application", to: "/dashboard/maturite" }
            ]
        },
        {
            title: "Indicateurs",
            subItem: [
                { label: "Indicateurs principaux", to: "/indicateur/mainIndicators" },
                { label: "Qualité", to: "/indicateur/qualiteTable" },
                { label: "Devops", to: "/indicateur/devopsTable" },
                { label: "Écoconception", to: "/indicateur/greenITTable" },
                { label: "Sécurité", to: "/indicateur/securiteTable" },
                { label: "Accessibilité", to: "/indicateur/accessibiliteTable" },
                { label: "Dernières Méteo", to: "/indicateur/meteoTable" },
                { label: "Stratégie Cloud", to: "/indicateur/strategieCloudTable" }
            ]
        },
        {
            title: "Saisie",
            subItem: [
                { label: "Saisie météo", to: "/saisie/meteo" },
                { label: "Saisie accessibilité", to: "/saisie/accessibilité" },
                { label: "Saisie stratégie cloud", to: "/saisie/strategiecloud" }
            ]
        }
    ]
};

export const BASE_COLONNE = <T extends MRT_RowData>(isModule?: boolean): MRT_ColumnDef<T>[] => [
    isModule
        ? {
              accessorKey: "modName",
              header: BASE_HEADERS.NOM_MODULE,
              enableGlobalFilter: false,
              muiTableBodyCellProps: ({ cell, row }) =>
                  muiAriaCell({ title: "Module", cell: cell, row: row })
          }
        : {
              accessorKey: "applicationName",
              header: BASE_HEADERS.NOM,
              muiTableBodyCellProps: ({ cell, row }) => ({
                  component: "th",
                  scope: "row",
                  ...muiAriaCell({ title: "Application", cell: cell, row: row })
              })
          },
    {
        accessorKey: "sndi",
        header: BASE_HEADERS.SERVICE_DEV,
        enableGlobalFilter: false,
        muiTableBodyCellProps: ({ cell, row }) =>
            muiAriaCell({ title: "Service SNDI", cell: cell, row: row })
    }
];