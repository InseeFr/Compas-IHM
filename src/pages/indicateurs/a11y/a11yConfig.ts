import type { MRT_ColumnDef, MRT_Row, MRT_TableInstance } from "material-react-table";
import type { A11yIndicateur } from "models/indicateurs";
import type { Pagination } from "models/table-model";
import { handleExportCsv, flattenRows, escapeCsvValue } from "utils/exportCsv";
import type { IndicateursModuleA11Y, Module } from "todos-api/client.gen";
import { AuditCell, DeclarationCell, IssueA11yCell } from "./A11yCell";
import { generateAriaLabelCell } from "utils/accessibility-functions";
import { BASE_COLONNE } from "constantes/constantes";
import { ACCESSIBILITE_HEADERS, BASE_HEADERS } from "constantes/constantes-headers";

export const OnExport = (table: MRT_TableInstance<A11yIndicateur>) => {
    const headers = [
        BASE_HEADERS.NOM_MODULE,
        BASE_HEADERS.SERVICE_DEV,
        BASE_HEADERS.DOMAINE_DEV,
        BASE_HEADERS.DOMAINE_FONCTIONNEL,
        ACCESSIBILITE_HEADERS.LETTRE_ACCESSIBILITE,
        ACCESSIBILITE_HEADERS.SCORE_ACCESSIBILITE,
        ACCESSIBILITE_HEADERS.TYPE_AUDIT,
        ACCESSIBILITE_HEADERS.DATE_AUDIT,
        ACCESSIBILITE_HEADERS.ISSUE_SONAR,
        ACCESSIBILITE_HEADERS.NBR_ISSUE_SONAR
    ].map(escapeCsvValue);

    const filteredRows: MRT_Row<A11yIndicateur>[] = flattenRows(table.getExpandedRowModel().rows);

    const csvData: string[] = filteredRows.map(row => {
        return [
            `"${row.original.modName}"`,
            `"${row.original.sndi}"`,
            `"${row.original.domaine}"`,
            `"${row.original.domaineFonc}"`,
            `"${row.original.notation ?? "NR"}"`,
            `"${row.original.audit.score ?? "NR"}"`,
            `"${row.original.audit.auditType ?? "NR"}"`,
            `"${row.original.audit.dateAudit ?? "NR"}"`,
            `"${row.original.lettreIssueAccessibilite ?? "NR"}"`,
            `"${row.original.nbIssueAccessibilite ?? "NR"}"`
        ].join(",");
    });

    handleExportCsv("accessibilité", table, csvData, headers);
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
            header: ACCESSIBILITE_HEADERS.LETTRE_ACCESSIBILITE,
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
            header: ACCESSIBILITE_HEADERS.ISSUE_SONAR,
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
