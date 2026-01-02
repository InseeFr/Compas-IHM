import { HEADERS_DEVOPS } from "constantes/constantes-csv";
import type { MRT_TableInstance, MRT_Row } from "material-react-table";
import type { DevopsIndicateur } from "models/devops-indicateur";
import type { ColumnTable, Pagination } from "models/table-model";
import { handleExportCsv } from "utils/exportCsv";
import { filteredColumns } from "utils/filterFunctions";
import { ContributorCell, DeploymentCell, DistanceCell } from "./DevopsCell";
import type { IndicateurDevopsView } from "todos-api/client.gen";

export const onExport = (table: MRT_TableInstance<DevopsIndicateur>) => {
    const filteredRows: MRT_Row<DevopsIndicateur>[] = table.getPrePaginationRowModel().rows;
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

export const columnsTable = (devopsIndicateur: DevopsIndicateur[]): ColumnTable<DevopsIndicateur>[] => {
    return [
        { accessorKey: "applicationName", header: "Nom", enableColumnFilter: false },
        {
            accessorKey: "sndi",
            header: "Service dev.",
            enableColumnFilter: true,
            filterVariant: "select",
            filterSelectOptions: filteredColumns(devopsIndicateur, "sndi")
        },
        {
            accessorKey: "domaine",
            header: "Domaine dev.",
            filterVariant: "select",
            enableColumnFilter: true,
            filterSelectOptions: filteredColumns(devopsIndicateur, "domaine")
        },
        {
            accessorKey: "lettreContributorCount",
            header: "Contributeur",
            enableColumnFilter: false,
            Cell: ContributorCell
        },
        {
            accessorKey: "lettreDeploymentCount",
            header: "Nb de MEP",
            enableColumnFilter: false,
            Cell: DeploymentCell
        },
        {
            accessorKey: "lettreDistanceCount",
            header: "Dernière MEP",
            enableColumnFilter: false,
            Cell: DistanceCell
        }
    ];
};

export function formatIndicateur(item: IndicateurDevopsView, isModule = false): DevopsIndicateur {
    return {
        applicationName: isModule ? (item.moduleName ?? "NR") : (item.applicationName ?? "NR"),
        sndi: item.sndi ?? "NR",
        domaine: item.domaineSndi ?? "NR",
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
