import { HEADERS_A11Y } from "constantes/constantes-csv";
import type { MRT_Row, MRT_TableInstance } from "material-react-table";
import type { A11yIndicateur } from "models/indicateurs";
import type { ColumnTable, Pagination } from "models/table-model";
import { handleExportCsv, flattenRows } from "utils/exportCsv";
import { filteredColumns } from "utils/filterFunctions";
import type { IndicateursModuleA11Y } from "todos-api/client.gen";
import { IssueA11yCell } from "./A11yCell";

export const OnExport = (table: MRT_TableInstance<A11yIndicateur>) => {
    const allRows: MRT_Row<A11yIndicateur>[] = flattenRows(table.getExpandedRowModel().rows);

    const csvData: string[] = allRows.map(row => {
        // 👇 Supprimer .00 pour le nombre d'issues
        const nbIssueFormatted = row.original.nbIssueAccessibilite
            ? row.original.nbIssueAccessibilite.replace(/\.00$/, "")
            : "NR";

        return [
            `"${row.original.modName}"`,
            `"${row.original.sndi}"`,
            `"${row.original.domaineSndi}"`,
            `"${row.original.notation ?? ""}"`,
            `"${row.original.lettreIssueAccessibilite ?? "NR"}"`,
            `"${nbIssueFormatted}"` // 👈 Utiliser la valeur formatée
        ].join(",");
    });

    handleExportCsv("accessibilité", HEADERS_A11Y, csvData);
};

export const paginationConfig: Pagination = {
    pagination: {
        pageIndex: 0,
        pageSize: 30
    }
};

export const columnsTable = (a11yIndicateur: A11yIndicateur[]): ColumnTable<A11yIndicateur>[] => {
    return [
        {
            accessorKey: "modName",
            header: "Nom du module",
            enableColumnFilter: false
        },
        {
            accessorKey: "sndi",
            header: "Service dev.",
            enableColumnFilter: true,
            filterVariant: "select",
            filterSelectOptions: filteredColumns(a11yIndicateur, "sndi")
        },
        {
            accessorKey: "domaine",
            header: "Domaine dev.",
            filterVariant: "select",
            enableColumnFilter: true,
            filterSelectOptions: filteredColumns(a11yIndicateur, "domaineSndi")
        },
        {
            accessorKey: "notation",
            header: "Notation Évaluation",
            enableColumnFilter: false
        },
        {
            accessorKey: "lettreIssueAccessibilite",
            header: "Issue Sonar",
            enableColumnFilter: false,
            Cell: IssueA11yCell
        }
    ];
};

export function formatIndicateur(item: IndicateursModuleA11Y): A11yIndicateur {
    return {
        modName: item.modName ?? "NR",
        sndi: item.sndi ?? "NR",
        domaineSndi: item.domaineSndi ?? "NR",
        notation: item.notation,
        lettreIssueAccessibilite: item.lettreIssueAccessibilite,
        nbIssueAccessibilite: item.nbIssueAccessibilite
            ? item.nbIssueAccessibilite.replace(/\.00$/, "")
            : undefined
    };
}
