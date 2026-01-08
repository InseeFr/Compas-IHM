/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import { MeteoTable } from "components/indicateurs/meteo/meteoTable";
import { useFilterContext } from "store/filterContext";
import * as clientApi from "todos-api/client.gen";
import * as meteoConfig from "../../../../src/components/indicateurs/meteo/meteo-config";

// ----- Mocks -----
vi.mock("store/filterContext", () => ({
    useFilterContext: vi.fn()
}));

vi.mock("todos-api/client.gen", () => ({
    getHistory: vi.fn()
}));

vi.mock("../../../../src/components/indicateurs/meteo/meteo-config", () => ({
    buildMeteo: vi.fn(data => data),
    columnsMeteo: vi.fn(() => [{ header: "Application", accessorKey: "applicationName" }]),
    month: vi.fn(() => ["Jan", "Feb"]),
    onExport: vi.fn(),
    paginationConfig: {}
}));

vi.mock("pages/TablePageLayout", () => ({
    default: ({ data, renderTopCustom }: any) => (
        <div>
            {renderTopCustom?.({ table: "mockTable" })}
            {data.map((item: any) => (
                <div key={item.idApplication ?? item.applicationName}>{item.applicationName}</div>
            ))}
        </div>
    )
}));

vi.mock("pages/ButtonCsvExport", () => ({
    default: ({ onExport }: any) => <button onClick={() => onExport("mockTable")}>Export CSV</button>
}));

// ----- Données Mock -----
const mockMeteoData = [
    { idApplication: 1, applicationName: "App1" },
    { idApplication: 2, applicationName: "App2" }
];

describe("MeteoTable", () => {
    const stateMock = {};
    const dispatchMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useFilterContext as any).mockReturnValue({ state: stateMock, dispatch: dispatchMock });
        (clientApi.getHistory as any).mockResolvedValue(mockMeteoData);
    });

    it("renders applications", async () => {
        render(<MeteoTable />);

        await waitFor(() => {
            expect(screen.getByText("App1")).toBeDefined();
            expect(screen.getByText("App2")).toBeDefined();
        });
    });

    it("calls onExport when clicking Export CSV button", async () => {
        render(<MeteoTable />);

        const exportButton = await screen.findByText("Export CSV");
        fireEvent.click(exportButton);

        expect(meteoConfig.onExport).toHaveBeenCalledWith("mockTable");
    });

    it("logs error when getHistory fails", async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        (clientApi.getHistory as any).mockRejectedValue(new Error("fail"));

        render(<MeteoTable />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Erreur lors de la récupération du meteo history: ",
                expect.any(Error)
            );
        });

        consoleErrorSpy.mockRestore();
    });
});
