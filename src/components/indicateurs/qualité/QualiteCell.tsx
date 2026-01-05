import type { QualiteIndicateur } from "models/indicateurs";
import { ToolTipLayout } from "pages/ToolTipLayout";
import type { JSX } from "react";

export function DetteTechCell({ row }: Readonly<{ row: { original: QualiteIndicateur } }>): JSX.Element {
    const rawMinutes = row.original.detteTechnique ?? "NR";
    const minutes = Number.parseFloat(rawMinutes);
    const tooltipText = Number.isNaN(minutes)
        ? "Dette technique : NR"
        : "Dette technique : " + Math.round(minutes / 420) + " jours";
    return <ToolTipLayout title={tooltipText} content={row.original.lettreDetteTechnique ?? "NR"} />;
}

export function CouvertureTestUnitCell({
    row
}: Readonly<{ row: { original: QualiteIndicateur } }>): JSX.Element {
    return (
        <ToolTipLayout
            title={`Couverture : ${row.original.pourcentageCouvertureTestUnitaire ?? "NR"}`}
            content={row.original.lettreCouvertureTestUniaire ?? "NR"}
        />
    );
}
