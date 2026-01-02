import { Tooltip } from "@mui/material";
import type { QualiteIndicateur } from "models/indicateurs";
import type { JSX } from "react";

const getToolTip = (title: string, letterToPut: string): JSX.Element => {
    return (
        <Tooltip title={title}>
            <span>{letterToPut}</span>
        </Tooltip>
    );
};

export function DetteTechCell({ row }: Readonly<{ row: { original: QualiteIndicateur } }>): JSX.Element {
    const rawMinutes = row.original.detteTechnique ?? "NR";
    const minutes = Number.parseFloat(rawMinutes);
    const tooltipText = Number.isNaN(minutes)
        ? "Dette technique : NR"
        : "Dette technique : " + Math.round(minutes / 420) + " jours";
    return getToolTip(tooltipText, row.original.detteTechnique ?? "NR");
}

export function CouvertureTestUnitCell({
    row
}: Readonly<{ row: { original: QualiteIndicateur } }>): JSX.Element {
    return getToolTip(
        `Couverture : ${row.original.pourcentageCouvertureTestUniaire ?? "NR"}`,
        row.original.lettreCouvertureTestUniaire ?? "NR"
    );
}
