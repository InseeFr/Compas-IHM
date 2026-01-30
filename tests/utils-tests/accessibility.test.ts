import type { MRT_Cell, MRT_Row } from "material-react-table";
import type { DevopsIndicateur } from "models/indicateurs";
import { generateAriaLabelCell, muiAriaCell } from "utils/accessibility-functions";

describe("Generation d'aria label pour les lignes des tableaux", () => {
    it("générer Module", () => {
        expect(generateAriaLabelCell("N'importe", "Mod1", "Mod1", true)).toEqual("Module: Mod1");
    });
    it("générer App", () => {
        expect(generateAriaLabelCell("N'importe", "App1", "App1", false)).toEqual("Application: App1");
    });
    it("générer une colonne avec un titre pour une appli", () => {
        expect(generateAriaLabelCell("N'importe", "App1", "4", false)).toEqual(
            "N'importe de l'application App1 : 4"
        );
    });
    it("générer une colonne avec un titre pour un module", () => {
        expect(generateAriaLabelCell("N'importe", "Mod1", "4", true)).toEqual(
            "N'importe du module Mod1 : 4"
        );
    });
});

describe("Retourner un mui pour les cellules", () => {
    it("Retourne le muiAriaCell pour une app", () => {
        const cell = {
            getValue: () => "4"
        } as unknown as MRT_Cell<DevopsIndicateur, unknown>;

        const row = {
            original: {
                applicationName: "App1",
                isModule: false
            }
        } as unknown as MRT_Row<DevopsIndicateur>;
        expect(muiAriaCell({ title: "Test", cell: cell, row: row })).toEqual({
            "aria-label": generateAriaLabelCell("Test", "App1", "4", false)
        });
    });
    it("Retourne le muiAriaCell pour un module", () => {
        const cell = {
            getValue: () => "4"
        } as unknown as MRT_Cell<DevopsIndicateur, unknown>;

        const row = {
            original: {
                applicationName: "Mod1",
                isModule: true
            }
        } as unknown as MRT_Row<DevopsIndicateur>;
        expect(muiAriaCell({ title: "Test", cell: cell, row: row })).toEqual({
            "aria-label": generateAriaLabelCell("Test", "Mod1", "4", true)
        });
    });
});
