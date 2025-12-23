import { Tooltip } from "@mui/material";
import type { DevopsIndicateur } from "../../../models/devops-indicateur";

function getTooltip(lettre: string, count: number | string, singularLabel: string, pluralLabel: string, prefix?: string) {
  if (lettre === "NR") return "Non renseigné";
  if (lettre === "SO") return "Sans objet";

  const nb = Number(count) || 0;
  const label = nb <= 1 ? singularLabel : pluralLabel;
  return prefix ? `${prefix} ${nb} ${label}` : `${nb} ${label}`;
}

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
  const tooltip = getTooltip(lettreDeploymentCount, nbDeploymentCount, "mise en production", "mises en production");

  return (
    <Tooltip title={tooltip}>
      <span>{lettreDeploymentCount}</span>
    </Tooltip>
  );
}

export function DistanceCell({ row }: Readonly<{ row: { original: DevopsIndicateur } }>) {
  const { lettreDistanceCount, distanceCount } = row.original;
  const tooltip = getTooltip(lettreDistanceCount, distanceCount, "jour", "jours", "Il y a");

  return (
    <Tooltip title={tooltip}>
      <span>{lettreDistanceCount}</span>
    </Tooltip>
  );
}
