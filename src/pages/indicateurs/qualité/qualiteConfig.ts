import type { MRT_ColumnDef, MRT_Row, MRT_TableInstance } from "material-react-table";
import type { QualiteIndicateur } from "models/indicateurs";
import type { Pagination } from "models/table-model";
import { flattenRows, getName, handleExportCsv } from "utils/exportCsv";
import { CouvertureTestUnitCell, DetteTechCell } from "./QualiteCell";
import type { IndicateurQualiteView } from "todos-api/client.gen";
import { muiAriaCell } from "utils/accessibility-functions";
import { BASE_COLONNE } from "constantes/constantes";

export const OnExport = (table: MRT_TableInstance<QualiteIndicateur>) => {
    const filteredRows: MRT_Row<QualiteIndicateur>[] = flattenRows(table.getExpandedRowModel().rows);
    const csvData: string[] = filteredRows.map(row =>
        [
            `${getName(row)}`,
            `"${row.original.sndi}"`,
            `"${row.original.lettreCouvertureTestUniaire}"`,
            `"${row.original.lettreFiabilite}"`,
            `"${row.original.lettreDetteTechnique}"`
        ].join(",")
    );
    handleExportCsv("qualité", table, csvData);
};

export const paginationConfig: Pagination = {
    pagination: {
        pageIndex: 0,
        pageSize: 30
    }
};

export const columnsTable = (): MRT_ColumnDef<QualiteIndicateur>[] => {
    const colonnes: MRT_ColumnDef<QualiteIndicateur>[] = [
        {
            accessorKey: "lettreCouvertureTestUniaire",
            header: "Couverture de Test",
            Cell: CouvertureTestUnitCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Couverture Test Unitaire", cell: cell, row: row })
        },
        {
            accessorKey: "lettreFiabilite",
            header: "Fiabilité",
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Fiabilité", cell: cell, row: row })
        },
        {
            accessorKey: "lettreDetteTechnique",
            header: "Dette Technique",
            Cell: DetteTechCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Dette technique", cell: cell, row: row })
        }
    ];
    return [...BASE_COLONNE<QualiteIndicateur>(), ...colonnes];
};

export function formatIndicateur(item: IndicateurQualiteView, isModule = false): QualiteIndicateur {
    const defaultValue = "NR";

    const getApplicationName = () => {
        if (isModule) {
            return item.moduleName ?? defaultValue;
        }
        return item.applicationName ?? defaultValue;
    };

    const formatDetteTechnique = () => {
        return item.detteTechnique ? item.detteTechnique.replace(/\.00$/, "") : defaultValue;
    };

    const getModuleSpecificFields = () => {
        if (!isModule) return {};

        return {
            parentApplication: item.applicationName ?? defaultValue,
            isModule: true
        };
    };

    return {
        applicationId: isModule ? undefined : item.applicationId,
        applicationName: getApplicationName(),
        sndi: item.sndi ?? defaultValue,
        domaine: item.domaineSndi ?? defaultValue,
        domaineFonc: item.domaineFonctionnel ?? defaultValue,
        lettreCouvertureTestUniaire: item.lettreCouvertureTestUniaire ?? defaultValue,
        lettreFiabilite: item.lettreFiabilite ?? defaultValue,
        lettreDetteTechnique: item.lettreDetteTechnique ?? defaultValue,
        pourcentageCouvertureTestUnitaire: item.pourcentageCouvertureTestUniaire ?? defaultValue,
        lettreQualiteGenerale: isModule ? undefined : (item.lettreGlobalQualite ?? defaultValue),
        detteTechnique: formatDetteTechnique(),
        ...getModuleSpecificFields()
    };
}
