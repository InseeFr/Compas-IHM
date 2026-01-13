import type { FilterState } from "store/filterContext";

export const applyDevFilters = <T extends { sndi?: string; domaine?: string; domaineFonc?: string }>(
    item: T,
    state: FilterState
) => {
    if (state.serviceDev && item.sndi !== state.serviceDev) return false;
    if (state.domaineDev && item.domaine !== state.domaineDev) return false;
    if (state.domaineFonc && item.domaineFonc !== state.domaineFonc) return false;
    return true;
};
