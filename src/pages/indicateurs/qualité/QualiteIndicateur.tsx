import { columnsTable, formatIndicateur, OnExport, paginationConfig } from "./qualiteConfig";
import {
    getIndicateurQualiteByApplication,
    GetIndicateurQualiteByApplicationPeriode,
    getIndicateurQualiteByModule
} from "todos-api/client.gen";
import GenericIndicatorTable from "components/indicators/GenericIndicatorTable";
import { useTendanceContext } from "store/tendance-context";

const QualiteIndicateurTable = () => {
    const { stateTendance } = useTendanceContext();
    const columns = columnsTable();

    const fetchData = async () => {
        try {
            const [apps, modules] = await Promise.all([
                getIndicateurQualiteByApplication({
                    periode: stateTendance.periode as GetIndicateurQualiteByApplicationPeriode
                }),
                getIndicateurQualiteByModule({
                    periode: stateTendance.periode as GetIndicateurQualiteByApplicationPeriode
                })
            ]);

            const formattedApps = apps.map(app => formatIndicateur(app));
            const formattedModules = modules.map(mod => formatIndicateur(mod, true));

            return [...formattedApps, ...formattedModules];
        } catch (error) {
            console.log("Erreur lors de la récupération des données qualité: ", error);
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
