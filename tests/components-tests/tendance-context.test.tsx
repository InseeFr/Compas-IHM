import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TendanceProvider, useTendanceContext } from "../../src/store/tendance-context";

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TendanceProvider>{children}</TendanceProvider>
);

describe("TendanceContext", () => {
    describe("état initial", () => {
        it("doit avoir une date de fin définie", () => {
            const { result } = renderHook(() => useTendanceContext(), { wrapper });

            expect(result.current.stateTendance.dateFin).toBeDefined();
        });

        it("doit avoir une date de début définie", () => {
            const { result } = renderHook(() => useTendanceContext(), { wrapper });

            expect(result.current.stateTendance.dateDebut).toBeDefined();
        });

        it("doit exposer dispatchTendance comme une fonction", () => {
            const { result } = renderHook(() => useTendanceContext(), { wrapper });

            expect(typeof result.current.dispatchTendance).toBe("function");
        });
    });

    describe("action SET_DATE_FIN", () => {
        it("doit mettre à jour la date de fin", () => {
            const { result } = renderHook(() => useTendanceContext(), { wrapper });
            const nouvelleDateFin = "31/12/2023";

            act(() => {
                result.current.dispatchTendance({ type: "SET_DATE_FIN", payload: nouvelleDateFin });
            });

            expect(result.current.stateTendance.dateFin).toBe(nouvelleDateFin);
        });
    });

    describe("action SET_DATE_DEBUT", () => {
        it("doit mettre à jour la date de début", () => {
            const { result } = renderHook(() => useTendanceContext(), { wrapper });
            const nouvelleDateDebut = "01/01/2023";

            act(() => {
                result.current.dispatchTendance({ type: "SET_DATE_DEBUT", payload: nouvelleDateDebut });
            });

            expect(result.current.stateTendance.dateDebut).toBe(nouvelleDateDebut);
        });
    });

    describe("useTendanceContext hors Provider", () => {
        it("doit retourner les valeurs par défaut du contexte si utilisé sans Provider", () => {
            const { result } = renderHook(() => useTendanceContext());

            expect(result.current.stateTendance.dateFin).toBeDefined();
            expect(result.current.stateTendance.dateDebut).toBeDefined();
            expect(typeof result.current.dispatchTendance).toBe("function");
        });
    });
});
