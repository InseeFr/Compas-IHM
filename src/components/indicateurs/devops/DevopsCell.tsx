import { Tooltip } from "@mui/material";
import type { DevopsIndicateur } from "../../../models/devops-indicateur";

export function ContributorCell({ row }: Readonly<{ row: { original: DevopsIndicateur } }>) {
  const { lettreContributorCount, nbContributorCount } = row.original;

  const isNR = lettreContributorCount === "NR";
  const isSO = lettreContributorCount === "SO";
  const hasDuplicateFlag = typeof lettreContributorCount === "string" && /^[A-E]\sd$/i.test(lettreContributorCount);

  const nb = Number(nbContributorCount) || 0;

  let baseTooltip: string;
  if (isNR) baseTooltip = "Non renseigné";
  else if (isSO) baseTooltip = "Sans objet";
  else if (nb === 0) baseTooltip = "aucune contribution sur la période";
  else {
    const personneLabel = nb > 1 ? "personnes" : "personne";
    baseTooltip = `${nb} ${personneLabel}`;
  }

  const tooltip = !isNR && !isSO && hasDuplicateFlag
    ? `${baseTooltip} (doublon d'URL Gitlab)`
    : baseTooltip;

  return (
    <Tooltip title={tooltip}>
      <span>{lettreContributorCount}</span>
    </Tooltip>
  );
}

export function DeploymentCell({ row }: Readonly<{ row: { original: DevopsIndicateur } }>) {
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

export function DistanceCell({ row }: Readonly<{ row: { original: DevopsIndicateur } }>) {
  const { lettreDistanceCount, distanceCount } = row.original;

  const isNR = lettreDistanceCount === "NR";
  const isSO = lettreDistanceCount === "SO";
  const nb = Number(distanceCount) || 0;
  const jourLabel = nb <= 1 ? "jour" : "jours";
  const tooltip = isNR ? "Non renseigné" : isSO ? "Sans objet" : `Il y a ${nb} ${jourLabel}`;

  return (
    <Tooltip title={tooltip}>
      <span>{lettreDistanceCount}</span>
    </Tooltip>
  );
}
