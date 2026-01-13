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

export const paginationConfig: Pagination = {
    pagination: {
        pageIndex: 0,
        pageSize: 30
    }
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
        Cell: MeteoCell
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
