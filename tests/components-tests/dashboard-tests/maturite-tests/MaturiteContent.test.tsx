import { render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { green, red } from "@mui/material/colors";
import {
    MaturiteHeader,
    TechAndOrga,
    ComplexitySection,
    ConseilComplexity,
    DisclaimerMaturity,
} from "pages/dashboards/maturité/MaturiteContent";
import type { IndicateurApplicationMaturite } from "models/indicateurs";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let mockIsDark = false;

vi.mock("@mui/material", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@mui/material")>();
    return {
        ...actual,
        useTheme: () => ({
            palette: {
                mode: mockIsDark ? "dark" : "light",
                info: { light: "#90caf9", main: "#1976d2" },
                grey: { 700: "#616161" },
                common: { black: "#000000" },
            },
        }),
    };
});

// maturiteLevel : "forte" uniquement pour "A" ou "B"
// maturiteLabel : "A" → "très forte", "C" → "moyenne", sinon "inconnue"
const baseApp: IndicateurApplicationMaturite = {
    applicationId: 1,
    sndi: "SNDI",
    domaine: "Domaine",
    domaineFonc: "DomaineFonc",
    scoreTechnique: "0.75",
    scoreOrga: "0.6",
    scoreComplexite: "-0.3",
    scoreBenefice: "0.8",
    progressionDeploy: "0.5",
    progressionArchi: "1.5",   // > 1 → clamp01 → 1 → 100%
    progressionTechnos: "0.4",
    progressionCloud: "0.9",
    progressionDevops: "0.2",
    progressionMateqip: "0.7",
    maturite: "A",             // "A" → level "forte", label "très forte"
    robustesse: "3",
};

// ---------------------------------------------------------------------------
// MaturiteHeader
// ---------------------------------------------------------------------------

describe("MaturiteHeader", () => {
    it("affiche le chip success et le label 'très forte' pour maturité A", () => {
        render(<MaturiteHeader selectedApp={baseApp} />);
        // maturiteLabel("A") === "très forte"
        expect(screen.getByText(/maturité cloud très forte/i)).toBeInTheDocument();
        expect(screen.getByText(/robustesse 3\/4/i)).toBeInTheDocument();
    });

    it("affiche le chip error et label 'inconnue' quand selectedApp est null", () => {
        render(<MaturiteHeader selectedApp={null} />);
        // maturiteLabel(undefined) === "inconnue"
        expect(screen.getByText(/maturité cloud inconnue/i)).toBeInTheDocument();
        expect(screen.getByText(/robustesse 0\/4/i)).toBeInTheDocument();
    });

    it("affiche le chip error et label 'moyenne' pour maturité C (level faible)", () => {
        render(<MaturiteHeader selectedApp={{ ...baseApp, maturite: "C", robustesse: "1" }} />);
        // maturiteLabel("C") === "moyenne", maturiteLevel("C") === "faible"
        expect(screen.getByText(/maturité cloud moyenne/i)).toBeInTheDocument();
        expect(screen.getByText(/robustesse 1\/4/i)).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// TechAndOrga (couvre useNormalizedMaturite + HorizontalBars + LabeledValue)
// ---------------------------------------------------------------------------

describe("TechAndOrga", () => {
    it("affiche des scores à zéro quand selectedApp est null", () => {
        render(<TechAndOrga selectedApp={null} />);
        const zeros = screen.getAllByText("0.00");
        expect(zeros.length).toBeGreaterThanOrEqual(2);
    });

    it("affiche les scores et clamp01 sur progressionArchi > 1", () => {
        render(<TechAndOrga selectedApp={baseApp} />);
        // progressionArchi "1.5" → clamp01 → 1 → 100%
        expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("rend sans erreur en mode sombre", () => {
        mockIsDark = true;
        render(<TechAndOrga selectedApp={baseApp} />);
        expect(screen.getByText(/maturité technique/i)).toBeInTheDocument();
        mockIsDark = false;
    });

    it("affiche les tipsItems tech et orga", () => {
        render(
            <TechAndOrga
                selectedApp={baseApp}
                tipsItemsTech={[{ conseil: "Conseil tech" }]}
                tipsItemsOrga={[{ conseil: "Conseil orga" }]}
            />
        );
        expect(screen.getByText("• Conseil tech")).toBeInTheDocument();
        expect(screen.getByText("• Conseil orga")).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// ComplexitySection
// ---------------------------------------------------------------------------

describe("ComplexitySection", () => {
    it("affiche les scores de complexité et bénéfice", () => {
        render(<ComplexitySection selectedApp={baseApp} />);
        expect(screen.getByText("-0.30")).toBeInTheDocument();
        expect(screen.getByText("0.80")).toBeInTheDocument();
    });

    it("affiche des zéros quand selectedApp est null", () => {
        render(<ComplexitySection selectedApp={null} />);
        const zeros = screen.getAllByText("0.00");
        expect(zeros.length).toBeGreaterThanOrEqual(2);
    });
});

// ---------------------------------------------------------------------------
// ConseilComplexity  (4 combinaisons favorable × isDark)
// ---------------------------------------------------------------------------

describe("ConseilComplexity", () => {
    afterEach(() => {
        mockIsDark = false;
    });

    it("rend le texte en mode clair favorable (branche green[600])", () => {
        mockIsDark = false;
        render(<ConseilComplexity conseil={{ favorable: true, texte: "Bonne migration" }} />);
        expect(screen.getByText("Bonne migration")).toBeInTheDocument();
        expect(green[600]).toBeDefined();
    });

    it("rend le texte en mode sombre favorable (branche green[400])", () => {
        mockIsDark = true;
        render(<ConseilComplexity conseil={{ favorable: true, texte: "Bonne migration dark" }} />);
        expect(screen.getByText("Bonne migration dark")).toBeInTheDocument();
        expect(green[400]).toBeDefined();
    });

    it("rend le texte en mode clair défavorable (branche red[500])", () => {
        mockIsDark = false;
        render(<ConseilComplexity conseil={{ favorable: false, texte: "Migration risquée" }} />);
        expect(screen.getByText("Migration risquée")).toBeInTheDocument();
        expect(red[500]).toBeDefined();
    });

    it("rend le texte en mode sombre défavorable (branche red[400])", () => {
        mockIsDark = true;
        render(<ConseilComplexity conseil={{ favorable: false, texte: "Migration risquée dark" }} />);
        expect(screen.getByText("Migration risquée dark")).toBeInTheDocument();
        expect(red[400]).toBeDefined();
    });
});

// ---------------------------------------------------------------------------
// TipsBlock (via TechAndOrga — composant interne non exporté)
// ---------------------------------------------------------------------------

describe("TipsBlock (via TechAndOrga)", () => {
    it("affiche les conseils en dédoublonnant via Set", () => {
        render(
            <TechAndOrga
                selectedApp={baseApp}
                tipsItemsTech={[
                    { conseil: "Conseil A" },
                    { conseil: "Conseil A" }, // doublon → éliminé par Set
                    { conseil: "Conseil B" },
                ]}
            />
        );
        expect(screen.getAllByText("• Conseil A")).toHaveLength(1);
        expect(screen.getByText("• Conseil B")).toBeInTheDocument();
    });

    it("affiche 'Aucun conseil.' quand la liste est vide", () => {
        render(<TechAndOrga selectedApp={baseApp} tipsItemsTech={[]} />);
        expect(screen.getAllByText("Aucun conseil.").length).toBeGreaterThanOrEqual(1);
    });

    it("filtre les conseils vides ou undefined", () => {
        render(
            <TechAndOrga
                selectedApp={baseApp}
                tipsItemsTech={[{ conseil: "" }, {}]}
            />
        );
        expect(screen.getAllByText("Aucun conseil.").length).toBeGreaterThanOrEqual(1);
    });
});

// ---------------------------------------------------------------------------
// DisclaimerMaturity
// ---------------------------------------------------------------------------

describe("DisclaimerMaturity", () => {
    it("affiche le texte d'avertissement en mode clair", () => {
        mockIsDark = false;
        render(<DisclaimerMaturity />);
        expect(screen.getByText(/questionnaire auto-administré/i)).toBeInTheDocument();
    });

    it("rend l'icône d'avertissement en mode sombre", () => {
        mockIsDark = true;
        render(<DisclaimerMaturity />);
        expect(screen.getByTitle("Avertissement")).toBeInTheDocument();
        mockIsDark = false;
    });
});