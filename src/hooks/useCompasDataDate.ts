import { useQuery } from "@tanstack/react-query";
import { format, parse, parseISO } from "date-fns";
import { useEffect, useRef, useState } from "react";
import type { ActionTendance } from "store/tendance-context";
import { getValidDates } from "todos-api/client.gen";

export const useCompasDataDate = () => {
    return useQuery({
        queryKey: ["compasDataDate"],
        queryFn: async () => {
            const data = await getValidDates();
            const lastDate = new Date(
                Math.max(...data.map(date => new Date(date).getTime()))
            ).toString();
            return lastDate;
        },
        staleTime: 1000 * 60 * 5,
        retry: false
    });
};

export function useValidDates() {
    const [validDates, setValidDates] = useState<string[]>([]);
    const [validDatesSet, setValidDatesSet] = useState<Set<string>>(new Set());

    useEffect(() => {
        let cancelled = false;
        getValidDates().then(dates => {
            if (cancelled) return;

            const formatted = dates.map(d => format(parseISO(d), "dd/MM/yyyy"));
            const sorted = [...formatted].sort(
                (a, b) =>
                    parse(a, "dd/MM/yyyy", new Date()).getTime() -
                    parse(b, "dd/MM/yyyy", new Date()).getTime()
            );

            setValidDates(sorted);
            setValidDatesSet(new Set(sorted));
        });
        return () => {
            cancelled = true;
        };
    }, []);

    return { validDates, validDatesSet };
}

export function useInitTendanceDates(
    validDates: string[],
    dispatchTendance: React.Dispatch<ActionTendance>
) {
    const isInitialized = useRef(false);

    useEffect(() => {
        if (isInitialized.current || validDates.length === 0) return;

        const dateFin = validDates[validDates.length - 1];
        const dateDebut = validDates.length >= 2 ? validDates[validDates.length - 2] : dateFin;

        dispatchTendance({ type: "GREEN_DATE", payload: { dateDebut, dateFin } });
        isInitialized.current = true;
    }, [validDates, dispatchTendance]);
}
