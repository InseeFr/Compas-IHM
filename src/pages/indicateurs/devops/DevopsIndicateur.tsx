import {
    getApplications2,
    getModules2,
    type GetApplications2Params
} from "../../../todos-api/client.gen";
import { columnsTable, formatIndicateur, onExport, paginationConfig } from "./devopsConfig";
import GenericIndicatorTable from "components/indicators/GenericIndicatorTable";
import { useTendanceContext } from "store/tendance-context";

export const DevopsIndicateurTable = () => {
    const { stateTendance } = useTendanceContext();

    const columns = columnsTable();

    const fetchData = async () => {
        try {
            const params: GetApplications2Params = {
                dateReference: stateTendance.dateFin,

                datePassee: stateTendance.dateDebut
            };
            const [apps, modules] = await Promise.all([getApplications2(params), getModules2(params)]);

            const formattedApplications = apps.map(app => formatIndicateur(app));
            const formattedModules = modules.map(module => formatIndicateur(module, true));

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
        />
    );
};
