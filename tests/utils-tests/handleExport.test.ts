/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ViewMode } from "constantes/constantes";
import {
    handleExportCsv,
    flattenRows,
    sanitize,
    formatValue,
    computeDetteTechniqueJours,
    escapeCsvValue
} from "utils/exportCsv";
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

describe("flattenRows", () => {
    it("devrait aplatir les lignes avec sous-lignes", () => {
        const rows = [
            {
                id: "1",
                subRows: [{ id: "1.1", subRows: [] } as any, { id: "1.2", subRows: [] } as any]
            } as any,
            { id: "2", subRows: [] } as any
        ];

        const result = flattenRows(rows);

        expect(result).toHaveLength(4);
        expect(result.map((r: { id: any }) => r.id)).toEqual(["1", "1.1", "1.2", "2"]);
    });
});

describe("sanitize", () => {
    it("devrait retourner 'NR' pour null, undefined et -1", () => {
        expect(sanitize(null)).toBe("NR");
        expect(sanitize(undefined)).toBe("NR");
        expect(sanitize(-1)).toBe("NR");
    });

    it("devrait retourner la valeur en string pour les valeurs valides", () => {
        expect(sanitize("test")).toBe("test");
        expect(sanitize(42)).toBe("42");
        expect(sanitize(0)).toBe("0");
    });
});

describe("formatValue", () => {
    it("devrait convertir les chaînes numériques en nombres", () => {
        expect(formatValue("42")).toBe(42);
        expect(formatValue("NR")).toBe("NR");
        expect(formatValue("test")).toBe("test");
    });
});

describe("computeDetteTechniqueJours", () => {
    it("devrait convertir les minutes en jours", () => {
        expect(computeDetteTechniqueJours("420")).toBe(1);
        expect(computeDetteTechniqueJours("840")).toBe(2);
    });

    it("devrait retourner 'NR' pour des entrées invalides", () => {
        expect(computeDetteTechniqueJours("NR")).toBe("NR");
        expect(computeDetteTechniqueJours(undefined)).toBe("NR");
        expect(computeDetteTechniqueJours("0")).toBe("NR");
    });
});

describe("escapeCsvValue", () => {
    it("devrait entourer la valeur de guillemets et échapper les guillemets internes", () => {
        expect(escapeCsvValue("test")).toBe('"test"');
        expect(escapeCsvValue('say "hello"')).toBe('"say ""hello"""');
    });
});
