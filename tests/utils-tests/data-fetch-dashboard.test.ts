import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchData } from "utils/data-fetch-dashboard";
import type { GlobalIndicator } from "models/indicateurs";

vi.mock("todos-api/client.gen", () => ({
    getApplications1: vi.fn(),
    getIndicateurQualiteByApplicationByDate: vi.fn(),
    getApplications2: vi.fn(),
    listerApplicationsMeteo: vi.fn(),
    getApplications: vi.fn(),
    listerApplicationA11y: vi.fn(),
    getIndicateurSecuriteByApplication: vi.fn(),
    getMaturiteCloud: vi.fn()
}));

vi.mock("pages/indicateurs/main-indicator/formatted-mod-and-app", () => ({
    formattedApps: vi.fn()
}));

import * as api from "todos-api/client.gen";
import { formattedApps } from "pages/indicateurs/main-indicator/formatted-mod-and-app";

const mockApps = [{ idApplication: 1, appName: "App X" }];
const mockFormattedApps: GlobalIndicator[] = [
    { applicationName: "App X", domaine: "D1" } as unknown as GlobalIndicator
];

describe("fetchData", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(api.getApplications1).mockResolvedValue(mockApps);
        vi.mocked(api.getIndicateurQualiteByApplicationByDate).mockResolvedValue([]);
        vi.mocked(api.getApplications2).mockResolvedValue([]);
        vi.mocked(api.listerApplicationsMeteo).mockResolvedValue([]);
        vi.mocked(api.getApplications).mockResolvedValue([]);
        vi.mocked(api.listerApplicationA11y).mockResolvedValue([]);
        vi.mocked(api.getIndicateurSecuriteByApplication).mockResolvedValue([]);
        vi.mocked(api.getMaturiteCloud).mockResolvedValue([]);
        vi.mocked(formattedApps).mockReturnValue(mockFormattedApps);
    });

    it("appelle les 8 APIs en parallèle", async () => {
        await fetchData();

        expect(api.getApplications1).toHaveBeenCalledTimes(1);
        expect(api.getIndicateurQualiteByApplicationByDate).toHaveBeenCalledTimes(1);
        expect(api.getApplications2).toHaveBeenCalledTimes(1);
        expect(api.listerApplicationsMeteo).toHaveBeenCalledTimes(1);
        expect(api.getApplications).toHaveBeenCalledTimes(1);
        expect(api.listerApplicationA11y).toHaveBeenCalledTimes(1);
        expect(api.getIndicateurSecuriteByApplication).toHaveBeenCalledTimes(1);
        expect(api.getMaturiteCloud).toHaveBeenCalledTimes(1);
    });

    it("appelle formattedApps avec les données des 8 APIs", async () => {
        await fetchData();

        expect(formattedApps).toHaveBeenCalledWith({
            apps: mockApps,
            qualiteAppData: [],
            devopsAppData: [],
            meteoData: [],
            consoAppData: [],
            a11yDataApps: [],
            securiteApps: [],
            maturiteCloudApps: []
        });
    });

    it("retourne les applications formatées", async () => {
        const result = await fetchData();
        expect(result).toEqual(mockFormattedApps);
    });

    it("retourne undefined et log une erreur si une API échoue", async () => {
        vi.mocked(api.getApplications1).mockRejectedValueOnce(new Error("Network error"));
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        const result = await fetchData();

        expect(result).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalledWith("Erreur chargement données qualité:", expect.any(Error));
        consoleSpy.mockRestore();
    });

    it("ne appelle pas formattedApps si une API échoue", async () => {
        vi.mocked(api.getApplications1).mockRejectedValueOnce(new Error("Network error"));
        vi.spyOn(console, "error").mockImplementation(() => {});

        await fetchData();

        expect(formattedApps).not.toHaveBeenCalled();
    });
});
