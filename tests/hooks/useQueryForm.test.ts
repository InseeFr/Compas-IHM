/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useQueryForm } from "hooks/useQueryForm";
import * as filterContext from "store/filterContext";
import * as filterFunctions from "utils/filters-functions";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("store/filterContext", () => ({
    useFilterContext: vi.fn()
}));

vi.mock("utils/filters-functions", () => ({
    applyDevFilters: vi.fn()
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockState = { service: null, domaine: null };

const mockData = [
    { id: 1, name: "Indicateur A" },
    { id: 2, name: "Indicateur B" },
    { id: 3, name: "Indicateur C" }
] as any[];

// Wrapper QueryClient isolé pour chaque test
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false, // pas de retry en test
                gcTime: 0
            }
        }
    });
}

// Composant déclaré au niveau module → displayName stable, pas de warning ESLint
function TestQueryWrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: createQueryClient() }, children);
}

function makeWrapper() {
    return TestQueryWrapper;
}

// ─── Suite de tests ───────────────────────────────────────────────────────────

describe("useQueryForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(filterContext.useFilterContext).mockReturnValue({
            state: mockState,
            dispatch: vi.fn()
        } as any);

        // Par défaut : aucun filtre actif, tous les items passent
        vi.mocked(filterFunctions.applyDevFilters).mockReturnValue(true);
    });

    // ── 1. Retourne les données brutes depuis l'API ────────────────────────────

    it("retourne les données fetchées", async () => {
        const fetchData = vi.fn().mockResolvedValue(mockData);

        const { result } = renderHook(
            () =>
                useQueryForm({
                    queryKey: ["test-key"],
                    fetchData
                }),
            { wrapper: makeWrapper() }
        );

        await waitFor(() => {
            expect(result.current.data).toEqual(mockData);
        });

        expect(fetchData).toHaveBeenCalledTimes(1);
    });

    // ── 2. Retourne des tableaux vides avant la résolution ────────────────────

    it("retourne des tableaux vides tant que le fetch n'est pas résolu", () => {
        // fetchData ne résout jamais (pending)
        const fetchData = vi.fn().mockReturnValue(new Promise(() => {}));

        const { result } = renderHook(() => useQueryForm({ queryKey: ["pending-key"], fetchData }), {
            wrapper: makeWrapper()
        });

        expect(result.current.data).toEqual([]);
        expect(result.current.filteredData).toEqual([]);
    });

    // ── 3. filteredData contient uniquement les items qui passent le filtre ────

    it("filtre les données selon applyDevFilters", async () => {
        const fetchData = vi.fn().mockResolvedValue(mockData);

        // Seul l'item id=1 passe le filtre
        vi.mocked(filterFunctions.applyDevFilters).mockImplementation((item: any) => item.id === 1);

        const { result } = renderHook(() => useQueryForm({ queryKey: ["filter-key"], fetchData }), {
            wrapper: makeWrapper()
        });

        await waitFor(() => {
            expect(result.current.filteredData).toEqual([{ id: 1, name: "Indicateur A" }]);
        });

        // data brut reste complet
        expect(result.current.data).toEqual(mockData);
    });

    // ── 4. filteredData est vide si aucun item ne passe le filtre ─────────────

    it("retourne filteredData vide si aucun item ne passe le filtre", async () => {
        const fetchData = vi.fn().mockResolvedValue(mockData);

        vi.mocked(filterFunctions.applyDevFilters).mockReturnValue(false);

        const { result } = renderHook(() => useQueryForm({ queryKey: ["no-match-key"], fetchData }), {
            wrapper: makeWrapper()
        });

        await waitFor(() => {
            expect(result.current.data).toEqual(mockData);
        });

        expect(result.current.filteredData).toEqual([]);
    });

    // ── 5. applyDevFilters reçoit bien chaque item et le state du contexte ─────

    it("appelle applyDevFilters avec chaque item et le state du contexte", async () => {
        const fetchData = vi.fn().mockResolvedValue(mockData);

        const { result } = renderHook(() => useQueryForm({ queryKey: ["args-check-key"], fetchData }), {
            wrapper: makeWrapper()
        });

        await waitFor(() => {
            expect(result.current.data.length).toBeGreaterThan(0);
        });

        expect(filterFunctions.applyDevFilters).toHaveBeenCalledTimes(mockData.length);

        mockData.forEach(item => {
            expect(filterFunctions.applyDevFilters).toHaveBeenCalledWith(item, mockState);
        });
    });

    it("retourne des tableaux vides si fetchData retourne undefined", async () => {
        const fetchData = vi.fn().mockResolvedValue(undefined);

        const { result } = renderHook(() => useQueryForm({ queryKey: ["undef-key"], fetchData }), {
            wrapper: makeWrapper()
        });

        await waitFor(() => {
            expect(result.current.data).toEqual([]);
            expect(result.current.filteredData).toEqual([]);
        });
    });
});
