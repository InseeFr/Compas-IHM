import {
    columnsTable,
    formatIndicateur,
    OnExport,
    paginationConfig
} from "./qualiteConfig";
import {
    getIndicateurQualiteByApplication,
    getIndicateurQualiteByModule
} from "todos-api/client.gen";
import GenericIndicatorTable from "components/indicators/GenericIndicatorTable";
import type {
    GetIndicateurQualiteByApplicationPeriode
} from "todos-api/client.gen";

type Props = {
    periode?: GetIndicateurQualiteByApplicationPeriode;
};

const QualiteIndicateurTable = ({ periode }: Props) => {
    const columns = columnsTable();

    const fetchData = async () => {
        try {
            const [apps, modules] = await Promise.all([
                getIndicateurQualiteByApplication({ periode }),
                getIndicateurQualiteByModule({ periode })
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
            queryKey={["QualiteIndicator", periode ?? "MOIS"]}
            hasModules={true}
            paginationConfig={paginationConfig}
            onExport={OnExport}
        />
    );
};

export default QualiteIndicateurTable;