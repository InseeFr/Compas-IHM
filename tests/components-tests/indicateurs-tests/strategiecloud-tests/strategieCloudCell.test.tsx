import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
    TauxCloudCell,
    EnvActuelCell,
    EnvCibleCell,
    EcartCibleCell,
    StrategieCloudCell,
    CommentaireCell,
    MaturiteCloudCell
} from "pages/indicateurs/strategiecloud/strategieCloudCell";

vi.mock("components/ToolTipLayout", () => ({
    ToolTipLayout: ({ title, content }: { title: string; content: string }) => (
        <div data-testid="tooltip-layout" data-title={title}>
            {content}
        </div>
    )
}));

const makeRow = (original: object) => ({ original }) as never;

// ─── TauxCloudCell ────────────────────────────────────────────────────────────

describe("TauxCloudCell", () => {
    it('affiche "Non renseigné" en tooltip si tauxCloud vaut "NR"', () => {
        render(<TauxCloudCell row={makeRow({ tauxCloud: "NR" })} />);
        const el = screen.getByTestId("tooltip-layout");
        expect(el).toHaveAttribute("data-title", "Non renseigné");
        expect(el).toHaveTextContent("NR");
    });

    it('affiche "Sans objet" en tooltip si tauxCloud vaut "SO"', () => {
        render(<TauxCloudCell row={makeRow({ tauxCloud: "SO" })} />);
        expect(screen.getByTestId("tooltip-layout")).toHaveAttribute("data-title", "Sans objet");
    });

    it("affiche le taux dans le tooltip pour une valeur numérique", () => {
        render(<TauxCloudCell row={makeRow({ tauxCloud: "42%" })} />);
        const el = screen.getByTestId("tooltip-layout");
        expect(el).toHaveAttribute("data-title", "Taux cloud : 42%");
        expect(el).toHaveTextContent("42%");
    });
});

// ─── EnvActuelCell ────────────────────────────────────────────────────────────

describe("EnvActuelCell", () => {
    const cases: [string, string][] = [
        ["NR", "Non renseigné"],
        ["SO", "Sans objet"],
        ["VM", "Machine Virtuelle"],
        ["Kube", "Kubernetes"],
        ["Autre", "Autre environnement"]
    ];

    it.each(cases)('tooltip de envActuelProd="%s" → "%s"', (value, expectedTooltip) => {
        render(<EnvActuelCell row={makeRow({ envActuelProd: value })} />);
        expect(screen.getByTestId("tooltip-layout")).toHaveAttribute("data-title", expectedTooltip);
    });

    it("affiche la valeur brute si non reconnue", () => {
        render(<EnvActuelCell row={makeRow({ envActuelProd: "On-premise" })} />);
        const el = screen.getByTestId("tooltip-layout");
        expect(el).toHaveAttribute("data-title", "On-premise");
        expect(el).toHaveTextContent("On-premise");
    });
});

// ─── EnvCibleCell ─────────────────────────────────────────────────────────────

describe("EnvCibleCell", () => {
    it('affiche "Kubernetes" pour "Kube"', () => {
        render(<EnvCibleCell row={makeRow({ envCibleProd: "Kube" })} />);
        expect(screen.getByTestId("tooltip-layout")).toHaveAttribute("data-title", "Kubernetes");
    });

    it('affiche "Machine Virtuelle" pour "VM"', () => {
        render(<EnvCibleCell row={makeRow({ envCibleProd: "VM" })} />);
        expect(screen.getByTestId("tooltip-layout")).toHaveAttribute("data-title", "Machine Virtuelle");
    });

    it("affiche la valeur brute si inconnue", () => {
        render(<EnvCibleCell row={makeRow({ envCibleProd: "Docker" })} />);
        expect(screen.getByTestId("tooltip-layout")).toHaveAttribute("data-title", "Docker");
    });
});

// ─── EcartCibleCell ───────────────────────────────────────────────────────────

describe("EcartCibleCell", () => {
    it('affiche "Non renseigné" pour "NR"', () => {
        render(<EcartCibleCell row={makeRow({ ecartCible: "NR" })} />);
        expect(screen.getByTestId("tooltip-layout")).toHaveAttribute("data-title", "Non renseigné");
    });

    it('affiche "Sans objet" pour "SO"', () => {
        render(<EcartCibleCell row={makeRow({ ecartCible: "SO" })} />);
        expect(screen.getByTestId("tooltip-layout")).toHaveAttribute("data-title", "Sans objet");
    });

    it('affiche le tooltip "Écart détecté" pour "oui"', () => {
        render(<EcartCibleCell row={makeRow({ ecartCible: "oui" })} />);
        expect(screen.getByTestId("tooltip-layout")).toHaveAttribute(
            "data-title",
            "Écart détecté entre l'environnement actuel et la cible"
        );
    });

    it('affiche le tooltip "Aucun écart" pour "non"', () => {
        render(<EcartCibleCell row={makeRow({ ecartCible: "non" })} />);
        expect(screen.getByTestId("tooltip-layout")).toHaveAttribute(
            "data-title",
            "Aucun écart entre l'environnement actuel et la cible"
        );
    });

    it("affiche la valeur brute si non reconnue", () => {
        render(<EcartCibleCell row={makeRow({ ecartCible: "partiel" })} />);
        expect(screen.getByTestId("tooltip-layout")).toHaveAttribute("data-title", "partiel");
    });
});

// ─── StrategieCloudCell ───────────────────────────────────────────────────────

describe("StrategieCloudCell", () => {
    it('affiche "Non renseigné" pour "NR"', () => {
        render(<StrategieCloudCell row={makeRow({ stratCloud: "NR" })} />);
        expect(screen.getByTestId("tooltip-layout")).toHaveAttribute("data-title", "Non renseigné");
    });

    it('affiche "Sans objet" pour "SO"', () => {
        render(<StrategieCloudCell row={makeRow({ stratCloud: "SO" })} />);
        expect(screen.getByTestId("tooltip-layout")).toHaveAttribute("data-title", "Sans objet");
    });

    it("affiche la valeur brute comme tooltip pour toute autre valeur", () => {
        render(<StrategieCloudCell row={makeRow({ stratCloud: "Cloud natif" })} />);
        const el = screen.getByTestId("tooltip-layout");
        expect(el).toHaveAttribute("data-title", "Cloud natif");
        expect(el).toHaveTextContent("Cloud natif");
    });
});

// ─── CommentaireCell ──────────────────────────────────────────────────────────

describe("CommentaireCell", () => {
    it('affiche "Non renseigné" pour "NR"', () => {
        render(<CommentaireCell row={makeRow({ commentaire: "NR" })} />);
        expect(screen.getByTestId("tooltip-layout")).toHaveAttribute("data-title", "Non renseigné");
    });

    it('affiche "Sans objet" pour "SO"', () => {
        render(<CommentaireCell row={makeRow({ commentaire: "SO" })} />);
        expect(screen.getByTestId("tooltip-layout")).toHaveAttribute("data-title", "Sans objet");
    });

    it("utilise le commentaire comme title et content pour toute autre valeur", () => {
        const texte = "Migration prévue en Q3 2025";
        render(<CommentaireCell row={makeRow({ commentaire: texte })} />);
        const el = screen.getByTestId("tooltip-layout");
        expect(el).toHaveAttribute("data-title", texte);
        expect(el).toHaveTextContent(texte);
    });
});

// ─── MaturiteCloudCell ────────────────────────────────────────────────────────

describe("MaturiteCloudCell", () => {
    it('affiche "Non renseigné" pour "NR"', () => {
        render(<MaturiteCloudCell row={makeRow({ maturiteCloud: "NR" })} />);
        expect(screen.getByTestId("tooltip-layout")).toHaveAttribute("data-title", "Non renseigné");
    });

    it('affiche "Sans objet" pour "SO"', () => {
        render(<MaturiteCloudCell row={makeRow({ maturiteCloud: "SO" })} />);
        expect(screen.getByTestId("tooltip-layout")).toHaveAttribute("data-title", "Sans objet");
    });

    it("affiche le niveau dans le tooltip pour toute autre valeur", () => {
        render(<MaturiteCloudCell row={makeRow({ maturiteCloud: "3" })} />);
        const el = screen.getByTestId("tooltip-layout");
        expect(el).toHaveAttribute("data-title", "Maturité Cloud : 3");
        expect(el).toHaveTextContent("3");
    });
});
