import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TendanceProvider, useTendanceContext } from "../../src/store/tendance-context";


const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TendanceProvider>{children}</TendanceProvider>
);


describe("TendanceContext", () => {
    describe("état initial", () => {
        it('doit avoir "MOIS" comme période par défaut', () => {
            const { result } = renderHook(() => useTendanceContext(), { wrapper });

            expect(result.current.stateTendance.periode).toBe("MOIS");
        });

        it("doit exposer dispatchTendance comme une fonction", () => {
            const { result } = renderHook(() => useTendanceContext(), { wrapper });

            expect(typeof result.current.dispatchTendance).toBe("function");
        });
    });

    describe("action SET_TENDANCE", () => {
        it('doit mettre à jour la période à "ANNEE"', () => {
            const { result } = renderHook(() => useTendanceContext(), { wrapper });

            act(() => {
                result.current.dispatchTendance({ type: "SET_TENDANCE", payload: "ANNEE" });
            });

            expect(result.current.stateTendance.periode).toBe("ANNEE");
        });

        it('doit mettre à jour la période à "SEMAINE"', () => {
            const { result } = renderHook(() => useTendanceContext(), { wrapper });

            act(() => {
                result.current.dispatchTendance({ type: "SET_TENDANCE", payload: "SEMAINE" });
            });

            expect(result.current.stateTendance.periode).toBe("SEMAINE");
        });

        it("doit permettre plusieurs mises à jour successives", () => {
            const { result } = renderHook(() => useTendanceContext(), { wrapper });

            act(() => {
                result.current.dispatchTendance({ type: "SET_TENDANCE", payload: "ANNEE" });
            });
            expect(result.current.stateTendance.periode).toBe("ANNEE");

            act(() => {
                result.current.dispatchTendance({ type: "SET_TENDANCE", payload: "SEMAINE" });
            });
            expect(result.current.stateTendance.periode).toBe("SEMAINE");

            act(() => {
                result.current.dispatchTendance({ type: "SET_TENDANCE", payload: "MOIS" });
            });
            expect(result.current.stateTendance.periode).toBe("MOIS");
        });

        it("ne doit pas muter les autres propriétés de l'état", () => {
            const { result } = renderHook(() => useTendanceContext(), { wrapper });
            const stateAvant = result.current.stateTendance;

            act(() => {
                result.current.dispatchTendance({ type: "SET_TENDANCE", payload: "ANNEE" });
            });

            expect(stateAvant.periode).toBe("MOIS");
            expect(result.current.stateTendance.periode).toBe("ANNEE");
        });
    });

    describe("useTendanceContext hors Provider", () => {
        it("doit retourner les valeurs par défaut du contexte si utilisé sans Provider", () => {
            const { result } = renderHook(() => useTendanceContext());

            expect(result.current.stateTendance.periode).toBe("MOIS");
            expect(typeof result.current.dispatchTendance).toBe("function");
        });
    });
});