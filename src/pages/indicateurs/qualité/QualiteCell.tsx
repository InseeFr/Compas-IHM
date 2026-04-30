import type { QualiteIndicateur } from "models/indicateurs";
import { ToolTipLayout } from "components/ToolTipLayout";
import { TREND_CONFIG } from "constantes/trend.constants";
import type { JSX } from "react";
import { Box } from "@mui/material";

function shouldDisplayIcon(value?: string | null): boolean {
    return value !== undefined && value !== null && value !== "" && value !== "NR" && value !== "SO";
}

export function DetteTechCell({ row }: Readonly<{ row: { original: QualiteIndicateur } }>): JSX.Element {
    const rawMinutes = row.original.detteTechnique ?? "NR";
    const minutes = Number.parseFloat(rawMinutes);
    const tooltipText = Number.isNaN(minutes)
        ? "Dette technique : NR"
        : "Dette technique : " + Math.round(minutes / 420) + " jours";
    const tendance = row.original.tendanceTestUnitaire;
    const { icon: Icon, color } = TREND_CONFIG[tendance];
    const showIcon = shouldDisplayIcon(row.original.lettreDetteTechnique);

    return (
        <Box display="flex" alignItems="center" gap={1}>
            <ToolTipLayout title={tooltipText} content={row.original.lettreDetteTechnique ?? "NR"} />
            {showIcon && <Icon sx={{ color }} />}
        </Box>
    );
}

export function FiabiliteCell({ row }: Readonly<{ row: { original: QualiteIndicateur } }>): JSX.Element {
    const fiabilite = row.original.lettreFiabilite ?? "NR";
    const tendance = row.original.tendanceFiabilite;
    const { icon: Icon, color } = TREND_CONFIG[tendance];
    const showIcon = shouldDisplayIcon(fiabilite);
    return (
        <Box display="flex" alignItems="center" gap={1}>
            <ToolTipLayout title={fiabilite} content={fiabilite} />
            {showIcon && <Icon sx={{ color }} />}
        </Box>
    );
}

export function CouvertureTestUnitCell({
    row
}: Readonly<{ row: { original: QualiteIndicateur } }>): JSX.Element {
    const tendance = row.original.tendanceTestUnitaire;
    const { icon: Icon, color } = TREND_CONFIG[tendance];
    const showIcon = shouldDisplayIcon(row.original.lettreCouvertureTestUnitaire);
    return (
        <Box display="flex" alignItems="center" gap={1}>
            <ToolTipLayout
                title={`Couverture : ${row.original.pourcentageCouvertureTestUnitaire ?? "NR"}`}
                content={row.original.lettreCouvertureTestUnitaire ?? "NR"}
            />
            {showIcon && <Icon sx={{ color }} />}
        </Box>
    );
}
