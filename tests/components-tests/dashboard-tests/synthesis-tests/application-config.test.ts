/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("todos-api/client.gen", () => ({
    getApplications1: vi.fn(),
    getModules1: vi.fn(),
    getIndicateurQualiteByApplication: vi.fn(),
    getIndicateurQualiteByModule: vi.fn(),
    getApplications2: vi.fn(),
    getModules2: vi.fn(),
    listerApplicationsMeteo: vi.fn(),
    getApplications: vi.fn(),
    listerModulesA11y: vi.fn(),
    getIndicateurSecuriteByApplication: vi.fn(),
    getMaturiteCloud: vi.fn(),
    getHomologation: vi.fn()
}));

import {
    getApplications1,
    getModules1,
    getIndicateurQualiteByApplication,
    getIndicateurQualiteByModule,
    getApplications2,
    getModules2,
    listerApplicationsMeteo,
    getApplications,
    listerModulesA11y,
    getIndicateurSecuriteByApplication,
    getMaturiteCloud,
    getHomologation
} from "todos-api/client.gen";
import {
    fetchApplicationSynthesis,
    handleGenerateReport,
    normalize,
    transformModuleData
} from "pages/dashboards/applications/application-synthesis-config";

const addImage = vi.fn();
const save = vi.fn();

function JsPDFMock(this: any) {
    this.addImage = vi.fn().mockReturnValue(this);
    this.save = save;
    this.internal = {
        pageSize: {
            getWidth: () => 210,
            getHeight: () => 297
        }
    };
}

vi.mock("todos-api/client.gen", () => ({
    getApplications1: vi.fn(),
    getModules1: vi.fn(),
    getApplications2: vi.fn(),
    getModules2: vi.fn(),
    getApplications: vi.fn(),
    listerApplicationsMeteo: vi.fn(),
    listerModulesA11y: vi.fn(),
    getIndicateurQualiteByApplication: vi.fn(),
    getIndicateurQualiteByModule: vi.fn(),
    getIndicateurSecuriteByApplication: vi.fn(),
    getMaturiteCloud: vi.fn(),
    getHomologation: vi.fn()
}));

vi.mock("jspdf", () => ({
    __esModule: true,
    default: JsPDFMock
}));

vi.mock("html2canvas", () => ({
    __esModule: true,
    default: vi.fn().mockResolvedValue({
        width: 100,
        height: 100,
        toDataURL: () => "data:image/png;base64,test"
    })
}));

describe("application-synthesis-config", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("normalize", () => {
        it("normalizes values correctly", () => {
            expect(normalize("  Test ")).toBe("test");
            expect(normalize(123)).toBe("123");
            expect(normalize(undefined)).toBe("");
        });
    });

    describe("transformModuleData", () => {
        it("transforms module data correctly", () => {
            const result = transformModuleData({
                applicationName: "Module A",
                lettreQualiteGenerale: "A",
                pourcentageCouvertureTestUniaire: "85",
                detteTechnique: "12.00",
                lettreA11y: "B",
                distanceValue: "5",
                lettreGreen: "C",
                lettreNiveauCve: "D",
                applicationId: 0,
                sndi: "",
                domaine: "",
                domaineFonc: "",
                lettreCouvertureTestUniaire: "",
                nbCveCritical: "",
                nbCveHigh: "",
                nbCveLow: "",
                nbCveMedium: ""
            });

            expect(result).toEqual({
                name: "Module A",
                qualite: "A",
                couverture: "85",
                dette: 12,
                a11y: "B",
                distance: 5,
                lettreGreen: "C",
                lettreNiveauCve: "D"
            });
        });
    });

    describe("fetchApplicationSynthesis", () => {
        it("returns formatted applications and modules", async () => {
            (getApplications1 as any).mockResolvedValue([{ idApplication: 1, appName: "App 1" }]);
            (getModules1 as any).mockResolvedValue([{ id: 10, modName: "Module 1", appName: "App 1" }]);

            (getIndicateurQualiteByApplication as any).mockResolvedValue([]);
            (getIndicateurQualiteByModule as any).mockResolvedValue([]);
            (getApplications2 as any).mockResolvedValue([]);
            (getModules2 as any).mockResolvedValue([]);
            (listerApplicationsMeteo as any).mockResolvedValue([]);
            (getApplications as any).mockResolvedValue([]);
            (listerModulesA11y as any).mockResolvedValue([]);
            (getIndicateurSecuriteByApplication as any).mockResolvedValue([]);
            (getMaturiteCloud as any).mockResolvedValue([]);
            (getHomologation as any).mockResolvedValue([]);

            const result = await fetchApplicationSynthesis();

            expect(result).toHaveLength(2);
            expect(result[0][0].applicationName).toBe("App 1");
            expect(result[1][0].applicationName).toBe("Module 1");
        });

        it("returns empty array on error", async () => {
            (getApplications1 as any).mockRejectedValue(new Error("boom"));

            const result = await fetchApplicationSynthesis();
            expect(result).toEqual([]);
        });
    });

    describe("handleGenerateReport", () => {
        beforeEach(() => {
            vi.clearAllMocks();
            document.body.innerHTML = "";
        });
        it("generates and saves pdf when element exists", async () => {
            const div = document.createElement("div");
            div.id = "app-report-pdf";
            document.body.appendChild(div);

            await handleGenerateReport("my-app");

            expect(save).toHaveBeenCalledWith("rapport-my-app.pdf");
        });

        it("does nothing if report element is missing", async () => {
            await handleGenerateReport("my-app");

            expect(addImage).not.toHaveBeenCalled();
            expect(save).not.toHaveBeenCalled();
        });
    });
});
