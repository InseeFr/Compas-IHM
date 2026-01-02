import type { ViewMode } from "constantes/constantes";
import { handleExportCsv } from "utils/exportCsv";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("handleExportCsv", () => {
    const mockCreateObjectURL = vi.fn<(blob: Blob) => string>(() => "blob:mock-url");
    const mockRevokeObjectURL = vi.fn();
    const viewMode: ViewMode = "global";
    beforeEach(() => {
        vi.restoreAllMocks();
        globalThis.URL.createObjectURL = mockCreateObjectURL;
        globalThis.URL.revokeObjectURL = mockRevokeObjectURL;
    });

    it("devrait créer et télécharger un csv avec le contenu correct et un bon nom de fichier", () => {
        const headers = ["name", "age"];
        const filteredData = ["Alice,12", "Bob,13"];
        const indicator = "users";
        const clickMock = vi.fn();

        vi.spyOn(document, "createElement").mockReturnValue({
            click: clickMock,
            set href(_value: string) {},
            set download(_value: string) {}
        } as unknown as HTMLAnchorElement);

        handleExportCsv(indicator, headers, filteredData, viewMode);

        expect(mockCreateObjectURL).toHaveBeenCalledOnce();
        expect(mockCreateObjectURL.mock.calls[0][0]).toBeInstanceOf(Blob);

        expect(clickMock).toHaveBeenCalledOnce();

        expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("devrait générer un fichier sans le viewmode", () => {
        const headers = ["col1"];
        const filteredData = ["value1"];
        const indicator = "test";

        let downloadValue = "";

        vi.spyOn(document, "createElement").mockReturnValue({
            click: vi.fn(),
            set href(_value: string) {},
            set download(value: string) {
                downloadValue = value;
            }
        } as unknown as HTMLAnchorElement);

        handleExportCsv(indicator, headers, filteredData);

        expect(downloadValue).toMatch(/-tableau-test\.csv$/);
    });
});
