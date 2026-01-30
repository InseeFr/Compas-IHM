import type { MRT_TableInstance, MRT_Row, MRT_ColumnDef } from "material-react-table";
import type { DevopsIndicateur } from "models/indicateurs";
import type { Pagination } from "models/table-model";
import { flattenRows, getName, handleExportCsv } from "utils/exportCsv";
import { DeploymentCell, DistanceCell } from "./DevopsCell";
import type { IndicateurDevopsView } from "todos-api/client.gen";
import { muiAriaCell } from "utils/accessibility-functions";
import { BASE_COLONNE } from "constantes/constantes";

export const onExport = (table: MRT_TableInstance<DevopsIndicateur>) => {
    const filteredRows: MRT_Row<DevopsIndicateur>[] = flattenRows(table.getExpandedRowModel().rows);
    const csvData: string[] = filteredRows.map(row =>
        [
            `${getName(row)}`,
            `"${row.original.sndi}"`,
            /** `"${row.original.lettreContributorCount}"`,*/
            `"${row.original.lettreDeploymentCount}"`,
            `"${row.original.lettreDistanceCount}"`
        ].join(",")
    );

    handleExportCsv("devops", table, csvData);
};

export const paginationConfig: Pagination = {
    pagination: {
        pageIndex: 0,
        pageSize: 30
    }
};

export const columnsTable = (): MRT_ColumnDef<DevopsIndicateur>[] => {
    const colonnes: MRT_ColumnDef<DevopsIndicateur>[] = [
        /*{
            accessorKey: "lettreContributorCount",
            header: "Contributeur",
            Cell: ContributorCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Note Contributeur", cell: cell, row: row })
        },*/
        {
            accessorKey: "lettreDeploymentCount",
            header: "Nb de MEP",
            Cell: DeploymentCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Note de déploiement", cell: cell, row: row })
        },
        {
            accessorKey: "lettreDistanceCount",
            header: "Dernière MEP",
            Cell: DistanceCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Note de distance", cell: cell, row: row })
        }
    ];

    return [...BASE_COLONNE<DevopsIndicateur>(), ...colonnes];
};

export function formatIndicateur(item: IndicateurDevopsView, isModule = false): DevopsIndicateur {
    return {
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
        ...(isModule
            ? {
                  parentApplication: item.applicationName ?? "NR",
                  isModule: true
              }
            : {})
    };
}
