import { useMemo } from "react";
import { getIndicateur } from "../../../todos-api/client.gen";
import {
    columnsTable,
    formatIndicateur,
    onExport,
    paginationConfig
} from "pages/indicateurs/strategiecloud/strategieCloud-config";
import GenericIndicatorTable from "components/indicators/GenericIndicatorTable";

export const StrategieCloudTable = () => {
    const columns = useMemo(() => columnsTable(), []);

    const fetchData = async () => {
        try {
            const items = await getIndicateur();
            return (items ?? []).map(item => formatIndicateur(item));
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
        />
    );
};
