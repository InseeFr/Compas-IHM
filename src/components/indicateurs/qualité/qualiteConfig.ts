import { HEADERS_QUALITE } from "constantes/constantes-csv";
import type { MRT_Row, MRT_TableInstance } from "material-react-table";
import type { QualiteIndicateur } from "models/indicateurs";
import type { ColumnTable, Pagination } from "models/table-model";
import { flattenRows, handleExportCsv } from "utils/exportCsv";
import { filteredColumns } from "utils/filterFunctions";
import { CouvertureTestUnitCell, DetteTechCell } from "./QualiteCell";
import type { IndicateurQualiteView } from "todos-api/client.gen";

export const OnExport = (table: MRT_TableInstance<QualiteIndicateur>) => {
    const filteredRows: MRT_Row<QualiteIndicateur>[] = flattenRows(table.getExpandedRowModel().rows);
    const csvData: string[] = filteredRows.map(row =>
        [
            `"${row.original.isModule ? row.original.parentApplication : row.original.applicationName}"`,
            `"${row.original.isModule ? row.original.applicationName : ""}"`,
            `"${row.original.sndi}"`,
            `"${row.original.domaine}"`,
            `"${row.original.lettreCouvertureTestUniaire}"`,
            `"${row.original.pourcentageCouvertureTestUnitaire}"`,
            `"${row.original.lettreDetteTechnique}"`,
            `"${row.original.detteTechnique}"`,
            `"${row.original.lettreFiabilite}"`
        ].join(",")
    );
    handleExportCsv("qualité", HEADERS_QUALITE, csvData);
};

export const paginationConfig: Pagination = {
    pagination: {
        pageIndex: 0,
        pageSize: 30
    }
};

export const columnsTable = (
    qualiteIndicateur: QualiteIndicateur[]
): ColumnTable<QualiteIndicateur>[] => {
    return [
        { accessorKey: "applicationName", header: "Nom", enableColumnFilter: false },
        {
            accessorKey: "sndi",
            header: "Service dev.",
            enableColumnFilter: true,
            filterVariant: "select",
            filterSelectOptions: filteredColumns(qualiteIndicateur, "sndi")
        },
        {
            accessorKey: "domaine",
            header: "Domaine dev.",
            filterVariant: "select",
            enableColumnFilter: true,
            filterSelectOptions: filteredColumns(qualiteIndicateur, "domaine")
        },
        {
            accessorKey: "lettreCouvertureTestUniaire",
            header: "Couverture de Test",
            enableColumnFilter: false,
            Cell: CouvertureTestUnitCell
        },
        {
            accessorKey: "lettreFiabilite",
            header: "Fiabilité",
            enableColumnFilter: false
        },
        {
            accessorKey: "lettreDetteTechnique",
            header: "Dette Technique",
            enableColumnFilter: false,
            Cell: DetteTechCell
        }
    ];
};

export function formatIndicateur(item: IndicateurQualiteView, isModule = false): QualiteIndicateur {
    return {
        applicationId: isModule ? undefined : item.applicationId,
        applicationName: isModule ? (item.moduleName ?? "NR") : (item.applicationName ?? "NR"),
        sndi: item.sndi ?? "NR",
        domaine: item.domaineSndi ?? "NR",
        lettreCouvertureTestUniaire: item.lettreCouvertureTestUniaire ?? "NR",
        lettreFiabilite: item.lettreFiabilite ?? "NR",
        lettreDetteTechnique: item.lettreDetteTechnique ?? "NR",
        pourcentageCouvertureTestUnitaire: item.pourcentageCouvertureTestUniaire ?? "NR",
        lettreQualiteGenerale: isModule ? undefined : (item.lettreGlobalQualite ?? "NR"),
        detteTechnique: item.detteTechnique ? item.detteTechnique.replace(/\.00$/, "") : "NR",
        ...(isModule
            ? {
                  parentApplication: item.applicationName ?? "NR",
                  isModule: true
              }
            : {})
    };
}
