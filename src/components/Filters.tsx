import type { AllIndicators } from "models/indicateurs";
import { SelectedFiltersLayout } from "pages/SelectedFiltersLayout";
import { useMemo } from "react";
import type { Action, FilterState } from "store/filterContext";

interface FiltersProps {
    state: FilterState;
    dispatch: React.Dispatch<Action>;
    data: AllIndicators[];
}

export const Filters = (props: Readonly<FiltersProps>) => {
    const { data, state, dispatch } = props;

    const filteredForService = useMemo(() => {
        return data.filter(
            item =>
                (!state.domaineDev || item.domaine === state.domaineDev) &&
                (!state.domaineFonc || item.domaineFonc === state.domaineFonc)
        );
    }, [data, state.domaineDev, state.domaineFonc]);

    const filteredForDomaine = useMemo(() => {
        return data.filter(
            item =>
                (!state.serviceDev || item.sndi === state.serviceDev) &&
                (!state.domaineFonc || item.domaineFonc === state.domaineFonc)
        );
    }, [data, state.serviceDev, state.domaineFonc]);

    const filteredForDomaineFonc = useMemo(() => {
        return data.filter(
            item =>
                (!state.serviceDev || item.sndi === state.serviceDev) &&
                (!state.domaineDev || item.domaine === state.domaineDev)
        );
    }, [data, state.serviceDev, state.domaineDev]);

    return (
        <SelectedFiltersLayout
            filters={[
                {
                    title: "Service dev.",
                    selectedOne: state.serviceDev,
                    onChange: e =>
                        dispatch({
                            type: "SET_SERVICE_DEV",
                            payload: e.target.value
                        }),
                    dataFilter: filteredForService,
                    getValue: item => item.sndi
                },
                {
                    title: "Domaine dev.",
                    selectedOne: state.domaineDev,
                    onChange: e =>
                        dispatch({
                            type: "SET_DOMAINE_DEV",
                            payload: e.target.value
                        }),
                    dataFilter: filteredForDomaine,
                    getValue: item => item.domaine
                },
                {
                    title: "Domaine Fonct.",
                    selectedOne: state.domaineFonc,
                    onChange: e =>
                        dispatch({
                            type: "SET_DOMAINE_FONC",
                            payload: e.target.value
                        }),
                    dataFilter: filteredForDomaineFonc,
                    getValue: item => item.domaineFonc
                }
            ]}
        />
    );
};
