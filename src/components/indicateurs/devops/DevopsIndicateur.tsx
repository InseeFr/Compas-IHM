import { useEffect, useState } from "react";
import type { DevopsIndicateur } from "../../../models/devops-indicateur";
import { getApplications2, getModules2, type IndicateurDevopsView } from "../../../todos-api/client.gen";
import { handleExportCsv } from "../../../utils/exportCsv";
import { HEADERS_DEVOPS } from "../../../constantes/constantes-csv";
import { Box } from "@mui/material";
import type { ColumnTable, Pagination } from "../../../models/table-model";
import ButtonCsvExport from "../../../pages/ButtonCsvExport";
import TablePageLayout from "../../../pages/TablePageLayout";
import { filteredColumns } from "../../../utils/filterFunctions";
import type { MRT_Row, MRT_TableInstance } from "material-react-table";
import { ContributorCell, DeploymentCell, DistanceCell } from "./DevopsCell";

function formatIndicateur(item: IndicateurDevopsView, isModule = false): DevopsIndicateur {
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

export const DevopsIndicateurTable = () => {
    const [devopsIndicateur, setDevopsIndicateur] = useState<DevopsIndicateur[]>([]);

    useEffect(() => {
        let isMounted: boolean = true;

        async function fetchData(): Promise<void> {
            try {
                const [apps, modules] = await Promise.all([getApplications2(), getModules2()]);
                if (!isMounted) return;

                const formattedApplications = apps.map(app => formatIndicateur(app));
                const formattedModules = modules.map(module => formatIndicateur(module, true));

                setDevopsIndicateur([...formattedApplications, ...formattedModules]);
            } catch (error) {
                console.error("Erreur lors de la récupération des données :", error);
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    const paginationConfig: Pagination = {
        pagination: {
            pageIndex: 0,
            pageSize: 35
        }
    };

    const columnsTable: ColumnTable<DevopsIndicateur>[] = [
        { accessorKey: "applicationName", header: "Nom", enableColumnFilter: false },
        {
            accessorKey: "sndi",
            header: "Service dev.",
            enableColumnFilter: true,
            filterVariant: "multi-select",
            filterSelectOptions: filteredColumns(devopsIndicateur, "sndi")
        },
        {
            accessorKey: "domaine",
            header: "Domaine dev.",
            enableColumnFilter: true,
            filterVariant: "multi-select",
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

    const onExport = (table: MRT_TableInstance<DevopsIndicateur>) => {
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

    return (
        <TablePageLayout
            titleTable="Table Indicateur DEVOPS"
            data={devopsIndicateur}
            columns={columnsTable}
            paginationConfig={paginationConfig}
            rowId={row =>
                row.isModule ? `${row.parentApplication}-${row.applicationName}` : row.applicationName
            }
            renderTopCustom={({ table }) => (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    sx={{ width: "100%", p: 1 }}
                >
                    <ButtonCsvExport table={table} onExport={onExport} />
                </Box>
            )}
        />
    );
};
