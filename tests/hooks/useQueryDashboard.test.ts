import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { GlobalIndicator } from "models/indicateurs";
import { useQueryDashboard } from "hooks/useQueryDashboard";

// --- Mocks ---

const mockUseQuery = vi.fn();
vi.mock("@tanstack/react-query", () => ({
    useQuery: (...args: unknown[]) => mockUseQuery(...args)
}));

const mockUseFilterContext = vi.fn();
vi.mock("store/filterContext", () => ({
    useFilterContext: () => mockUseFilterContext()
}));

const mockApplyDevFilters = vi.fn();
vi.mock("utils/filters-functions", () => ({
    applyDevFilters: (...args: unknown[]) => mockApplyDevFilters(...args)
}));

// --- Fixtures ---

const mockData: GlobalIndicator[] = [
    { applicationName: "App X", domaine: "D1" } as unknown as GlobalIndicator,
    { applicationName: "App Y", domaine: "D2" } as unknown as GlobalIndicator
];

// --- Tests ---

describe("useQueryDashboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseFilterContext.mockReturnValue({ state: {} });
        mockUseQuery.mockReturnValue({ data: mockData, isLoading: false });
        mockApplyDevFilters.mockReturnValue(true);
    });

    it("appelle useQuery avec la bonne queryKey", () => {
        renderHook(() =>
            useQueryDashboard({
                queryKey: ["TestDashboard"],
                fetchData: vi.fn()
            })
        );
        expect(mockUseQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["TestDashboard"]
            })
        );
    });

    it("appelle useQuery avec fetchData comme queryFn", () => {
        const fetchData = vi.fn();
        renderHook(() =>
            useQueryDashboard({
                queryKey: ["TestDashboard"],
                fetchData
            })
        );
        expect(mockUseQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryFn: fetchData
            })
        );
    });

    it("retourne les données brutes", () => {
        const { result } = renderHook(() =>
            useQueryDashboard({
                queryKey: ["TestDashboard"],
                fetchData: vi.fn()
            })
        );
        expect(result.current.data).toEqual(mockData);
    });

    it("retourne isLoading à true pendant le chargement", () => {
        mockUseQuery.mockReturnValueOnce({ data: undefined, isLoading: true });
        const { result } = renderHook(() =>
            useQueryDashboard({
                queryKey: ["TestDashboard"],
                fetchData: vi.fn()
            })
        );
        expect(result.current.isLoading).toBe(true);
    });

    it("retourne isLoading à false après chargement", () => {
        const { result } = renderHook(() =>
            useQueryDashboard({
                queryKey: ["TestDashboard"],
                fetchData: vi.fn()
            })
        );
        expect(result.current.isLoading).toBe(false);
    });

    it("retourne les données filtrées via applyDevFilters", () => {
        mockApplyDevFilters.mockImplementation(
            (item: GlobalIndicator) => item.applicationName === "App X"
        );
        const { result } = renderHook(() =>
            useQueryDashboard({
                queryKey: ["TestDashboard"],
                fetchData: vi.fn()
            })
        );
        expect(result.current.filteredData).toHaveLength(1);
        expect(result.current.filteredData[0]).toEqual({ applicationName: "App X", domaine: "D1" });
    });

    it("retourne un tableau vide si aucune donnée ne passe le filtre", () => {
        mockApplyDevFilters.mockReturnValue(false);
        const { result } = renderHook(() =>
            useQueryDashboard({
                queryKey: ["TestDashboard"],
                fetchData: vi.fn()
            })
        );
        expect(result.current.filteredData).toHaveLength(0);
    });

    it("appelle applyDevFilters avec le state du contexte", () => {
        const state = { domaine: "D1" };
        mockUseFilterContext.mockReturnValue({ state });
        renderHook(() =>
            useQueryDashboard({
                queryKey: ["TestDashboard"],
                fetchData: vi.fn()
            })
        );
        expect(mockApplyDevFilters).toHaveBeenCalledWith(expect.anything(), state);
    });

    it("retourne un tableau vide par défaut si data est undefined", () => {
        mockUseQuery.mockReturnValueOnce({ data: undefined, isLoading: false });
        const { result } = renderHook(() =>
            useQueryDashboard({
                queryKey: ["TestDashboard"],
                fetchData: vi.fn()
            })
        );
        expect(result.current.data).toEqual([]);
        expect(result.current.filteredData).toEqual([]);
    });
});
