import { useState } from "react";
import type { FilterState } from "store/filterContext";
import type { AllIndicators } from "models/indicateurs";
import type { FilterModel } from "models/filters";
import type { TendanceState } from "store/tendance-context";
import { format } from "date-fns";

interface IUseFiltersOptions {
    state: FilterState;
    stateTendance?: TendanceState;
    data: AllIndicators[];
}

export const useFilters = ({ state, stateTendance, data }: IUseFiltersOptions) => {
    const [open, setOpen] = useState<boolean>(false);

    const [tempFilters, setTempFilters] = useState<FilterModel>({
        serviceDev: state.serviceDev,
        domaineDev: state.domaineDev,
        domaineFonc: state.domaineFonc,
        dateDebut: stateTendance?.dateDebut ?? "",
        dateFin: stateTendance?.dateFin ?? ""
    });

    const now = format(new Date(), "dd/MM/yyyy");
    const previousMonth = format(new Date(new Date().setMonth(new Date().getMonth() - 1)), "dd/MM/yyyy");

    const openSidebar = (): void => {
        setTempFilters({
            serviceDev: state.serviceDev,
            domaineDev: state.domaineDev,
            domaineFonc: state.domaineFonc,
            dateDebut: stateTendance?.dateDebut ?? "",
            dateFin: stateTendance?.dateFin ?? ""
        });
        setOpen(true);
    };

    const handleReset = (): void => {
        setTempFilters({
            serviceDev: "",
            domaineDev: "",
            domaineFonc: "",
            dateDebut: previousMonth,
            dateFin: now
        });
    };

    const periodeFilterActive = (dateDebut?: string, dateFin?: string): number => {
        const debutIsDefault = dateDebut === previousMonth || !dateDebut;
        const finIsDefault = dateFin === now || !dateFin;
        if (debutIsDefault && finIsDefault) return 0;
        if (debutIsDefault || finIsDefault) return 1;
        return 2;
    };

    const totalActive: number =
        Object.values(state).filter(Boolean).length +
        periodeFilterActive(stateTendance?.dateDebut, stateTendance?.dateFin);
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
        handleReset,
        openSidebar,
        tempFilters,
        totalActive,
        filteredForService,
        filteredForDomaine,
        filteredForDomaineFonc
    };
};
