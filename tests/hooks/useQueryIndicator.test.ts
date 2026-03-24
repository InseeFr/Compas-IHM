import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { FilterableItem } from "models/indicateurs";
import { useQueryIndicators } from "hooks/useQueryIndicators";

const mockUseQuery = vi.fn();
vi.mock("@tanstack/react-query", () => ({
    useQuery: (...args: unknown[]) => mockUseQuery(...args)
}));

const mockUseFilterContext = vi.fn();
vi.mock("store/filterContext", () => ({
    useFilterContext: () => mockUseFilterContext()
}));

const mockGroupModulesByApp = vi.fn();
vi.mock("utils/group-module-by-apps", () => ({
    groupModulesByApp: (...args: unknown[]) => mockGroupModulesByApp(...args)
}));

const mockApplyDevFilters = vi.fn();
vi.mock("utils/filters-functions", () => ({
    applyDevFilters: (...args: unknown[]) => mockApplyDevFilters(...args)
}));

type TestItem = FilterableItem & { name: string };

const mockData: TestItem[] = [
    { name: "App X" } as unknown as TestItem,
    { name: "App Y" } as unknown as TestItem
];

const mockModulesByApp = { "App X": [], "App Y": [] };

describe("useQueryIndicators", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseFilterContext.mockReturnValue({ state: {} });
        mockUseQuery.mockReturnValue({ data: mockData, isLoading: false });
        mockGroupModulesByApp.mockReturnValue(mockModulesByApp);
        mockApplyDevFilters.mockReturnValue(true);
    });

    it("appelle useQuery avec la bonne queryKey", () => {
        renderHook(() =>
            useQueryIndicators({
                queryKey: ["testKey"],
                fetchData: vi.fn(),
                hasModules: false
            })
        );
        expect(mockUseQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["testKey"]
            })
        );
    });

    it("appelle useQuery avec fetchData comme queryFn", () => {
        const fetchData = vi.fn();
        renderHook(() =>
            useQueryIndicators({
                queryKey: ["testKey"],
                fetchData,
                hasModules: false
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
            useQueryIndicators({
                queryKey: ["testKey"],
                fetchData: vi.fn(),
                hasModules: false
            })
        );
        expect(result.current.data).toEqual(mockData);
    });

    it("retourne isLoading à true pendant le chargement", () => {
        mockUseQuery.mockReturnValueOnce({ data: undefined, isLoading: true });
        const { result } = renderHook(() =>
            useQueryIndicators({
                queryKey: ["testKey"],
                fetchData: vi.fn(),
                hasModules: false
            })
        );
        expect(result.current.isLoading).toBe(true);
    });

    it("retourne les données filtrées via applyDevFilters", () => {
        mockApplyDevFilters.mockImplementation((item: TestItem) => item.name === "App X");
        const { result } = renderHook(() =>
            useQueryIndicators({
                queryKey: ["testKey"],
                fetchData: vi.fn(),
                hasModules: false
            })
        );
        expect(result.current.filteredData).toHaveLength(1);
        expect(result.current.filteredData[0]).toEqual({ name: "App X" });
    });

    it("retourne un tableau vide si aucune donnée ne passe le filtre", () => {
        mockApplyDevFilters.mockReturnValue(false);
        const { result } = renderHook(() =>
            useQueryIndicators({
                queryKey: ["testKey"],
                fetchData: vi.fn(),
                hasModules: false
            })
        );
        expect(result.current.filteredData).toHaveLength(0);
    });

    it("retourne modulesByApp via groupModulesByApp", () => {
        const { result } = renderHook(() =>
            useQueryIndicators({
                queryKey: ["testKey"],
                fetchData: vi.fn(),
                hasModules: true
            })
        );
        expect(result.current.modulesByApp).toEqual(mockModulesByApp);
    });

    it("appelle groupModulesByApp avec les données brutes", () => {
        renderHook(() =>
            useQueryIndicators({
                queryKey: ["testKey"],
                fetchData: vi.fn(),
                hasModules: true
            })
        );
        expect(mockGroupModulesByApp).toHaveBeenCalledWith(mockData);
    });

    it("appelle applyDevFilters avec le state du contexte", () => {
        const state = { domaine: "D1" };
        mockUseFilterContext.mockReturnValue({ state });
        renderHook(() =>
            useQueryIndicators({
                queryKey: ["testKey"],
                fetchData: vi.fn(),
                hasModules: false
            })
        );
        expect(mockApplyDevFilters).toHaveBeenCalledWith(expect.anything(), state);
    });

    it("retourne un tableau vide par défaut si data est undefined", () => {
        mockUseQuery.mockReturnValueOnce({ data: undefined, isLoading: false });
        const { result } = renderHook(() =>
            useQueryIndicators({
                queryKey: ["testKey"],
                fetchData: vi.fn(),
                hasModules: false
            })
        );
        expect(result.current.data).toEqual([]);
        expect(result.current.filteredData).toEqual([]);
    });
});
