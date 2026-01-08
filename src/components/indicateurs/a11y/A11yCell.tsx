import type { A11yIndicateur } from "models/indicateurs";
import type { JSX } from "react";
import { ToolTipLayout } from "pages/ToolTipLayout";

export function IssueA11yCell({ row }: Readonly<{ row: { original: A11yIndicateur } }>): JSX.Element {
    const nbIssue = row.original.nbIssueAccessibilite;
    const nbIssueFormatted = nbIssue && nbIssue !== "NR" ? String(Math.round(Number(nbIssue))) : "NR";
    return (
        <ToolTipLayout
            title={`Issue Sonar : ${nbIssueFormatted}`}
            content={<span>{row.original.lettreIssueAccessibilite ?? "NR"}</span>}
        />
    );
}

export function CellWithTooltip({ value }: Readonly<{ value: string | undefined }>): JSX.Element {
    return (
        <ToolTipLayout
            title={value ?? "Aucune valeur"}
            content={<span>{value ?? "Aucune valeur"}</span>}
        />
    );
}
