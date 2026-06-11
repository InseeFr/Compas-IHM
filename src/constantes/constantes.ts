import type { MRT_ColumnDef, MRT_RowData } from "material-react-table";
import type { NavBarModel } from "../models/navbar-models";
import { muiAriaCell } from "utils/accessibility-functions";
import { BASE_HEADERS } from "./constantes-headers";

export type ACCESSIBILITE = "conforme" | "partiel" | "Non-conforme";

export type ViewMode = "global" | "prod" | "horsprod";

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
                { label: "Green IT", to: "/indicateur/greenITTable" },
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
        muiTableBodyCellProps: ({ cell, row }) =>
            muiAriaCell({ title: "Service SNDI", cell: cell, row: row })
    }
];
