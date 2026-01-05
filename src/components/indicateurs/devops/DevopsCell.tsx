import type { DevopsIndicateur } from "../../../models/indicateurs";
import { ToolTipLayout } from "pages/ToolTipLayout";

function getTooltip(
    lettre: string,
    count: number | string,
    singularLabel: string,
    pluralLabel: string,
    prefix?: string
) {
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
    const hasDuplicateFlag =
        typeof lettreContributorCount === "string" && /^[A-E]\sd$/i.test(lettreContributorCount);

    const nb = Number(nbContributorCount) || 0;

    let baseTooltip: string;
    if (isNR) baseTooltip = "Non renseigné";
    else if (isSO) baseTooltip = "Sans objet";
    else if (nb === 0) baseTooltip = "aucune contribution sur la période";
    else {
        const personneLabel = nb > 1 ? "personnes" : "personne";
        baseTooltip = `${nb} ${personneLabel}`;
    }

    const tooltip =
        !isNR && !isSO && hasDuplicateFlag ? `${baseTooltip} (doublon d'URL Gitlab)` : baseTooltip;

    return <ToolTipLayout title={tooltip} content={lettreContributorCount} />;
}

export function DeploymentCell({ row }: Readonly<{ row: { original: DevopsIndicateur } }>) {
    const { lettreDeploymentCount, nbDeploymentCount } = row.original;
    const tooltip = getTooltip(
        lettreDeploymentCount,
        nbDeploymentCount,
        "mise en production",
        "mises en production"
    );
    return <ToolTipLayout title={tooltip} content={lettreDeploymentCount} />;
}

export function DistanceCell({ row }: Readonly<{ row: { original: DevopsIndicateur } }>) {
    const { lettreDistanceCount, distanceCount } = row.original;
    const tooltip = getTooltip(lettreDistanceCount, distanceCount, "jour", "jours", "Il y a");
    return <ToolTipLayout title={tooltip} content={lettreDistanceCount} />;
}
