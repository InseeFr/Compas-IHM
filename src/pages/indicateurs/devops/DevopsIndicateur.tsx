import { getApplications2, getModules2 } from "../../../todos-api/client.gen";
import { columnsTable, formatIndicateur, onExport, paginationConfig } from "./devopsConfig";
import GenericIndicatorTable from "components/indicators/GenericIndicatorTable";

export const DevopsIndicateurTable = () => {
    const columns = columnsTable();

    const fetchData = async () => {
        try {
            const [apps, modules] = await Promise.all([getApplications2(), getModules2()]);

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
            queryKey={["DevopsIndicator"]}
            hasModules={true}
            paginationConfig={paginationConfig}
            onExport={onExport}
        />
    );
};
