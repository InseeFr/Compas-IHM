import type { A11yIndicateur } from "models/indicateurs";
import type { JSX } from "react";
import { ToolTipLayout } from "components/ToolTipLayout";
import { Box, Typography } from "@mui/material";

export function IssueA11yCell({ row }: Readonly<{ row: { original: A11yIndicateur } }>): JSX.Element {
    const nbIssue = row.original.nbIssueAccessibilite;
    const nbIssueFormatted = nbIssue && nbIssue !== "NR" ? String(Math.round(Number(nbIssue))) : "NR";
    return (
        <ToolTipLayout
            title={`Problème Sonar : ${nbIssueFormatted}`}
            content={row.original.lettreIssueAccessibilite ?? "NR"}
        />
    );
}

export function CellWithTooltip({ value }: Readonly<{ value: string | undefined }>): JSX.Element {
    return <ToolTipLayout title={value ?? "Aucune valeur"} content={value ?? "Aucune valeur"} />;
}

export function DeclarationCell({ row }: Readonly<{ row: { original: A11yIndicateur } }>): JSX.Element {
    const { hasDeclaration, dateDeclaration } = row.original.declaration || {};
    const declaration: string = hasDeclaration ? "Déclarée" : "Non déclarée";
    return (
        <Box>
            <Typography variant="body2" fontWeight="bold">
                {declaration}
            </Typography>
            {dateDeclaration && (
                <Typography variant="caption" display="block" sx={{ mt: 0.5, justifyItems: "center" }}>
                    {dateDeclaration}
                </Typography>
            )}
        </Box>
    );
}

export function AuditCell({ row }: Readonly<{ row: { original: A11yIndicateur } }>): JSX.Element {
    const { score, auditType, dateAudit } = row.original.audit || {};
    return (
        <Box>
            <Typography variant="body2" fontWeight="bold">
                {`Type d'audit: ${auditType}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {`Score: ${score}`}
            </Typography>
            {dateAudit && (
                <Typography variant="caption" display="block" color="text.secondary">
                    {`Date d'audit: ${dateAudit}`}
                </Typography>
            )}
        </Box>
    );
}
