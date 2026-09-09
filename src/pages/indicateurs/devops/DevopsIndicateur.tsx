import {
    getApplications1,
    getApplications2,
    getModules1,
    type GetApplications2Params
} from "../../../todos-api/client.gen";
import { columnsTable, formatIndicateur, onExport, paginationConfig } from "./devopsConfig";
import GenericIndicatorTable from "components/indicators/GenericIndicatorTable";
import { useTendanceContext } from "store/tendance-context";
import { filterByApplicationName } from "constantes/constantes";

export const DevopsIndicateurTable = () => {
    const { stateTendance } = useTendanceContext();

    const columns = columnsTable();

    const fetchData = async () => {
        try {
            const params: GetApplications2Params = {
                dateReference: stateTendance.dateFin,
                datePassee: stateTendance.dateDebut
            };
            const [applications, apps, modules] = await Promise.all([
                getApplications1(),
                getApplications2(params),
                getModules1(params)
            ]);

            const appNameLongMap = new Map(
                applications.map(app => [app.idApplication, app.appNameLong])
            );

            const formattedApplications = apps.map(app => formatIndicateur(app, "application", appNameLongMap));
            const formattedModules = modules.map(module => formatIndicateur(module, "module", appNameLongMap));

            return [...formattedApplications, ...formattedModules];
        } catch (error) {
            console.error("Erreur lors de la récupération des données :", error);
            return [];
        }
    };

    return (
        <GenericIndicatorTable
            title="Table Indicateur DEVOPS"
            fetchData={fetchData}
            columns={columns}
            queryKey={["DevopsIndicator", stateTendance.dateDebut, stateTendance.dateFin]}
            hasModules={true}
            paginationConfig={paginationConfig}
            onExport={onExport}
            filterPredicate={filterByApplicationName}
        />
    );
};