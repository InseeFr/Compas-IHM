/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
    RenderModuleSelection,
    RenderStrategieCloudSelection,
    RenderEnvCibleSelection
} from "pages/saisies/strategiecloud/strategieCloudFormCell";
import type { ModsIndicateur } from "models/indicateurs";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeField(value: unknown, onChange = vi.fn()) {
    return {
        field: {
            value,
            onChange,
            onBlur: vi.fn(),
            name: "idsModule" as const,
            ref: vi.fn()
        },
        fieldState: { invalid: false, isTouched: false, isDirty: false, error: undefined },
        formState: {} as any
    };
}

const mockModules: ModsIndicateur[] = [
    { id: 1, modName: "Module Alpha", appName: "AppA", domaine: "DOM", domaineFonc: "FONC", sndi: "S1" },
    { id: 2, modName: "Module Beta", appName: "AppB", domaine: "DOM", domaineFonc: "FONC", sndi: "S2" },
    { id: 3, modName: "Module Gamma", appName: "AppC", domaine: "DOM", domaineFonc: "FONC", sndi: "S3" },
    {
        id: undefined,
        modName: "Module Sans ID",
        appName: "AppD",
        domaine: "DOM",
        domaineFonc: "FONC",
        sndi: "S4"
    }
];

// ─── RenderModuleSelection ─────────────────────────────────────────────────────
describe("RenderModuleSelection", () => {
    it("affiche le select des modules", () => {
        const field = makeField([]);
        render(<ModuleWrapper field={field} modules={mockModules} />);
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("filtre les modules sans id", async () => {
        const field = makeField([]);
        render(<ModuleWrapper field={field} modules={mockModules} />);
        fireEvent.mouseDown(screen.getByRole("combobox"));
        expect(screen.queryByText(/Module Sans ID/)).not.toBeInTheDocument();
    });

    it("affiche les chips des modules déjà sélectionnés", () => {
        const field = makeField([1, 2]);
        render(<ModuleWrapper field={field} modules={mockModules} />);
        expect(screen.getByText("AppA / Module Alpha")).toBeInTheDocument();
        expect(screen.getByText("AppB / Module Beta")).toBeInTheDocument();
    });

    it("affiche l'option Tout sélectionner", () => {
        const field = makeField([]);
        render(<ModuleWrapper field={field} modules={mockModules} />);
        fireEvent.mouseDown(screen.getByRole("combobox"));
        expect(screen.getByText("Tout sélectionner")).toBeInTheDocument();
    });

    it("sélectionne tous les modules via Tout sélectionner", () => {
        const onChange = vi.fn();
        const field = makeField([], onChange);
        render(<ModuleWrapper field={field} modules={mockModules} />);
        fireEvent.mouseDown(screen.getByRole("combobox"));
        fireEvent.click(screen.getByText("Tout sélectionner"));
        expect(onChange).toHaveBeenCalledWith([1, 2, 3]);
    });

    it("désélectionne tous les modules si tous déjà sélectionnés", () => {
        const onChange = vi.fn();
        const field = makeField([1, 2, 3], onChange);
        render(<ModuleWrapper field={field} modules={mockModules} />);
        fireEvent.mouseDown(screen.getByRole("combobox"));
        fireEvent.click(screen.getByText("Tout sélectionner"));
        expect(onChange).toHaveBeenCalledWith([]);
    });

    it("appelle onChange avec l'id lors d'une sélection", () => {
        const onChange = vi.fn();
        const field = makeField([], onChange);
        render(<ModuleWrapper field={field} modules={mockModules} />);
        fireEvent.mouseDown(screen.getByRole("combobox"));
        fireEvent.click(screen.getByText("AppA / Module Alpha"));
        expect(onChange).toHaveBeenCalledWith([1]);
    });

    it("affiche les groupes par appName", () => {
        const field = makeField([]);
        render(<ModuleWrapper field={field} modules={mockModules} />);
        fireEvent.mouseDown(screen.getByRole("combobox"));
        expect(screen.getByText("AppA")).toBeInTheDocument();
        expect(screen.getByText("AppB")).toBeInTheDocument();
        expect(screen.getByText("AppC")).toBeInTheDocument();
    });

    it("coche la checkbox du module sélectionné", () => {
        const field = makeField([1]);
        render(<ModuleWrapper field={field} modules={mockModules} />);
        fireEvent.mouseDown(screen.getByRole("combobox"));
        const checkboxes = screen.getAllByRole("checkbox");
        // index 0 = Tout sélectionner (indeterminate), index 1 = Module Alpha
        expect(checkboxes[1]).toBeChecked();
        expect(checkboxes[2]).not.toBeChecked();
    });

    it("checkbox Tout sélectionner est indeterminate si sélection partielle", () => {
        const field = makeField([1]);
        render(<ModuleWrapper field={field} modules={mockModules} />);
        fireEvent.mouseDown(screen.getByRole("combobox"));
        const selectAll = screen.getAllByRole("checkbox")[0];
        expect(selectAll).toHaveAttribute("data-indeterminate", "true");
    });

    it("gère une valeur non-tableau gracieusement", () => {
        const field = makeField(undefined);
        expect(() => render(<ModuleWrapper field={field} modules={mockModules} />)).not.toThrow();
    });
});

// ─── Wrappers (nécessaires à cause du React Compiler qui injecte des hooks) ────

function StrategieWrapper({ field }: { field: any }) {
    return RenderStrategieCloudSelection(field);
}

function EnvCibleWrapper({ field }: { field: any }) {
    return RenderEnvCibleSelection(field);
}

function ModuleWrapper({ field, modules }: { field: any; modules: ModsIndicateur[] }) {
    return RenderModuleSelection(field, modules);
}

// ─── RenderStrategieCloudSelection ────────────────────────────────────────────

describe("RenderStrategieCloudSelection", () => {
    it("affiche les 3 options de stratégie", () => {
        const field = makeField("");
        render(<StrategieWrapper field={field} />);
        expect(screen.getByLabelText("À instruire")).toBeInTheDocument();
        expect(screen.getByLabelText("En cours")).toBeInTheDocument();
        expect(screen.getByLabelText("Validée")).toBeInTheDocument();
    });

    it("coche le bon radio selon la valeur", () => {
        const field = makeField("En cours");
        render(<StrategieWrapper field={field} />);
        expect(screen.getByDisplayValue("En cours")).toBeChecked();
        expect(screen.getByDisplayValue("Validée")).not.toBeChecked();
    });

    it("appelle onChange lors d'un clic", () => {
        const onChange = vi.fn();
        const field = makeField("", onChange);
        render(<StrategieWrapper field={field} />);
        fireEvent.click(screen.getByLabelText("Validée"));
        expect(onChange).toHaveBeenCalledWith("Validée");
    });

    it("radio 'À instruire' a la valeur correcte", () => {
        const field = makeField("A instruire");
        render(<StrategieWrapper field={field} />);
        expect(screen.getByDisplayValue("A instruire")).toBeChecked();
    });
});

// ─── RenderEnvCibleSelection ───────────────────────────────────────────────────

describe("RenderEnvCibleSelection", () => {
    it("affiche les 4 options d'environnement cible", () => {
        const field = makeField("");
        render(<EnvCibleWrapper field={field} />);
        expect(screen.getByLabelText("Kube")).toBeInTheDocument();
        expect(screen.getByLabelText("Cloud externe")).toBeInTheDocument();
        expect(screen.getByLabelText("VM")).toBeInTheDocument();
        expect(screen.getByLabelText("Autre")).toBeInTheDocument();
    });

    it("coche le bon radio selon la valeur", () => {
        const field = makeField("VM");
        render(<EnvCibleWrapper field={field} />);
        expect(screen.getByDisplayValue("VM")).toBeChecked();
        expect(screen.getByDisplayValue("Kube")).not.toBeChecked();
    });

    it("appelle onChange lors d'un clic sur 'Kube'", () => {
        const onChange = vi.fn();
        const field = makeField("", onChange);
        render(<EnvCibleWrapper field={field} />);
        fireEvent.click(screen.getByLabelText("Kube"));
        expect(onChange).toHaveBeenCalledWith("Kube");
    });

    it("appelle onChange avec 'cloud externe' pour Cloud externe", () => {
        const onChange = vi.fn();
        const field = makeField("", onChange);
        render(<EnvCibleWrapper field={field} />);
        fireEvent.click(screen.getByLabelText("Cloud externe"));
        expect(onChange).toHaveBeenCalledWith("cloud externe");
    });

    it("appelle onChange avec 'Autre'", () => {
        const onChange = vi.fn();
        const field = makeField("", onChange);
        render(<EnvCibleWrapper field={field} />);
        fireEvent.click(screen.getByLabelText("Autre"));
        expect(onChange).toHaveBeenCalledWith("Autre");
    });
});
