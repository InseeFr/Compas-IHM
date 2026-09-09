import { getApplications1, getIndicateur } from "../../../todos-api/client.gen";
import {
    columnsTable,
    formatIndicateur,
    onExport,
    paginationConfig
} from "pages/indicateurs/strategiecloud/strategieCloud-config";
import GenericIndicatorTable from "components/indicators/GenericIndicatorTable";
import { filterByApplicationName } from "constantes/constantes";

export const StrategieCloudTable = () => {
    const columns = columnsTable();

    const fetchData = async () => {
        try {
            const [applications, items] = await Promise.all([
                getApplications1(),
                getIndicateur()
            ]);
            const appNameLongMap = new Map(
                applications.map(app => [app.idApplication, app.appNameLong])
            );

            return (items ?? []).map(item => formatIndicateur(item, appNameLongMap));
        } catch (error) {
            console.error("Erreur lors de la récupération des données :", error);
            return [];
        }
    };

    return (
        <GenericIndicatorTable
            title="Table Indicateur Stratégie Cloud"
            fetchData={fetchData}
            columns={columns}
            queryKey={["StrategieCloudIndicator"]}
            hasModules={true}
            paginationConfig={paginationConfig}
            onExport={onExport}
            filterPredicate={filterByApplicationName}
        />
    );
};