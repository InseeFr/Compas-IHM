import type { QualiteIndicateur } from "models/indicateurs";
import { ToolTipLayout } from "components/ToolTipLayout";
import { TREND_CONFIG } from "constantes/trend.constants";
import type { JSX } from "react";
import { Box } from "@mui/material";

function shouldDisplayIcon(note?: string | null, extraValue?: string | null): boolean {
    const isNoteValid =
        note !== undefined && note !== null && note !== "" && note !== "NR" && note !== "SO";

    const hasExtraValue = extraValue !== undefined && extraValue !== null && extraValue !== "NR";

    return isNoteValid && hasExtraValue;
}

export function DetteTechCell({ row }: Readonly<{ row: { original: QualiteIndicateur } }>): JSX.Element {
    const rawMinutes = row.original.detteTechnique ?? "NR";
    const rawMinutesPast = row.original.detteTechniquePast ?? "NR";
    console.log(row);
    const minutes = Number.parseFloat(rawMinutes);
    const minutesPast = Number.parseFloat(rawMinutesPast);
    const tooltipText = Number.isNaN(minutes)
        ? "Dette technique : NR"
        : "Dette technique : " + (minutes / 420).toFixed(1) + " jours";
    const tooltipTextPast = Number.isNaN(minutesPast)
        ? "(NR)"
        : "(" + (minutesPast / 420).toFixed(1) + " jours)";
    const tooltipCombined = `${tooltipText} : ${tooltipTextPast}`;

    const tendance = row.original.tendanceDetteTechnique;
    const { icon: Icon, color } = TREND_CONFIG[tendance];
    const showIcon = shouldDisplayIcon(
        row.original.lettreDetteTechnique,
        row.original.pourcentageCouvertureTestUnitairePast
    );

    return (
        <Box display="flex" alignItems="center" gap={1}>
            <ToolTipLayout title={tooltipCombined} content={row.original.lettreDetteTechnique ?? "NR"} />
            {showIcon && <Icon sx={{ color }} />}
        </Box>
    );
}

export function FiabiliteCell({ row }: Readonly<{ row: { original: QualiteIndicateur } }>): JSX.Element {
    const fiabilite = row.original.lettreFiabilite ?? "NR";
    const fiabilitePast = row.original.lettreFiabilitePast ?? "NR";
    const tooltipCombined = `${fiabilite} ( ${fiabilitePast})`;  
    const tendance = row.original.tendanceFiabilite;
    const { icon: Icon, color } = TREND_CONFIG[tendance];
    const showIcon = shouldDisplayIcon(fiabilite, row.original.pourcentageCouvertureTestUnitairePast);
    return (
        <Box display="flex" alignItems="center" gap={1}>
            <ToolTipLayout title={tooltipCombined}  content={fiabilite} />
            {showIcon && <Icon sx={{ color }} />}
        </Box>
    );
}

export function CouvertureTestUnitCell({
    row
}: Readonly<{ row: { original: QualiteIndicateur } }>): JSX.Element {
    const tendance = row.original.tendanceTestUnitaire;
    const { icon: Icon, color } = TREND_CONFIG[tendance];
    const showIcon = shouldDisplayIcon(
        row.original.lettreCouvertureTestUnitaire,
        row.original.pourcentageCouvertureTestUnitairePast
    );
    console.log(row.original.applicationName, " ", row.original.pourcentageCouvertureTestUnitairePast);
    return (
        <Box display="flex" alignItems="center" gap={1}>
            <ToolTipLayout
                title={`Couvertures : ${row.original.pourcentageCouvertureTestUnitaire ?? "NR"} (${row.original.pourcentageCouvertureTestUnitairePast ?? "NR"})`}
                content={row.original.lettreCouvertureTestUnitaire ?? "NR"}
            />
            {showIcon && <Icon sx={{ color }} />}
        </Box>
    );
}
