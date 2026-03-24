import { useQuery } from "@tanstack/react-query";
import type { AllIndicators } from "models/indicateurs";
import { useFilterContext } from "store/filterContext";
import { applyDevFilters } from "utils/filters-functions";

interface QueryFormResponse {
    data: AllIndicators[];
    filteredData: AllIndicators[];
}

interface IQueryFormRequest {
    queryKey: string[];
    fetchData: () => Promise<AllIndicators[] | undefined>;
}

export function useQueryForm(props: Readonly<IQueryFormRequest>): QueryFormResponse {
    const { state } = useFilterContext();

    const { data = [] } = useQuery({
        queryKey: [props.queryKey.join(",")],
        queryFn: props.fetchData
    });
    const filteredData = data.filter(item => applyDevFilters(item, state));

    return {
        data,
        filteredData
    };
}
