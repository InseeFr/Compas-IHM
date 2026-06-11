import { describe, it, expect } from "vitest";
import { buildInfraColumns } from "utils/greenit-type";

describe("greenit-type", () => {
    describe("buildInfraColumns", () => {
        it("retourne les colonnes de base pour tous les infras", () => {
            const columns = buildInfraColumns("global", "ALL");

            expect(columns.length).toBeGreaterThan(0);
            expect(columns[0].accessorKey).toBe("applicationName");
        });

        it("retourne les colonnes VM pour infraType VM en mode global", () => {
            const columns = buildInfraColumns("global", "VM");
            const accessorKeys = columns.map(col => col.accessorKey);

            expect(accessorKeys).toContain("_nbVmSort");
            expect(accessorKeys).toContain("_cpuSort");
        });

        it("retourne les colonnes Kube pour infraType KUB en mode global", () => {
            const columns = buildInfraColumns("global", "KUB");
            const accessorKeys = columns.map(col => col.accessorKey);

            expect(accessorKeys).toContain("_cpuUsedSort");
            expect(accessorKeys).toContain("_nbPodMaxiSort");
        });

        it("filtre correctement les colonnes selon l'infraType", () => {
            const allColumns = buildInfraColumns("global", "ALL");
            const vmColumns = buildInfraColumns("global", "VM");
            const kubColumns = buildInfraColumns("global", "KUB");

            // ALL doit avoir plus de colonnes que VM ou KUB seul
            expect(allColumns.length).toBeGreaterThan(vmColumns.length);
            expect(allColumns.length).toBeGreaterThan(kubColumns.length);
        });
    });
});
