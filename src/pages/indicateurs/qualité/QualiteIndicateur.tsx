import { columnsTable, formatIndicateur, OnExport, paginationConfig } from "./qualiteConfig";

import {
    getIndicateurQualiteByApplicationByDate,
    getIndicateurQualiteByModuleByDate,
    getApplications1
} from "todos-api/client.gen";

import GenericIndicatorTable from "components/indicators/GenericIndicatorTable";
import { useTendanceContext } from "store/tendance-context";
import { filterByApplicationName } from "constantes/constantes";

const QualiteIndicateurTable = () => {
    const { stateTendance } = useTendanceContext();
    const columns = columnsTable();

    const fetchData = async () => {
        try {
            const params = {
                origine: stateTendance.dateFin,
                passee: stateTendance.dateDebut
            };

            const [applications, apps, modules] = await Promise.all([
                getApplications1(),
                getIndicateurQualiteByApplicationByDate(params),
                getIndicateurQualiteByModuleByDate(params)
            ]);

            const appNameLongMap = new Map(
                applications.map(app => [app.idApplication, app.appNameLong])
            );
            const formattedApps = apps.map(app => formatIndicateur(app, false, appNameLongMap));
            const formattedModules = modules.map(mod => formatIndicateur(mod, true, appNameLongMap));

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
            queryKey={["QualiteIndicator", stateTendance.dateDebut, stateTendance.dateFin]}
            hasModules={true}
            paginationConfig={paginationConfig}
            onExport={OnExport}
            filterPredicate={filterByApplicationName}
        />
    );
};

export default QualiteIndicateurTable;