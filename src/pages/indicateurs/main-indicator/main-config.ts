import type { GlobalIndicator } from "models/indicateurs";
import type { Pagination } from "models/table-model";
import {
    A11yCell,
    DevopsCell,
    GreenItCell,
    MaturityCell,
    MeteoCell,
    QualityCell,
    SecurityCell
} from "./mainCell";
import type { MRT_ColumnDef, MRT_SortingFn } from "material-react-table";
import { isDateOlderThan31Days } from "utils/date-functions";
import { muiAriaCell } from "utils/accessibility-functions";
import { BASE_COLONNE } from "constantes/constantes";

export const paginationConfig: Pagination = {
    pagination: {
        pageIndex: 0,
        pageSize: 30
    }
};

export const sortHelper: MRT_SortingFn<GlobalIndicator> = (rowA, rowB) => {
    const a: GlobalIndicator = rowA.original;
    const b: GlobalIndicator = rowB.original;

    const aExpired: boolean = isDateOlderThan31Days(a.dateMeteoCommentaire);
    const bExpired: boolean = isDateOlderThan31Days(b.dateMeteoCommentaire);

    if (aExpired && !bExpired) return -1;
    if (!aExpired && bExpired) return 1;

    const aVal: number | undefined = a.meteo;
    const bVal: number | undefined = b.meteo;

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return -1;
    if (bVal == null) return 1;

    return aVal - bVal;
};

export const columnsGlobal = (): MRT_ColumnDef<GlobalIndicator>[] => {
    const colonnes: MRT_ColumnDef<GlobalIndicator>[] = [
        {
            accessorKey: "lettreQualiteGenerale",
            header: "Qualité",
            Cell: QualityCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Qualité globale", cell: cell, row: row })
        },
        {
            accessorKey: "lettreGlobaleSecurite",
            header: "Sécurité",
            Cell: SecurityCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Sécurité globale", cell: cell, row: row })
        },
        {
            accessorKey: "lettreDistanceCount",
            id: "devopsSort",
            header: "DevOps",
            accessorFn: row => `${row.lettreDistanceCount}-${row.distanceCount}`,
            Cell: DevopsCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Devops globale", cell: cell, row: row })
        },
        {
            accessorKey: "lettreGreen",
            header: "GreenIt",
            Cell: GreenItCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "GreenIt global", cell: cell, row: row })
        },
        {
            accessorKey: "meteo",
            header: "Météo ressentie",
            Cell: MeteoCell,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Météo globale", cell: cell, row: row })
        },
        {
            accessorKey: "lettreA11y",
            header: "Accessibilité",
            Cell: A11yCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Accessibilité globale", cell: cell, row: row })
        },
        {
            accessorKey: "maturite",
            header: "Maturité Cloud",
            Cell: MaturityCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Maturité globale", cell: cell, row: row })
        }
    ];
    return [...BASE_COLONNE<GlobalIndicator>(), ...colonnes];
};
