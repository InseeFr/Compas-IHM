import type { ViewMode } from "constantes/constantes";
import type { GreenITIndicateur } from "models/indicateurs";
import type { MRT_ColumnDef } from "material-react-table";
import { columnsGreenIt } from "pages/indicateurs/greenIT/greenItConfig";
import { BASE_COLONNE } from "constantes/constantes";

export type InfraType = "ALL" | "KUB" | "VM";

const VM_KEYS = {
    GLOBAL: ["_nbVmSort", "_cpuSort", "_ramSort", "_diskSort", "_ramMaxiSort", "_cpuMaxiSort"],
    PROD: [
        "_nbVmProdSort",
        "_cpuUsedProdSort",
        "_ramUsedProdSort",
        "_diskUsedProdSort",
        "_ramMaxiProdSort",
        "_cpuMaxiProdSort"
    ],
    HORSPROD: [
        "_nbVmHorsProdSort",
        "_cpuHorsProdSort",
        "_ramHorsProdSort",
        "_diskHorsProdSort",
        "_ramMaxiHorsProdSort",
        "_cpuMaxiHorsProdSort"
    ]
};

const KUB_KEYS = {
    GLOBAL: [
        "_cpuUsedSort",
        "_ramUsedSort",
        "_diskUsedSort",
        "_s3UsedSort",
        "_pvcUsedSort",
        "_nbPodMaxiSort"
    ],
    PROD: [
        "_cpuUsedProdSort",
        "_ramUsedProdSort",
        "_diskUsedProdSort",
        "_s3UsedProdSort",
        "_pvcUsedProdSort",
        "_nbPodMaxiProdSort"
    ],
    HORSPROD: [
        "_cpuUsedHorsProdSort",
        "_ramUsedHorsProdSort",
        "_diskUsedHorsProdSort",
        "_s3UsedHorsProdSort",
        "_pvcUsedHorsProdSort",
        "_nbPodMaxiHorsProdSort"
    ]
};

const getKeysForInfraAndMode = (infraType: InfraType, viewMode: ViewMode): string[] => {
    const keyMap: Record<InfraType, Record<ViewMode, string[]>> = {
        ALL: {
            global: [...VM_KEYS.GLOBAL, ...VM_KEYS.PROD, ...KUB_KEYS.GLOBAL, ...KUB_KEYS.PROD],
            prod: [...VM_KEYS.PROD, ...KUB_KEYS.PROD],
            horsprod: [...VM_KEYS.HORSPROD, ...KUB_KEYS.HORSPROD]
        },
        VM: {
            global: [...VM_KEYS.GLOBAL, ...VM_KEYS.PROD],
            prod: VM_KEYS.PROD,
            horsprod: VM_KEYS.HORSPROD
        },
        KUB: {
            global: [...KUB_KEYS.GLOBAL, ...KUB_KEYS.PROD],
            prod: KUB_KEYS.PROD,
            horsprod: KUB_KEYS.HORSPROD
        }
    };

    return keyMap[infraType][viewMode];
};

export function buildInfraColumns(
    viewMode: ViewMode,
    infraType: InfraType
): MRT_ColumnDef<GreenITIndicateur>[] {
    const baseColumns = BASE_COLONNE<GreenITIndicateur>();
    const allInfraColumns = columnsGreenIt().filter(
        col => !baseColumns.some(base => base.accessorKey === col.accessorKey)
    );

    const allowedKeys = getKeysForInfraAndMode(infraType, viewMode);

    return [
        ...baseColumns,
        ...allInfraColumns.filter(col => allowedKeys.includes(col.accessorKey as string))
    ];
}
