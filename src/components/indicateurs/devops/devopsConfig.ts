import { HEADERS_DEVOPS } from "constantes/constantes-csv";
import type { MRT_TableInstance, MRT_Row } from "material-react-table";
import type { DevopsIndicateur } from "models/indicateurs";
import type { ColumnTable, Pagination } from "models/table-model";
import { flattenRows, handleExportCsv } from "utils/exportCsv";
import { ContributorCell, DeploymentCell, DistanceCell } from "./DevopsCell";
import type { IndicateurDevopsView } from "todos-api/client.gen";

export const onExport = (table: MRT_TableInstance<DevopsIndicateur>) => {
    const filteredRows: MRT_Row<DevopsIndicateur>[] = flattenRows(table.getExpandedRowModel().rows);
    const csvData: string[] = filteredRows.map(row =>
        [
            `"${row.original.isModule ? row.original.parentApplication : row.original.applicationName}"`,
            `"${row.original.isModule ? row.original.applicationName : ""}"`,
            `"${row.original.sndi}"`,
            `"${row.original.domaine}"`,
            `"${row.original.lettreContributorCount}"`,
            `"${row.original.lettreDeploymentCount}"`,
            `"${row.original.lettreDistanceCount}"`
        ].join(",")
    );

    handleExportCsv("devops", HEADERS_DEVOPS, csvData);
};

export const paginationConfig: Pagination = {
    pagination: {
        pageIndex: 0,
        pageSize: 30
    }
};

export const columnsTable = (): ColumnTable<DevopsIndicateur>[] => {
    return [
        { accessorKey: "applicationName", header: "Nom" },
        { accessorKey: "sndi", header: "serviceDev" },
        {
            accessorKey: "lettreContributorCount",
            header: "Contributeur",
            Cell: ContributorCell
        },
        {
            accessorKey: "lettreDeploymentCount",
            header: "Nb de MEP",
            Cell: DeploymentCell
        },
        {
            accessorKey: "lettreDistanceCount",
            header: "Dernière MEP",
            Cell: DistanceCell
        }
    ];
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
