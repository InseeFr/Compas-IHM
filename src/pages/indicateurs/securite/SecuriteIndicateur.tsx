import {
    columnsTable,
    formatApplicationsData,
    formatModulesData,
    OnExport,
    paginationConfig
} from "./securiteConfig";
import {
    getApplications1,
    getIndicateurSecuriteByApplication,
    getIndicateurSecuriteByModule,
    getModules1
} from "todos-api/client.gen";
import GenericIndicatorTable from "components/indicators/GenericIndicatorTable";

const SecuriteIndicateurTable = () => {
    const columns = columnsTable();

    const fetchData = async () => {
        try {
            const [apps, modules, securiteApps, securiteModules] = await Promise.all([
                getApplications1(),
                getModules1(),
                getIndicateurSecuriteByApplication(),
                getIndicateurSecuriteByModule()
            ]);
            const formattedApps = formatApplicationsData(apps, securiteApps);
            const formattedModules = formatModulesData(modules, securiteModules);
            return [...formattedApps, ...formattedModules];
        } catch (error) {
            console.error("Erreur lors de la récupération des données sécurité: ", error);
            return [];
        }
    };

    return (
        <GenericIndicatorTable
            title="Table Indicateur Sécurité"
            fetchData={fetchData}
            columns={columns}
            queryKey="SecuriteIndicator"
            hasModules={true}
            paginationConfig={paginationConfig}
            onExport={OnExport}
        />
    );
};

export default SecuriteIndicateurTable;
