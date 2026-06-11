import { useState } from "react";
import type { FilterState } from "store/filterContext";
import type { AllIndicators } from "models/indicateurs";
import type { FilterModel } from "models/filters";

interface IUseFiltersOptions {
    state: FilterState;
    data: AllIndicators[];
}

export const useFilters = ({ state, data }: IUseFiltersOptions) => {
    const [open, setOpen] = useState<boolean>(false);
    const [tempFilters, setTempFilters] = useState<FilterModel>({
        serviceDev: state.serviceDev,
        domaineDev: state.domaineDev,
        domaineFonc: state.domaineFonc
    });

    const openSidebar = (): void => {
        setTempFilters({
            serviceDev: state.serviceDev,
            domaineDev: state.domaineDev,
            domaineFonc: state.domaineFonc
        });
        setOpen(true);
    };

    const totalActive: number = Object.values(state).filter(Boolean).length;

    const filteredForService = data.filter(
        item =>
            (!tempFilters.domaineDev || item.domaine === tempFilters.domaineDev) &&
            (!tempFilters.domaineFonc || item.domaineFonc === tempFilters.domaineFonc)
    );

    const filteredForDomaine = data.filter(
        item =>
            (!tempFilters.serviceDev || item.sndi === tempFilters.serviceDev) &&
            (!tempFilters.domaineFonc || item.domaineFonc === tempFilters.domaineFonc)
    );

    const filteredForDomaineFonc = data.filter(
        item =>
            (!tempFilters.serviceDev || item.sndi === tempFilters.serviceDev) &&
            (!tempFilters.domaineDev || item.domaine === tempFilters.domaineDev)
    );

    return {
        open,
        setOpen,
        setTempFilters,
        openSidebar,
        tempFilters,
        totalActive,
        filteredForService,
        filteredForDomaine,
        filteredForDomaineFonc
    };
};
