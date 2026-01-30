import type { SecuriteIndicateur } from "models/indicateurs";
import { ToolTipLayout } from "components/ToolTipLayout";
import type { JSX } from "react";

export function CveCell({ row }: Readonly<{ row: { original: SecuriteIndicateur } }>): JSX.Element {
    const tooltipText = `Cve critique : ${
        row.original.nbCveCritical === "NR" ? "NR" : Number(row.original.nbCveCritical)
    }\nCve élevé : ${
        row.original.nbCveHigh === "NR" ? "NR" : Number(row.original.nbCveHigh)
    }\nCve moyenne : ${
        row.original.nbCveMedium === "NR" ? "NR" : Number(row.original.nbCveMedium)
    }\nCve faible : ${row.original.nbCveLow === "NR" ? "NR" : Number(row.original.nbCveLow)}`;

    return (
        <ToolTipLayout
            title={tooltipText}
            content={row.original.lettreNiveauCve ?? row.original.lettreCve ?? "NR"}
        />
    );
}

export function MajVmCell({ row }: Readonly<{ row: { original: SecuriteIndicateur } }>): JSX.Element {
    const tooltipText = `Nb VM non Hors delai : ${row.original.nbVmNonMaj ?? "NR"}`;

    return <ToolTipLayout title={tooltipText} content={row.original.lettreMajVm ?? "NR"} />;
}
