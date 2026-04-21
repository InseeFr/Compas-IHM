import type { MRT_ColumnDef, MRT_Row, MRT_TableInstance } from "material-react-table";
import type { Pagination } from "models/table-model";
import { CouvertureTestUnitCell, DetteTechCell, FiabiliteCell } from "./QualiteCell";
import type { IndicateurQualiteView } from "todos-api/client.gen";
import { muiAriaCell } from "utils/accessibility-functions";
import { BASE_COLONNE } from "constantes/constantes";
import type { QualiteIndicateur } from "models/indicateurs";
import { flattenRows, handleExportCsv, escapeCsvValue } from "utils/exportCsv";
import { QUALITE_HEADERS, BASE_HEADERS } from "constantes/constantes-headers";
import { getTrend } from "../../../constantes/trend.utils";

export const OnExport = (table: MRT_TableInstance<QualiteIndicateur>) => {
    const headers = [
        BASE_HEADERS.NOM,
        BASE_HEADERS.SERVICE_DEV,
        BASE_HEADERS.DOMAINE_DEV,
        BASE_HEADERS.DOMAINE_FONCTIONNEL,
        QUALITE_HEADERS.NIVEAU_COUVERTURE_TEST,
        QUALITE_HEADERS.POURCENTAGE_COUVERTURE_TEST,
        QUALITE_HEADERS.NIVEAU_FIABILITE,
        QUALITE_HEADERS.NIVEAU_DETTE_TECHNIQUE,
        QUALITE_HEADERS.DETTE_TECHNIQUE_JOURS
    ].map(escapeCsvValue);

    const filteredRows: MRT_Row<QualiteIndicateur>[] = flattenRows(table.getExpandedRowModel().rows);

    const csvData: string[] = filteredRows.map(row => {
        return [
            `"${row.original.applicationName}"`,
            `"${row.original.sndi}"`,
            `"${row.original.domaine}"`,
            `"${row.original.domaineFonc}"`,
            `"${row.original.lettreCouvertureTestUnitaire ?? "NR"}"`,
            `"${row.original.pourcentageCouvertureTestUnitaire ?? "NR"}"`,
            `"${row.original.lettreFiabilite ?? "NR"}"`,
            `"${row.original.lettreDetteTechnique ?? "NR"}"`,
            `"${row.original.detteTechnique ?? "NR"}"`
        ].join(",");
    });

    handleExportCsv("qualité", table, csvData, headers);
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
            header: QUALITE_HEADERS.COUVERTURE_TEST,
            Cell: CouvertureTestUnitCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Couverture Test Unitaire", cell: cell, row: row })
        },
        {
            accessorKey: "lettreFiabilite",
            header: QUALITE_HEADERS.FIABILITE,
            Cell: FiabiliteCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Fiabilité", cell: cell, row: row })
        },
        {
            accessorKey: "lettreDetteTechnique",
            header: QUALITE_HEADERS.DETTE_TECHNIQUE,
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
        lettreCouvertureTestUnitaire: item.lettreCouvertureTestUnitaire ?? defaultValue,
        lettreFiabilite: item.lettreFiabilite ?? defaultValue,
        lettreDetteTechnique: item.lettreDetteTechnique ?? defaultValue,
        pourcentageCouvertureTestUnitaire: item.pourcentageCouvertureTestUnitaire ?? defaultValue,
        lettreQualiteGenerale: isModule ? undefined : (item.lettreGlobalQualite ?? defaultValue),
        detteTechnique: formatDetteTechnique(),
        tendanceTestUnitaire: getTrend(item.evolutionCouvertureTestUnitaire),
        tendanceDetteTechnique: getTrend(item.evolutionDetteTechnique),
        tendanceFiabilite: getTrend(item.evolutionFiabilite),
        ...getModuleSpecificFields()
    };
}
