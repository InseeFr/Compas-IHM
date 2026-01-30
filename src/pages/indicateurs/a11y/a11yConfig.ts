import type { MRT_ColumnDef, MRT_TableInstance } from "material-react-table";
import type { A11yIndicateur } from "models/indicateurs";
import type { Pagination } from "models/table-model";
import { handleExportCsv, flattenRows } from "utils/exportCsv";
import type { IndicateursModuleA11Y, Module } from "todos-api/client.gen";
import { AuditCell, DeclarationCell, IssueA11yCell } from "./A11yCell";
import { generateAriaLabelCell } from "utils/accessibility-functions";
import { BASE_COLONNE } from "constantes/constantes";

export const OnExport = (table: MRT_TableInstance<A11yIndicateur>) => {
    const allRows = flattenRows(table.getExpandedRowModel().rows);

    const csvEscape = (value?: string | number | boolean | null) =>
        `"${String(value ?? "NR").replaceAll('"', '""')}"`;

    const csvData = allRows.map(row => {
        const sonar: string = row.original.lettreIssueAccessibilite
            ? `${row.original.lettreIssueAccessibilite}`
            : "NR";

        const audit: string = row.original.audit
            ? `Type: ${row.original.audit.auditType} - date:${row.original.audit.dateAudit} - Score:${row.original.audit.score}`
            : "NR";

        const declared = (declaration?: {
            hasDeclaration: boolean;
            dateDeclaration: string;
        }): string => {
            if (!declaration) return "Non déclarée";
            return `Déclarée - Date: ${declaration.dateDeclaration ?? "NR"}`;
        };
        const declaration: string = declared(row.original.declaration);

        return [
            csvEscape(row.original.modName),
            csvEscape(row.original.sndi),
            csvEscape(row.original.notation),
            csvEscape(declaration),
            csvEscape(audit),
            csvEscape(sonar)
        ].join(",");
    });

    handleExportCsv("accessibilité", table, csvData);
};

export const paginationConfig: Pagination = {
    pagination: {
        pageIndex: 0,
        pageSize: 30
    }
};

export const columnsTable = (): MRT_ColumnDef<A11yIndicateur>[] => {
    const colonnes: MRT_ColumnDef<A11yIndicateur>[] = [
        {
            accessorKey: "notation",
            header: "Notation Évaluation",
            muiTableBodyCellProps: ({ cell, row }) => ({
                "aria-label": generateAriaLabelCell(
                    "Notation",
                    row.original.modName,
                    cell.getValue<string>(),
                    true
                )
            })
        },
        {
            accessorKey: "declaration",
            header: "Déclaration",
            accessorFn: row => row.declaration,
            Cell: DeclarationCell,
            muiTableBodyCellProps: ({ cell, row }) => {
                const value = cell.getValue<{ hasDeclaration: boolean; dateDeclaration: string }>();

                const declaration: string = value?.hasDeclaration ? "Déclarée" : "Non Déclarée";
                const date: string = value?.dateDeclaration || "Non renseignée";

                return {
                    "aria-label": generateAriaLabelCell(
                        "Déclaration d'audit",
                        row.original.modName,
                        `Déclaration ${declaration}, Date: ${date}`,
                        true
                    )
                };
            }
        },
        {
            accessorKey: "audit",
            header: "Audit",
            Cell: AuditCell,
            muiTableBodyCellProps: ({ cell, row }) => {
                const value = cell.getValue<{ auditType: string; score: string; dateAudit: string }>();
                return {
                    "aria-label": generateAriaLabelCell(
                        "Audit",
                        row.original.modName,
                        `Type d'audit ${value?.auditType}, date: ${value?.dateAudit}, score: ${value?.score}`,
                        true
                    )
                };
            }
        },
        {
            accessorKey: "lettreIssueAccessibilite",
            header: "Problème Sonar",
            Cell: IssueA11yCell,
            muiTableBodyCellProps: ({ cell, row }) => ({
                "aria-label": generateAriaLabelCell(
                    "Problème Sonar",
                    row.original.modName,
                    cell.getValue<string>(),
                    true
                )
            })
        }
    ];
    return [...BASE_COLONNE<A11yIndicateur>(true), ...colonnes];
};

const ValueOrDefaulf = (value?: string | number): string => {
    return value ? String(value) : "NR";
};

export function formatIndicateur(item: IndicateursModuleA11Y, module?: Module): A11yIndicateur {
    return {
        modName: ValueOrDefaulf(item.modName),
        sndi: ValueOrDefaulf(item.sndi),
        domaine: ValueOrDefaulf(item.domaineSndi),
        domaineFonc: ValueOrDefaulf(module?.domaineFonctionnel),
        notation: item.notation,
        lettreIssueAccessibilite: item.lettreIssueAccessibilite,
        nbIssueAccessibilite: item.nbIssueAccessibilite
            ? item.nbIssueAccessibilite.replace(/\.00$/, "")
            : undefined,
        declaration: item.isDeclaration
            ? {
                  hasDeclaration: item.isDeclaration,
                  dateDeclaration: ValueOrDefaulf(item.dateDeclaration)
              }
            : undefined,
        audit: {
            dateAudit: ValueOrDefaulf(item.dateAudit),
            auditType: ValueOrDefaulf(item.typeAuditLibelle),
            score: ValueOrDefaulf(item.scoreAudit)
        }
    };
}
