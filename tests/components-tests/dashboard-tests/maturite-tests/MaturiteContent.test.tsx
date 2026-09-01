import { render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { green, red, orange } from "@mui/material/colors";
import {
    OpportuniteBlock,
    MaturiteBlock,
    DisclaimerMaturity
} from "pages/dashboards/maturité/MaturiteContent";
import type { IndicateurApplicationMaturite } from "models/indicateurs";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let mockIsDark = false;

vi.mock("@mui/material", async importOriginal => {
    const actual = await importOriginal<typeof import("@mui/material")>();
    return {
        ...actual,
        useTheme: () => ({
            palette: {
                mode: mockIsDark ? "dark" : "light",
                info: { light: "#90caf9", main: "#1976d2" },
                success: { main: green[500] },
                error: { main: red[500] },
                warning: { main: orange[500] },
                text: { secondary: "#616161" },
                grey: { 700: "#616161" },
                common: { black: "#000000", white: "#ffffff" },
                getContrastText: (color: string) => {
                    // Simple implementation for testing
                    const parseColor = (c: string) => {
                        if (c.startsWith("#")) {
                            const r = parseInt(c.slice(1, 3), 16);
                            const g = parseInt(c.slice(3, 5), 16);
                            const b = parseInt(c.slice(5, 7), 16);
                            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                            return luminance > 0.5 ? "#000000" : "#ffffff";
                        }
                        return "#000000";
                    };
                    return parseColor(color);
                }
            }
        })
    };
});

vi.mock("@mui/icons-material", async importOriginal => {
    const actual = await importOriginal<typeof import("@mui/icons-material")>();
    return {
        ...actual,
        CheckCircleIcon: () => <span>✓</span>,
        CancelIcon: () => <span>✗</span>,
        TrendingUpIcon: () => <span>↑</span>,
        TrendingFlatIcon: () => <span>→</span>,
        TrendingDownIcon: () => <span>↓</span>,
        PrecisionManufacturingIcon: () => <span>🏭</span>,
        GroupsIcon: () => <span>👥</span>,
        HelpOutlineIcon: () => <span>?</span>,
        WarningAmberRoundedIcon: () => <span>⚠️</span>
    };
});

// Base app pour les tests
const baseApp: IndicateurApplicationMaturite = {
    applicationId: 1,
    applicationName: "App Test",
    sndi: "SNDI",
    domaine: "Domaine",
    domaineFonc: "DomaineFonc",
    scoreTechnique: "0.75",
    scoreOrga: "0.6",
    scoreComplexite: "-0.3",
    scoreBenefice: "0.8",
    scoreOpportunite: "0.8",
    scoreMaturite: "0.7",
    deltaOpportunite: "0.1",
    deltaMaturite: "0.05",
    progressionDeploy: "0.5",
    progressionArchi: "0.8",
    progressionTechnos: "0.4",
    progressionCloud: "0.9",
    progressionDevops: "0.2",
    progressionMateqip: "0.7"
};

// ---------------------------------------------------------------------------
// OpportuniteBlock
// ---------------------------------------------------------------------------

describe("OpportuniteBlock", () => {
    it("devrait afficher null quand selectedApp est null", () => {
        // Le composant retourne null quand selectedApp est null
        // On ne peut pas utiliser render() directement car ça causerait une erreur de hook
        // On teste juste le comportement visuel via render
        const { container } = render(<OpportuniteBlock selectedApp={null} />);
        expect(container).toBeEmptyDOMElement();
    });

    it("devrait afficher le titre Opportunité dans le chip", () => {
        render(<OpportuniteBlock selectedApp={baseApp} />);
        // Le chip affiche "Opportunité forte" car scoreOpportunite = 0.8 > 0.7
        expect(screen.getByText(/Opportunité forte/i)).toBeInTheDocument();
    });

    it("devrait afficher le score d'opportunité", () => {
        render(<OpportuniteBlock selectedApp={baseApp} />);
        // scoreOpportunite 0.8 → 80%
        expect(screen.getByText("80 %")).toBeInTheDocument();
    });

    it("devrait afficher la balance complexité/bénéfice", () => {
        render(<OpportuniteBlock selectedApp={baseApp} />);
        // complexite -0.3 → magnitude 0.3 → "-0.30"
        expect(screen.getByText("-0.30")).toBeInTheDocument();
        // benefice 0.8 → "+0.80"
        expect(screen.getByText("+0.80")).toBeInTheDocument();
    });

    it("devrait afficher le conseil", () => {
        render(<OpportuniteBlock selectedApp={baseApp} />);
        expect(screen.getByText(/Conseil/i)).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// MaturiteBlock
// ---------------------------------------------------------------------------

describe("MaturiteBlock", () => {
    it("devrait afficher null quand selectedApp est null", () => {
        const { container } = render(<MaturiteBlock selectedApp={null} />);
        expect(container).toBeEmptyDOMElement();
    });

    it("devrait afficher le titre Maturité cloud", () => {
        render(<MaturiteBlock selectedApp={baseApp} />);
        expect(screen.getByText(/Maturité cloud/i)).toBeInTheDocument();
    });

    it("devrait afficher le score de maturité", () => {
        render(<MaturiteBlock selectedApp={baseApp} />);
        // scoreMaturite 0.7 → 70%
        expect(screen.getByText("70 %")).toBeInTheDocument();
    });

    it("devrait afficher les sous-scores technique et organisationnelle", () => {
        render(<MaturiteBlock selectedApp={baseApp} />);
        // scoreTechnique 0.75 → 75%
        expect(screen.getByText("75 %")).toBeInTheDocument();
        // scoreOrga 0.6 → 60%
        expect(screen.getByText("60 %")).toBeInTheDocument();
        expect(screen.getByText(/Maturité technique/i)).toBeInTheDocument();
        expect(screen.getByText(/Maturité organisationnelle/i)).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// DisclaimerMaturity
// ---------------------------------------------------------------------------

describe("DisclaimerMaturity", () => {
    afterEach(() => {
        mockIsDark = false;
    });

    it("affiche le texte d'avertissement en mode clair", () => {
        mockIsDark = false;
        render(<DisclaimerMaturity />);
        expect(screen.getByText(/questionnaire auto-administré/i)).toBeInTheDocument();
        expect(screen.getByText(/février 2026/i)).toBeInTheDocument();
    });

    it("rend l'icône d'avertissement", () => {
        mockIsDark = false;
        render(<DisclaimerMaturity />);
        expect(screen.getByTitle("Avertissement")).toBeInTheDocument();
    });

    it("rend correctement en mode sombre", () => {
        mockIsDark = true;
        render(<DisclaimerMaturity />);
        expect(screen.getByText(/questionnaire auto-administré/i)).toBeInTheDocument();
        expect(screen.getByTitle("Avertissement")).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// Intégration des composants avec normalizeMaturite
// ---------------------------------------------------------------------------

describe("Intégration avec normalizeMaturite", () => {
    it("devrait gérer les valeurs normalisées correctement", () => {
        render(<OpportuniteBlock selectedApp={baseApp} />);
        render(<MaturiteBlock selectedApp={baseApp} />);
        
        // Vérification que les pourcentages sont correctement affichés
        expect(screen.getAllByText(/%/)).toHaveLength(4);
    });

    it("devrait gérer selectedApp null dans tous les composants", () => {
        const { container: container1 } = render(<OpportuniteBlock selectedApp={null} />);
        const { container: container2 } = render(<MaturiteBlock selectedApp={null} />);
        
        expect(container1).toBeEmptyDOMElement();
        expect(container2).toBeEmptyDOMElement();
    });
});
