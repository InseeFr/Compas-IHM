import type { MRT_TableInstance, MRT_Row, MRT_ColumnDef } from "material-react-table";
import type { StrategieCloudIndicateur } from "models/indicateurs";
import type { Pagination } from "models/table-model";
import { flattenRows, handleExportCsv, escapeCsvValue, getBaseValueCSV } from "utils/exportCsv";
import {
    TauxCloudCell,
    EnvActuelCell,
    EnvCibleCell,
    EcartCibleCell,
    StrategieCloudCell,
    CommentaireCell,
    MaturiteCloudCell
} from "pages/indicateurs/strategiecloud/strategieCloudCell";
import type { IndicateurMaturiteView } from "todos-api/client.gen";
import { muiAriaCell } from "utils/accessibility-functions";
import { BASE_COLONNE } from "constantes/constantes";
import { STRATEGIE_CLOUD_HEADERS, BASE_HEADERS } from "constantes/constantes-headers";

const getValueStrategieCloudCSV = (row: MRT_Row<StrategieCloudIndicateur>) => {
    return [
        `"${row.original.tauxCloud ?? "NR"}"`,
        `"${row.original.envActuelProd ?? "NR"}"`,
        `"${row.original.envCibleProd ?? "NR"}"`,
        `"${row.original.ecartCible ?? "NR"}"`,
        `"${row.original.stratCloud ?? "NR"}"`,
        `"${row.original.commentaire ?? "NR"}"`,
        `"${row.original.maturiteCloud ?? "NR"}"`
    ];
}

export const onExport = (table: MRT_TableInstance<StrategieCloudIndicateur>) => {
    const headers = [
        BASE_HEADERS.NOM_APPLICATION,
        BASE_HEADERS.NOM_MODULE,
        BASE_HEADERS.SERVICE_DEV,
        BASE_HEADERS.DOMAINE_DEV,
        BASE_HEADERS.DOMAINE_FONCTIONNEL,
        STRATEGIE_CLOUD_HEADERS.TAUX_CLOUD_PRODUCTION,
        STRATEGIE_CLOUD_HEADERS.ENV_ACTUEL_PRODUCTION,
        STRATEGIE_CLOUD_HEADERS.ENV_CIBLE_PRODUCTION,
        STRATEGIE_CLOUD_HEADERS.ECART_CIBLE,
        STRATEGIE_CLOUD_HEADERS.STRATEGIE_CLOUD,
        STRATEGIE_CLOUD_HEADERS.COMMENTAIRE,
        STRATEGIE_CLOUD_HEADERS.MATURITE_CLOUD
    ].map(escapeCsvValue);

    const filteredRows: MRT_Row<StrategieCloudIndicateur>[] = flattenRows(
        table.getExpandedRowModel().rows
    );

    const csvData: string[] = filteredRows.map(row => {

        return [
            ...getBaseValueCSV(row),
            ...getValueStrategieCloudCSV(row)
        ].join(",");
    });

    handleExportCsv("strategie-cloud", table, csvData, headers);
};

export const paginationConfig: Pagination = {
    pagination: {
        pageIndex: 0,
        pageSize: 30
    }
};

export const columnsTable = (): MRT_ColumnDef<StrategieCloudIndicateur>[] => {
    const colonnes: MRT_ColumnDef<StrategieCloudIndicateur>[] = [
        {
            accessorKey: "tauxCloud",
            header: STRATEGIE_CLOUD_HEADERS.TAUX_CLOUD_PRODUCTION,
            Cell: TauxCloudCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Taux cloud Production", cell, row })
        },
        {
            accessorKey: "envActuelProd",
            header: STRATEGIE_CLOUD_HEADERS.ENV_ACTUEL_PRODUCTION,
            Cell: EnvActuelCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Environnement actuel Production", cell, row })
        },
        {
            accessorKey: "envCibleProd",
            header: STRATEGIE_CLOUD_HEADERS.ENV_CIBLE_PRODUCTION,
            Cell: EnvCibleCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Environnement cible Production", cell, row })
        },
        {
            accessorKey: "ecartCible",
            header: STRATEGIE_CLOUD_HEADERS.ECART_CIBLE,
            Cell: EcartCibleCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Écart à la cible", cell, row })
        },
        {
            accessorKey: "stratCloud",
            header: STRATEGIE_CLOUD_HEADERS.STRATEGIE_CLOUD,
            Cell: StrategieCloudCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Stratégie cloud", cell, row })
        },
        {
            accessorKey: "commentaire",
            header: STRATEGIE_CLOUD_HEADERS.COMMENTAIRE,
            Cell: CommentaireCell,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "Commentaire", cell, row })
        },
        {
            accessorKey: "maturiteCloud",
            header: STRATEGIE_CLOUD_HEADERS.MATURITE_CLOUD,
            Cell: MaturiteCloudCell,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "Maturité Cloud", cell, row })
        }
    ];

    return [...BASE_COLONNE<StrategieCloudIndicateur>(), ...colonnes];
};

export function formatIndicateur(item: IndicateurMaturiteView): StrategieCloudIndicateur {
    const isModule = item.isModule;
    return {
        applicationName: isModule ? (item.moduleName ?? "NR") : (item.appName ?? "NR"),
        sndi: item.serviceName ?? "NR",
        tauxCloud: item.tauxCloud ?? "NR",
        envActuelProd: item.envActuelProd ?? "NR",
        envCibleProd: item.envCibleProd ?? "NR",
        ecartCible: item.ecartCible ?? "NR",
        stratCloud: item.stratCloud ?? "NR",
        commentaire: item.commentaire ?? "NR",
        maturiteCloud: item.maturiteCloud ?? "NR",
        idModule: item.idModule ?? -1,
        idApp: item.idApp ?? -1,
        isModule: isModule,
        parentApplication: item.appName,
        domaine: item.domaineDev ?? "NR",
        domaineFonc: item.domaineFonctionnel ?? "NR"
    };
}
