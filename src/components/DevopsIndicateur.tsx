import { useEffect, useState } from "react";
import type { DevopsIndicateur } from "../models/devops-indicateur";
import { getApplications2, getModules2, type IndicateurDevopsView } from "../todos-api/client.gen";
import { handleExportCsv } from "../utils/exportCsv";
import { HEADERS_DEVOPS } from "../constantes/constantes-csv";
import {Box, Tooltip } from "@mui/material";
import type { ColumnTable, Pagination } from "../models/table-model";
import ButtonCsvExport from "../pages/ButtonCsvExport";
import TablePageLayout from "../pages/TablePageLayout";

function formatApplication(app: IndicateurDevopsView): DevopsIndicateur {
  return {
    applicationName: app.applicationName ?? "NR",
    sndi: app.sndi ?? "NR",
    domaine: app.domaineSndi ?? "NR",
    lettreContributorCount: app.lettreContributorCount ?? "NR",
    lettreDeploymentCount: app.lettreDeploymentCount ?? "NR",
    lettreDistanceCount: app.lettreDistanceCount ?? "NR",
    nbContributorCount: app.nbContributorCount ?? "NR",
    nbDeploymentCount: app.nbDeploymentCount ?? "NR",
    distanceCount: app.distanceCount ?? "NR",
    lettreGlobalDevops: app.lettreGlobalDevops ?? "NR",
  };
}

function formatModule(module: IndicateurDevopsView): DevopsIndicateur {
  return {
    applicationName: module.moduleName ?? "NR",
    sndi: module.sndi ?? "NR",
    domaine: module.domaineSndi ?? "NR",
    lettreContributorCount: module.lettreContributorCount ?? "NR",
    lettreDeploymentCount: module.lettreDeploymentCount ?? "NR",
    lettreDistanceCount: module.lettreDistanceCount ?? "NR",
    nbContributorCount: module.nbContributorCount ?? "NR",
    nbDeploymentCount: module.nbDeploymentCount ?? "NR",
    distanceCount: module.distanceCount ?? "NR",
    lettreGlobalDevops: module.lettreGlobalDevops ?? "NR",
    parentApplication: module.applicationName ?? "NR",
    isModule: true,
  };
}

export const DevopsIndicateurTable = () => {
  const [devopsIndicateur, setDevopsIndicateur] = useState<DevopsIndicateur[]>([]);
  const [filteredData, setFilteredData] = useState<DevopsIndicateur[]>([]);


  useEffect(() => {
    let isMounted = true;
    Promise.all([getApplications2(), getModules2()])
      .then(([apps, modules]) => {
        if (!isMounted) return;
        const formattedApplications = apps.map(formatApplication);
        const formattedModules = modules.map(formatModule);
        const allData = [...formattedApplications, ...formattedModules];
        setDevopsIndicateur(allData);
        setFilteredData(allData);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des données :", error);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const paginationConfig: Pagination = {
    pagination: {
      pageIndex:0,
      pageSize:35,
    }
  };

  const columnsTable: ColumnTable<DevopsIndicateur>[] = [
     {
            accessorKey: "applicationName",
            header: "Nom"
        },
        {
            accessorKey: "sndi",
            header: "Service dev."
        },
        {
            accessorKey: "domaine",
            header: "Domaine dev."
        },
        {
            accessorKey: "lettreContributorCount",
            header: "Contributeur",
            Cell: ({ row }: { row: { original: DevopsIndicateur } }) => {
                const { lettreContributorCount, nbContributorCount } = row.original;

                const isNR = lettreContributorCount === "NR";
                const isSO = lettreContributorCount === "SO";
                // Détection du flag "d" (ex: "A d", "B d")
                const hasDuplicateFlag =
                    typeof lettreContributorCount === "string" &&
                    /^[A-E]\sd$/i.test(lettreContributorCount);

                const nb = Number(nbContributorCount) || 0;

                let baseTooltip: string;
                if (isNR) {
                    baseTooltip = "Non renseigné";
                } else if (isSO) {
                    baseTooltip = "Sans objet";
                } else if (nb === 0) {
                    baseTooltip = "aucune contribution sur la période";
                } else {
                    const personneLabel = nb > 1 ? "personnes" : "personne";
                    baseTooltip = `${nb} ${personneLabel}`;
                }

                const tooltip =
                    !isNR && !isSO && hasDuplicateFlag
                        ? `${baseTooltip} (doublon d'URL Gitlab)`
                        : baseTooltip;

                return (
                    <Tooltip title={tooltip}>
                        <span>{lettreContributorCount}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "lettreDeploymentCount",
            header: "Nb de MEP",
            Cell: ({ row }: { row: { original: DevopsIndicateur } }) => {
                const { lettreDeploymentCount, nbDeploymentCount } = row.original;

                const isNR = lettreDeploymentCount === "NR";
                const isSO = lettreDeploymentCount === "SO";

                const nb = Number(nbDeploymentCount) || 0;
                const miseLabel = nb <= 1 ? "mise en production" : "mises en production";
                const tooltip = isNR ? "Non renseigné" : isSO ? "Sans objet" : `${nb} ${miseLabel}`;

                return (
                    <Tooltip title={tooltip}>
                        <span>{lettreDeploymentCount}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "lettreDistanceCount",
            header: "Dernière MEP",
            Cell: ({ row }: { row: { original: DevopsIndicateur } }) => {
                const { lettreDistanceCount, distanceCount } = row.original;

                const isNR = lettreDistanceCount === "NR";
                const isSO = lettreDistanceCount === "SO";

                const nb = Number(distanceCount) || 0;
                const jourLabel = nb <= 1 ? "jour" : "jours";
                const tooltip = isNR
                    ? "Non renseigné"
                    : isSO
                      ? "Sans objet"
                      : `Il y a ${nb} ${jourLabel}`;

                return (
                    <Tooltip title={tooltip}>
                        <span>{lettreDistanceCount}</span>
                    </Tooltip>
                );
            }
        }
  ];


  const onExport = (): void => {
    const filter: string[] = filteredData.map(item =>
                [
                    `"${item.isModule ? item.parentApplication : item.applicationName}"`,
                    `"${item.isModule ? item.applicationName : ""}"`,
                    `"${item.sndi}"`,
                    `"${item.domaine}"`,
                    `"${item.lettreContributorCount}"`,
                    `"${item.lettreDeploymentCount}"`,
                    `"${item.lettreDistanceCount}"`
                ].join(","))
     handleExportCsv("devops", HEADERS_DEVOPS, filter);
  } ;


  return (
      <TablePageLayout
        titleTable="Table Indicateur DEVOPS"
        data={devopsIndicateur}
        columns={columnsTable}
        paginationConfig={paginationConfig}
        rowId={row => row.isModule
                        ? `${row.parentApplication}-${row.applicationName}`
                        : row.applicationName}
        renderTopCustom={()=>(
          <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        flexWrap="wrap"
                        sx={{ width: "100%", p: 1 }}
                    >
                      <ButtonCsvExport onExport={onExport}/>
          </Box>
        )}
      />
  );
};
