import { render, screen } from "@testing-library/react";
import type { QualiteIndicateur } from "models/indicateurs";
import {
    CouvertureTestUnitCell,
    DetteTechCell,
    FiabiliteCell
} from "pages/indicateurs/qualité/QualiteCell";
import type { ReactNode } from "react";
import { describe, it, expect, vi } from "vitest";

vi.mock("components/ToolTipLayout", () => ({
    ToolTipLayout: ({ title, content }: { title: string; content: ReactNode }) => (
        <div data-testid="tooltip">
            <span data-testid="tooltip-title">{title}</span>
            <span data-testid="tooltip-content">{content}</span>
        </div>
    )
}));

function makeRow(overrides: Partial<QualiteIndicateur> = {}): { original: QualiteIndicateur } {
    const base: QualiteIndicateur = {
        applicationName: "app-test",
        sndi: "sndi-test",
        domaine: "domaine-test",
        domaineFonc: "domaineFonc-test",
        lettreCouvertureTestUnitaire: "A",
        lettreFiabilite: "B",
        lettreDetteTechnique: "C",
        pourcentageCouvertureTestUnitaire: "0",
        tendanceDetteTechnique: "up",
        tendanceFiabilite: "up",
        tendanceTestUnitaire: "up",
        pourcentageCouvertureTestUnitairePast: "0",

        ...overrides
    };
    return { original: base };
}

// ─────────────────────────────────────────────
// DetteTechCell
// ─────────────────────────────────────────────
describe("DetteTechCell", () => {
    it("affiche 'NR' dans le title quand detteTechnique est undefined", () => {
        render(<DetteTechCell row={makeRow({ detteTechnique: undefined })} />);
        expect(screen.getByTestId("tooltip-title")).toHaveTextContent("Dette technique : NR");
    });

    it("affiche 'NR' dans le title quand detteTechnique vaut 'NR'", () => {
        render(<DetteTechCell row={makeRow({ detteTechnique: "NR" })} />);
        expect(screen.getByTestId("tooltip-title")).toHaveTextContent("Dette technique : NR");
    });

    it("affiche 'NR' dans le title si la valeur n'est pas un nombre valide", () => {
        render(<DetteTechCell row={makeRow({ detteTechnique: "abc" })} />);
        expect(screen.getByTestId("tooltip-title")).toHaveTextContent("Dette technique : NR");
    });

    it("convertit les minutes en jours (420 min = 1 jour)", () => {
        render(<DetteTechCell row={makeRow({ detteTechnique: "420" })} />);
        expect(screen.getByTestId("tooltip-title")).toHaveTextContent("Dette technique : 1.0 jours");
    });

    it("arrondit le nombre de jours (1000 min ≈ 2 jours)", () => {
        render(<DetteTechCell row={makeRow({ detteTechnique: "1000" })} />);
        expect(screen.getByTestId("tooltip-title")).toHaveTextContent("Dette technique : 2.4 jours");
    });

    it("gère les grandes valeurs correctement (8400 min = 20 jours)", () => {
        render(<DetteTechCell row={makeRow({ detteTechnique: "8400" })} />);
        expect(screen.getByTestId("tooltip-title")).toHaveTextContent("Dette technique : 20.0 jours");
    });
});

// ─────────────────────────────────────────────
// CouvertureTestUnitCell
// ─────────────────────────────────────────────
describe("CouvertureTestUnitCell", () => {
    it("s'affiche sans erreur", () => {
        render(<CouvertureTestUnitCell row={makeRow()} />);
        expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    });

    it("affiche le pourcentage 0 dans le title", () => {
        render(<CouvertureTestUnitCell row={makeRow({ pourcentageCouvertureTestUnitaire: "0" })} />);
        expect(screen.getByTestId("tooltip-title").textContent).toMatch(/0/);
    });

    it("affiche le pourcentage 100 dans le title", () => {
        render(<CouvertureTestUnitCell row={makeRow({ pourcentageCouvertureTestUnitaire: "100" })} />);
        expect(screen.getByTestId("tooltip-title").textContent).toMatch(/100/);
    });

    it("affiche la lettre de couverture dans le content", () => {
        render(<CouvertureTestUnitCell row={makeRow({ lettreCouvertureTestUnitaire: "B" })} />);
        expect(screen.getByTestId("tooltip-content").textContent).toMatch(/B/);
    });

    it("affiche l'icône de tendance haussière", () => {
        render(<CouvertureTestUnitCell row={makeRow({ tendanceFiabilite: "up" })} />);
        expect(document.querySelector("svg")).toBeInTheDocument();
    });

    it("affiche l'icône de tendance baissière", () => {
        render(<CouvertureTestUnitCell row={makeRow({ tendanceFiabilite: "down" })} />);
        expect(document.querySelector("svg")).toBeInTheDocument();
    });

    it("affiche l'icône stable", () => {
        render(<CouvertureTestUnitCell row={makeRow({ tendanceFiabilite: "flat" })} />);
        expect(document.querySelector("svg")).toBeInTheDocument();
    });
});

// ─────────────────────────────────────────────
// FiabiliteCell
// ─────────────────────────────────────────────
describe("FiabiliteCell", () => {
    it("s'affiche sans erreur", () => {
        render(<FiabiliteCell row={makeRow()} />);
        expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    });

    it("affiche la lettre A dans le title", () => {
        render(<FiabiliteCell row={makeRow({ lettreFiabilite: "A" })} />);
        expect(screen.getByTestId("tooltip-title").textContent).toMatch(/A/);
    });

    it("affiche la lettre  dans le content", () => {
        render(<FiabiliteCell row={makeRow({ lettreFiabilite: "B" })} />);
        expect(screen.getByTestId("tooltip-content").textContent).toMatch(/B/);
    });

    it("affiche l'icône stable", () => {
        render(<FiabiliteCell row={makeRow({ tendanceFiabilite: "flat" })} />);
        expect(document.querySelector("svg")).toBeInTheDocument();
    });
});
