import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useInitTendanceDates, useValidDates } from "hooks/useCompasDataDate";
import * as clientGen from "todos-api/client.gen";
import { act } from "react";
import type { ActionTendance } from "store/tendance-context";

vi.mock("todos-api/client.gen");

vi.mock("services/greenItService", () => ({
    getValidDates: vi.fn()
}));

const mockedGetValidDates = vi.mocked(clientGen.getValidDates);

// --- useValidDates -----------------------------------------------------------------

describe("useValidDates", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("initialise validDates et validDatesSet vides avant résolution de la promesse", () => {
        mockedGetValidDates.mockReturnValue(new Promise(() => {})); // jamais résolue
        const { result } = renderHook(() => useValidDates());
        expect(result.current.validDates).toEqual([]);
        expect(result.current.validDatesSet).toEqual(new Set());
    });

    it("formate les dates ISO en dd/MM/yyyy et les trie chronologiquement", async () => {
        mockedGetValidDates.mockResolvedValue(["2024-03-15", "2024-01-10", "2024-02-20"]);

        const { result } = renderHook(() => useValidDates());

        await waitFor(() => {
            expect(result.current.validDates).toHaveLength(3);
        });

        expect(result.current.validDates).toEqual(["10/01/2024", "20/02/2024", "15/03/2024"]);
    });

    it("expose les dates triées dans un Set pour un accès rapide", async () => {
        mockedGetValidDates.mockResolvedValue(["2024-03-15", "2024-01-10"]);

        const { result } = renderHook(() => useValidDates());

        await waitFor(() => {
            expect(result.current.validDatesSet.size).toBe(2);
        });

        expect(result.current.validDatesSet.has("10/01/2024")).toBe(true);
        expect(result.current.validDatesSet.has("15/03/2024")).toBe(true);
    });

    it("retourne un tableau vide si l'API ne renvoie aucune date", async () => {
        mockedGetValidDates.mockResolvedValue([]);

        const { result } = renderHook(() => useValidDates());

        await waitFor(() => {
            expect(mockedGetValidDates).toHaveBeenCalledTimes(1);
        });

        expect(result.current.validDates).toEqual([]);
        expect(result.current.validDatesSet).toEqual(new Set());
    });

    it("n'appelle getValidDates qu'une seule fois même en cas de re-render", async () => {
        mockedGetValidDates.mockResolvedValue(["2024-01-10"]);
        const { rerender } = renderHook(() => useValidDates());
        rerender();
        rerender();

        await waitFor(() => {
            expect(mockedGetValidDates).toHaveBeenCalledTimes(1);
        });
    });

    it("n'applique pas le résultat si le composant est démonté avant la résolution", async () => {
        let resolvePromise: (value: string[]) => void;
        mockedGetValidDates.mockReturnValue(
            new Promise(resolve => {
                resolvePromise = resolve;
            })
        );

        const { result, unmount } = renderHook(() => useValidDates());
        unmount();

        await act(async () => {
            resolvePromise!(["2024-01-10"]);
            await Promise.resolve();
        });

        expect(result.current.validDates).toEqual([]);
    });
});

// --- useInitTendanceDates -----------------------------------------------------------------

describe("useInitTendanceDates", () => {
    let dispatchTendance: React.Dispatch<ActionTendance>;

    beforeEach(() => {
        dispatchTendance = vi.fn();
    });

    it("ne dispatch rien tant que validDates est vide", () => {
        renderHook(() => useInitTendanceDates([], dispatchTendance));
        expect(dispatchTendance).not.toHaveBeenCalled();
    });

    it("dispatch GREEN_DATE avec les deux dernières dates disponibles", () => {
        const validDates = ["10/01/2024", "20/02/2024", "15/03/2024"];
        renderHook(() => useInitTendanceDates(validDates, dispatchTendance));

        expect(dispatchTendance).toHaveBeenCalledTimes(1);
        expect(dispatchTendance).toHaveBeenCalledWith({
            type: "GREEN_DATE",
            payload: { dateDebut: "20/02/2024", dateFin: "15/03/2024" }
        });
    });

    it("utilise la même date pour dateDebut et dateFin s'il n'y a qu'une seule date valide", () => {
        const validDates = ["15/03/2024"];
        renderHook(() => useInitTendanceDates(validDates, dispatchTendance));

        expect(dispatchTendance).toHaveBeenCalledWith({
            type: "GREEN_DATE",
            payload: { dateDebut: "15/03/2024", dateFin: "15/03/2024" }
        });
    });

    it("ne dispatch qu'une seule fois même si validDates change ensuite (isInitialized)", () => {
        const { rerender } = renderHook(({ dates }) => useInitTendanceDates(dates, dispatchTendance), {
            initialProps: { dates: ["10/01/2024", "20/02/2024"] }
        });
        expect(dispatchTendance).toHaveBeenCalledTimes(1);

        rerender({ dates: ["10/01/2024", "20/02/2024", "15/03/2024"] });

        // isInitialized.current bloque tout nouveau dispatch
        expect(dispatchTendance).toHaveBeenCalledTimes(1);
    });

    it("ne dispatch pas au premier rendu si validDates est vide, puis dispatch une fois rempli", () => {
        const { rerender } = renderHook(({ dates }) => useInitTendanceDates(dates, dispatchTendance), {
            initialProps: { dates: [] as string[] }
        });
        expect(dispatchTendance).not.toHaveBeenCalled();

        rerender({ dates: ["10/01/2024"] });

        expect(dispatchTendance).toHaveBeenCalledTimes(1);
        expect(dispatchTendance).toHaveBeenCalledWith({
            type: "GREEN_DATE",
            payload: { dateDebut: "10/01/2024", dateFin: "10/01/2024" }
        });
    });
});
