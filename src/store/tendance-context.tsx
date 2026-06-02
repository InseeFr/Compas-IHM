import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { format } from "date-fns";

export interface TendanceState {
    dateFin: string;
    dateDebut: string;
}

export type ActionTendance =
    | { type: "SET_DATE_FIN"; payload: string }
    | { type: "SET_DATE_DEBUT"; payload: string }
    | { type: "SET_PERIODE_INIT"; payload: { dateFin: string; dateDebut: string } };

const now = format(new Date(), "dd/MM/yyyy");

const previousMonth = format(new Date(new Date().setMonth(new Date().getMonth() - 1)), "dd/MM/yyyy");

const initialState: TendanceState = {
    dateFin: now,
    dateDebut: previousMonth
};

function filterReducer(state: TendanceState, action: ActionTendance): TendanceState {
    switch (action.type) {
        case "SET_DATE_FIN":
            return {
                ...state,
                dateFin: action.payload
            };

        case "SET_DATE_DEBUT":
            return {
                ...state,
                dateDebut: action.payload
            };

        case "SET_PERIODE_INIT":
            return {
                ...state,
                dateFin: action.payload.dateFin,
                dateDebut: action.payload.dateDebut
            };

        default:
            return state;
    }
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
