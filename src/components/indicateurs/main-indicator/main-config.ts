import type { GlobalIndicator } from "models/indicateurs";
import type { ColumnTable, Pagination } from "models/table-model";
import {
    A11yCell,
    DevopsCell,
    GreenItCell,
    MaturityCell,
    MeteoCell,
    QualityCell,
    SecurityCell
} from "./mainCell";
import type { MRT_SortingFn } from "material-react-table";
import { isDateOlderThan31Days } from "utils/date-functions";

export const paginationConfig: Pagination = {
    pagination: {
        pageIndex: 0,
        pageSize: 30
    }
};

const sortHelper: MRT_SortingFn<GlobalIndicator> = (rowA, rowB) => {
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

export const columnsGlobal = (): ColumnTable<GlobalIndicator>[] => [
    {
        accessorKey: "applicationName",
        header: "Nom"
    },
    {
        accessorKey: "sndi",
        header: "serviceDev"
    },
    {
        accessorKey: "lettreQualiteGenerale",
        header: "Qualité",
        Cell: QualityCell
    },
    {
        accessorKey: "lettreGlobaleSecurite",
        header: "Sécurité",
        Cell: SecurityCell
    },
    {
        accessorKey: "lettreDistanceCount",
        id: "devopsSort",
        header: "DevOps",
        accessorFn: row => `${row.lettreDistanceCount}-${row.distanceCount}`,
        Cell: DevopsCell
    },
    {
        accessorKey: "lettreGreen",
        header: "GreenIt",
        Cell: GreenItCell
    },
    {
        accessorKey: "meteo",
        header: "Météo ressentie",
        Cell: MeteoCell,
        sortingFn: sortHelper
    },
    {
        accessorKey: "lettreA11y",
        header: "Accessibilité",
        Cell: A11yCell
    },
    {
        accessorKey: "maturite",
        header: "Maturité Cloud",
        Cell: MaturityCell
    }
];
