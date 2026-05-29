import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { format } from "date-fns";

export interface TendanceState {
    dateOrigine: string;
    datePassee: string;
}

export type ActionTendance =
    | { type: "SET_DATE_ORIGINE"; payload: string }
    | { type: "SET_DATE_PASSEE"; payload: string }
    | { type: "SET_PERIODE_INIT"; payload: { dateOrigine: string; datePassee: string } };

const now = format(new Date(), "dd/MM/yyyy");

const previousMonth = format(
  new Date(new Date().setMonth(new Date().getMonth() - 1)),
  "dd/MM/yyyy"
);

const initialState: TendanceState = {
    dateOrigine: now,
    datePassee: previousMonth
};

function filterReducer(state: TendanceState, action: ActionTendance): TendanceState {
    switch (action.type) {
        case "SET_DATE_ORIGINE":
            return {
                ...state,
                dateOrigine: action.payload
            };

        case "SET_DATE_PASSEE":
            return {
                ...state,
                datePassee: action.payload
            };

        case "SET_PERIODE_INIT":
            return {
                ...state,
                dateOrigine: action.payload.dateOrigine,
                datePassee: action.payload.datePassee
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
