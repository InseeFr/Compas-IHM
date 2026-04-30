import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";

export interface TendanceState {
    periode: string;
}

export type ActionTendance = { type: "SET_TENDANCE"; payload: string };

const initialState: TendanceState = {
    periode: "MOIS"
};

function filterReducer(state: TendanceState, action: ActionTendance): TendanceState {
    if (action.type === "SET_TENDANCE") {
        return { ...state, periode: action.payload };
    }
    return state;
}

const TendanceContext = createContext<{
    stateTendance: TendanceState;
    dispatchTendance: React.Dispatch<ActionTendance>;
}>({ stateTendance: initialState, dispatchTendance: () => {} });

export const TendanceProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(filterReducer, initialState);
    const values = useMemo(() => {
        return { stateTendance: state, dispatchTendance: dispatch };
    }, [state, dispatch]);
    return <TendanceContext.Provider value={values}>{children}</TendanceContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTendanceContext = () => useContext(TendanceContext);
