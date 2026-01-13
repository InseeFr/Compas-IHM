import { HEADERS_QUALITE } from "constantes/constantes-csv";
import type { MRT_Row, MRT_TableInstance } from "material-react-table";
import type { QualiteIndicateur } from "models/indicateurs";
import type { ColumnTable, Pagination } from "models/table-model";
import { flattenRows, handleExportCsv } from "utils/exportCsv";
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

export const columnsTable = (): ColumnTable<QualiteIndicateur>[] => {
    return [
        { accessorKey: "applicationName", header: "Nom" },
        { accessorKey: "sndi", header: "serviceDev" },

        {
            accessorKey: "lettreCouvertureTestUniaire",
            header: "Couverture de Test",
            Cell: CouvertureTestUnitCell
        },
        {
            accessorKey: "lettreFiabilite",
            header: "Fiabilité"
        },
        {
            accessorKey: "lettreDetteTechnique",
            header: "Dette Technique",
            Cell: DetteTechCell
        }
    ];
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
