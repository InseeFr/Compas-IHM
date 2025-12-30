/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DevopsIndicateurTable } from "../src/components/indicateurs/devops/DevopsIndicateur";
import * as client from "../src/todos-api/client.gen";
import * as exportCsv from "../src/utils/exportCsv";

vi.mock("../src/todos-api/client.gen", () => ({
    getApplications2: vi.fn(),
    getModules2: vi.fn()
}));

vi.mock("../src/utils/exportCsv", () => ({
    handleExportCsv: vi.fn()
}));

const mockApps = [
    {
        applicationName: "App1",
        sndi: "S1",
        domaineSndi: "D1",
        lettreContributorCount: "A",
        lettreDeploymentCount: "B",
        lettreDistanceCount: "C",
        nbContributorCount: 1,
        nbDeploymentCount: 2,
        distanceCount: 3,
        lettreGlobalDevops: "G"
    }
];

const mockModules = [
    {
        applicationName: "App1",
        moduleName: "Mod1",
        sndi: "S1",
        domaineSndi: "D1",
        lettreContributorCount: "X",
        lettreDeploymentCount: "Y",
        lettreDistanceCount: "Z",
        nbContributorCount: 4,
        nbDeploymentCount: 5,
        distanceCount: 6,
        lettreGlobalDevops: "H"
    }
];

describe("DevopsIndicateurTable", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(client.getApplications2).mockResolvedValue(mockApps as any);
        vi.mocked(client.getModules2).mockResolvedValue(mockModules as any);
    });

    it("devrait retourner la data de devops", async () => {
        const apps = await client.getApplications2();
        const modules = await client.getModules2();

        expect(apps).toEqual(mockApps);
        expect(modules).toEqual(mockModules);
    });

    it("renders table with fetched data", async () => {
        render(<DevopsIndicateurTable />);

        expect(await screen.findByText("Nom")).toBeInTheDocument();
        expect(screen.getByText("Service dev.")).toBeInTheDocument();

        expect(await screen.findByText("App1")).toBeInTheDocument();

        expect(await screen.findByText("Mod1")).toBeInTheDocument();
    });

    it("exporte correctement les données en CSV", async () => {
        render(<DevopsIndicateurTable />);
        await screen.findByText("App1");

        const exportButton = screen.getByTestId("button-export-csv");
        exportButton.click();

        expect(exportCsv.handleExportCsv).toHaveBeenCalledTimes(1);

        const [filename, headers, csvData] = vi.mocked(exportCsv.handleExportCsv).mock.calls[0];

        expect(filename).toBe("devops");

        expect(headers).toBeDefined();
        expect(Array.isArray(headers)).toBe(true);

        expect(csvData).toEqual([
            `"App1","","S1","D1","A","B","C"`,
            `"App1","Mod1","S1","D1","X","Y","Z"`
        ]);
    });
});
