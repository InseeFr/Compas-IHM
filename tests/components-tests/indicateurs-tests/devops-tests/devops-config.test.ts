import { describe, it, expect, vi } from "vitest";
import { formatIndicateur, onExport } from "../../../../src/components/indicateurs/devops/devopsConfig";
import { handleExportCsv } from "utils/exportCsv";
import type { DevopsIndicateur } from "models/devops-indicateur";
import type { MRT_TableInstance } from "material-react-table";

vi.mock("../../../../src/utils/exportCsv", () => ({
    handleExportCsv: vi.fn()
}));

describe("formatIndicateur", () => {
    it("formate correctement une application", () => {
        const result = formatIndicateur({
            applicationName: "App1",
            sndi: "S1",
            domaineSndi: "D1"
        } as unknown as DevopsIndicateur);

        expect(result).toEqual(
            expect.objectContaining({
                applicationName: "App1",
                sndi: "S1",
                domaine: "D1"
            })
        );
    });

    it("formate correctement un module", () => {
        const result = formatIndicateur(
            {
                applicationName: "App1",
                moduleName: "Mod1",
                sndi: "S1"
            } as unknown as DevopsIndicateur,
            true
        );

        expect(result).toEqual(
            expect.objectContaining({
                applicationName: "Mod1",
                parentApplication: "App1",
                isModule: true
            })
        );
    });
});

describe("onExport", () => {
    it("exporte les lignes formatées en CSV", () => {
        const table = {
            getPrePaginationRowModel: () => ({
                rows: [
                    {
                        original: {
                            applicationName: "App1",
                            sndi: "S1",
                            domaine: "D1",
                            lettreContributorCount: "A",
                            lettreDeploymentCount: "B",
                            lettreDistanceCount: "C"
                        }
                    }
                ]
            })
        } as MRT_TableInstance<DevopsIndicateur>;

        onExport(table);

        expect(handleExportCsv).toHaveBeenCalledOnce();
        expect(handleExportCsv).toHaveBeenCalledWith("devops", expect.any(Array), [
            `"App1","","S1","D1","A","B","C"`
        ]);
    });
});
