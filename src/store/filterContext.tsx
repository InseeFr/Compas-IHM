import { createContext, useReducer, useMemo, type ReactNode, useContext } from "react";

export interface FilterState {
    serviceDev: string;
    domaineDev: string;
    appName: string;
}

export type Action =
    | { type: "SET_SERVICE_DEV"; payload: string }
    | { type: "SET_DOMAINE_DEV"; payload: string }
    | { type: "SET_APP_NAME"; payload: string }
    | { type: "RESET_FILTERS" };

const initialState: FilterState = {
    serviceDev: "",
    domaineDev: "",
    appName: ""
};

function filterReducer(state: FilterState, action: Action): FilterState {
    switch (action.type) {
        case "SET_SERVICE_DEV":
            return { ...state, serviceDev: action.payload };
        case "SET_DOMAINE_DEV":
            return { ...state, domaineDev: action.payload };
        case "SET_APP_NAME":
            return { ...state, appName: action.payload };
        case "RESET_FILTERS":
            return initialState;
        default:
            return state;
    }
}

const FilterContext = createContext<{
    state: FilterState;
    dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => {} });

export const FilterProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(filterReducer, initialState);
    const memoState = useMemo(() => ({ state, dispatch }), [state, dispatch]);
    return <FilterContext.Provider value={memoState}>{children}</FilterContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFilterContext = () => useContext(FilterContext);
