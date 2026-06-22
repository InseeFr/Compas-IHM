import type { Trend } from "constantes/trend.utils";
import type { DevopsIndicateur } from "../../../models/indicateurs";
import { ToolTipLayout } from "components/ToolTipLayout";
import { TREND_CONFIG } from "constantes/trend.constants";

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

function isUpDownOrStableDevopsBase(diff?: number, lettre?: string): Trend | undefined {
    if (lettre === "NR" || lettre === "SO") {
        return undefined;
    }

    if (diff === undefined) {
        return undefined;
    }

    if (diff === 0) {
        return "flat";
    }

    return diff > 0 ? "up" : "down";
}

function isUpDownOrStableDistance(diff?: number, lettre?: string): Trend | undefined {
    if (lettre === "NR" || lettre === "SO") {
        return undefined;
    }

    if (diff === undefined) {
        return undefined;
    }

    if (diff === 0) {
        return "flat";
    }

    return diff > 0 ? "down" : "up";
}

export function ContributorCell({ row }: Readonly<{ row: { original: DevopsIndicateur } }>) {
    const {
        lettreContributorCount,
        nbContributorCount,
        pastNbContributorCount,
        diffNbContributorCount
    } = row.original;

    const isNR = lettreContributorCount === "NR";
    const isSO = lettreContributorCount === "SO";

    const hasDuplicateFlag =
        typeof lettreContributorCount === "string" && /^[A-E]\sd$/i.test(lettreContributorCount);

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

    const tendance = isUpDownOrStableDevopsBase(diffNbContributorCount, lettreContributorCount);

    const { icon: Icon, color } =
        tendance === undefined ? { icon: () => null, color: "transparent" } : TREND_CONFIG[tendance];

    const tooltip =
        !isNR && !isSO && hasDuplicateFlag
            ? `${baseTooltip} (${pastNbContributorCount}) (doublon d'URL Gitlab)`
            : `${baseTooltip} (${pastNbContributorCount})`;

    return (
        <ToolTipLayout
            title={tooltip}
            content={
                <>
                    {lettreContributorCount} <Icon sx={{ color }} />
                </>
            }
        />
    );
}

export function DeploymentCell({ row }: Readonly<{ row: { original: DevopsIndicateur } }>) {
    const { lettreDeploymentCount, nbDeploymentCount, pastNbDeploymentCount, diffNbDeploymentCount } =
        row.original;

    const tooltip = getTooltip(
        lettreDeploymentCount,
        nbDeploymentCount,
        "mise en production",
        "mises en production"
    );

    const tendance = isUpDownOrStableDevopsBase(diffNbDeploymentCount, lettreDeploymentCount);

    const { icon: Icon, color } =
        tendance === undefined ? { icon: () => null, color: "transparent" } : TREND_CONFIG[tendance];

    return (
        <ToolTipLayout
            title={`${tooltip} (${pastNbDeploymentCount})`}
            content={
                <>
                    {lettreDeploymentCount} <Icon sx={{ color }} />
                </>
            }
        />
    );
}

export function DistanceCell({ row }: Readonly<{ row: { original: DevopsIndicateur } }>) {
    const { lettreDistanceCount, distanceCount, pastDistanceCount, diffDistanceCount } = row.original;

    const tooltip = getTooltip(lettreDistanceCount, distanceCount, "jour", "jours", "Il y a");

    const tendance = isUpDownOrStableDistance(diffDistanceCount, lettreDistanceCount);

    const { icon: Icon, color } =
        tendance === undefined ? { icon: () => null, color: "transparent" } : TREND_CONFIG[tendance];

    return (
        <ToolTipLayout
            title={`${tooltip} (${pastDistanceCount})`}
            content={
                <>
                    {lettreDistanceCount} <Icon sx={{ color }} />
                </>
            }
        />
    );
}
