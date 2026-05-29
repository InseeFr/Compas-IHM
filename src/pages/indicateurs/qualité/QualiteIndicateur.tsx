import { columnsTable, formatIndicateur, OnExport, paginationConfig } from "./qualiteConfig";

import {
    getIndicateurQualiteByApplicationByDate,
    getIndicateurQualiteByModuleByDate
} from "todos-api/client.gen";

import GenericIndicatorTable from "components/indicators/GenericIndicatorTable";
import { useTendanceContext } from "store/tendance-context";

const QualiteIndicateurTable = () => {
    const { stateTendance } = useTendanceContext();
    const columns = columnsTable();

    const fetchData = async () => {
        try {
            const params = {
                origine: stateTendance.dateOrigine,

                passee: stateTendance.datePassee
                    
            };

            const [apps, modules] = await Promise.all([
                getIndicateurQualiteByApplicationByDate(params),
                getIndicateurQualiteByModuleByDate(params)
            ]);

            const formattedApps = apps.map(app => formatIndicateur(app));
            const formattedModules = modules.map(mod => formatIndicateur(mod, true));

            return [...formattedApps, ...formattedModules];
        } catch (error) {
            console.log("Erreur lors de la récupération des données qualité :", error);
            return [];
        }
    };

    return (
        <GenericIndicatorTable
            title="Table Indicateur Qualité"
            fetchData={fetchData}
            columns={columns}
            queryKey={["QualiteIndicator"]}
            hasModules={true}
            paginationConfig={paginationConfig}
            onExport={OnExport}
        />
    );
};

export default QualiteIndicateurTable;