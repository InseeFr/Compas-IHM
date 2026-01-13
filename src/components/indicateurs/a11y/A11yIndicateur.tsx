import type { A11yIndicateur } from "models/indicateurs";
import { useEffect, useMemo, useState } from "react";
import { useFilterContext } from "store/filterContext";
import { columnsTable, formatIndicateur, OnExport, paginationConfig } from "./a11yConfig";
import { getModules1, listerModulesA11y } from "todos-api/client.gen";
import TablePageLayout from "pages/TablePageLayout";
import ButtonCsvExport from "pages/ButtonCsvExport";
import { Filters } from "components/Filters";
import { applyDevFilters } from "utils/filters-functions";

export const A11yIndicateurTable = () => {
    const [a11yIndicateur, setA11yIndicateur] = useState<A11yIndicateur[]>([]);
    const { state, dispatch } = useFilterContext();
    const columns = useMemo(() => columnsTable(), []);

    async function fetchA11yIndicateurs(): Promise<A11yIndicateur[]> {
        const [modulesA11y, modules] = await Promise.all([listerModulesA11y(), getModules1()]);

        const modulesByName = new Map(modules.map(module => [module.modName, module]));

        return modulesA11y.map(mod => formatIndicateur(mod, modulesByName.get(mod.modName)));
    }

    useEffect(() => {
        fetchA11yIndicateurs()
            .then(setA11yIndicateur)
            .catch(error => console.error("Erreur lors de la récupération des données A11y: ", error));
    }, []);

    const filteredData = useMemo(
        () => a11yIndicateur.filter(item => applyDevFilters(item, state)),
        [a11yIndicateur, state]
    );

    return (
        <>
            <Filters data={a11yIndicateur} state={state} dispatch={dispatch} />
            <TablePageLayout
                titleTable="Table Indicateur Accessibilité"
                data={filteredData}
                columns={columns}
                paginationConfig={paginationConfig}
                rowId={row => row.modName}
                renderTopCustom={({ table }) => <ButtonCsvExport table={table} onExport={OnExport} />}
            />
        </>
    );
};
