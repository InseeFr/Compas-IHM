import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFilterContext } from "store/filterContext";
import { groupModulesByApp } from "utils/group-module-by-apps";
import { applyDevFilters } from "utils/filters-functions";
import type { FilterableItem } from "models/indicateurs";

interface UseQueryIndicatorsOptions<T> {
    queryKey: string[];
    fetchData: () => Promise<T[] | undefined>;
    hasModules: false | true;
}

export function UseQueryIndicators<T extends FilterableItem>({
    queryKey,
    fetchData
}: UseQueryIndicatorsOptions<T>) {
    const { state } = useFilterContext();

    const { data = [], isLoading } = useQuery({
        queryKey: [queryKey.join(",")],
        queryFn: fetchData
    });

    const modulesByApp = useMemo(() => groupModulesByApp(data), [data]);

    const filteredData = useMemo(() => data.filter(item => applyDevFilters(item, state)), [data, state]);

    return {
        data,
        isLoading,
        modulesByApp,
        filteredData
    };
}
