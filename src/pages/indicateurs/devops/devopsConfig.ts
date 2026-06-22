import type { MRT_TableInstance, MRT_Row, MRT_ColumnDef } from "material-react-table";
import type { DevopsIndicateur } from "models/indicateurs";
import type { Pagination } from "models/table-model";
import { flattenRows, handleExportCsv, escapeCsvValue, getBaseValueCSV } from "utils/exportCsv";
import { ContributorCell, DeploymentCell, DistanceCell } from "./DevopsCell";
import type { IndicateurDevopsView } from "todos-api/client.gen";
import { muiAriaCell } from "utils/accessibility-functions";
import { BASE_COLONNE } from "constantes/constantes";
import { DEVOPS_HEADERS, BASE_HEADERS } from "constantes/constantes-headers";

const getValueDevopsCSV = (row: MRT_Row<DevopsIndicateur>): string[] => {
    return [
        `"${row.original.lettreContributorCount ?? "NR"}"`,
        `"${row.original.lettreDeploymentCount ?? "NR"}"`,
        `"${row.original.lettreDistanceCount ?? "NR"}"`,
        `"${row.original.lettreGlobalDevops ?? "NR"}"`,
        `"${row.original.distanceCount ?? "NR"}"`
    ];
};

export const onExport = (table: MRT_TableInstance<DevopsIndicateur>) => {
    const headers = [
        BASE_HEADERS.NOM_APPLICATION,
        BASE_HEADERS.NOM_MODULE,
        BASE_HEADERS.SERVICE_DEV,
        BASE_HEADERS.DOMAINE_DEV,
        BASE_HEADERS.DOMAINE_FONCTIONNEL,
        DEVOPS_HEADERS.CONTRIBUTEUR,
        DEVOPS_HEADERS.NB_MEP,
        DEVOPS_HEADERS.DERNIERE_MEP,
        DEVOPS_HEADERS.NIVEAU_FRAICHEUR_MEP,
        DEVOPS_HEADERS.DERNIERE_MEP_NOMBRE_JOURS
    ].map(escapeCsvValue);

    const filteredRows: MRT_Row<DevopsIndicateur>[] = flattenRows(table.getExpandedRowModel().rows);

    const csvData: string[] = filteredRows.map(row => {
        return [...getBaseValueCSV(row), ...getValueDevopsCSV(row)].join(",");
    });

    handleExportCsv("devops", table, csvData, headers);
};

export const paginationConfig: Pagination = {
    pagination: {
        pageIndex: 0,
        pageSize: 30
    }
};

export const columnsTable = (): MRT_ColumnDef<DevopsIndicateur>[] => {
    const colonnes: MRT_ColumnDef<DevopsIndicateur>[] = [
        {
            accessorKey: "lettreContributorCount",
            header: DEVOPS_HEADERS.CONTRIBUTEUR,
            Cell: ContributorCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Note Contributeur", cell: cell, row: row })
        },
        {
            accessorKey: "lettreDeploymentCount",
            header: DEVOPS_HEADERS.NB_MEP,
            Cell: DeploymentCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Note de déploiement", cell: cell, row: row })
        },
        {
            accessorKey: "lettreDistanceCount",
            header: DEVOPS_HEADERS.DERNIERE_MEP,
            Cell: DistanceCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Note de distance", cell: cell, row: row })
        }
    ];
    return [...BASE_COLONNE<DevopsIndicateur>(), ...colonnes];
};

export function formatIndicateur(item: IndicateurDevopsView, isModule = false): DevopsIndicateur {
    const baseProperties = {
        applicationName: isModule ? (item.moduleName ?? "NR") : (item.applicationName ?? "NR"),
        sndi: item.sndi ?? "NR",
        domaine: item.domaineSndi ?? "NR",
        domaineFonc: item.domaineFonctionnel ?? "NR",
        lettreContributorCount: item.lettreContributorCount ?? "NR",
        lettreDeploymentCount: item.lettreDeploymentCount ?? "NR",
        lettreDistanceCount: item.lettreDistanceCount ?? "NR",
        nbContributorCount: item.nbContributorCount ?? "NR",
        nbDeploymentCount: item.nbDeploymentCount ?? "NR",
        distanceCount: item.distanceCount ?? "NR",
        lettreGlobalDevops: item.lettreGlobalDevops ?? "NR",
        pastNbContributorCount: item.pastNbContributorCount ?? "NR",
        pastNbDeploymentCount: item.pastNbDeploymentCount ?? "NR",
        pastDistanceCount: item.pastDistanceCount ?? "NR",
        diffNbContributorCount: item.diffNbContributorCount,
        diffNbDeploymentCount: item.diffNbDeploymentCount,
        diffDistanceCount: item.diffDistanceCount
    };

    return {
        ...baseProperties,
        ...(isModule && {
            parentApplication: item.applicationName ?? "NR",
            isModule: true
        })
    };
}
