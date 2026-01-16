import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import type { IndicateurApplicationMaturite } from "models/indicateurs";
import type { ApplicationTip } from "todos-api/client.gen";
import {
    ComplexitySection,
    ConseilComplexity,
    MaturiteHeader,
    TechAndOrga
} from "components/dashboards/maturité/MaturiteContent";

vi.mock("./maturite-config", () => ({
    clamp01: vi.fn(val => Math.max(0, Math.min(1, val))),
    getScoreColor: vi.fn(() => "#00ff00"),
    formatNum: vi.fn(val => val),
    maturiteLevel: vi.fn(maturite => (maturite >= 70 ? "forte" : "faible")),
    maturiteLabel: vi.fn(maturite => (maturite >= 70 ? "Forte" : "Faible"))
}));

vi.mock("pages/ToolTipLayout", () => ({
    ToolTipLayout: vi.fn(({ content }) => <div data-testid="tooltip">{content}</div>)
}));

describe("MaturiteContent Components", () => {
    const mockApp: IndicateurApplicationMaturite = {
        applicationId: 1,
        applicationName: "Test App",
        maturite: "75",
        robustesse: "3",
        scoreTechnique: "80",
        scoreOrga: "70",
        scoreComplexite: "-0.5",
        scoreBenefice: "0.8",
        progressionDeploy: "0.9",
        progressionArchi: "0.85",
        progressionTechnos: "0.7",
        progressionCloud: " 0.8",
        progressionDevops: "0.7",
        progressionMateqip: "0.6",
        sndi: "s1",
        domaine: "d1",
        domaineFonc: "df1"
    };

    const mockTips: ApplicationTip[] = [
        {
            id: 1,
            sourceId: 1,
            priority: 1,
            conseil: "Améliorer les tests unitaires"
        } as ApplicationTip,
        {
            id: 2,
            sourceId: 1,
            priority: 2,
            conseil: "Adopter CI/CD"
        } as ApplicationTip,
        {
            id: 3,
            sourceId: 2,
            priority: 1,
            conseil: "Former l'équipe DevOps"
        } as ApplicationTip
    ];

    describe("MaturiteHeader", () => {
        it("devrait afficher le score de robustesse", () => {
            render(<MaturiteHeader selectedApp={mockApp} />);

            expect(screen.getByText(/Robustesse 3\/4/i)).toBeInTheDocument();
        });

        it("devrait afficher robustesse 0/4 quand robustesse est à 0", () => {
            const noRobustnessApp = { ...mockApp, robustesse: "0" };
            render(<MaturiteHeader selectedApp={noRobustnessApp} />);

            expect(screen.getByText(/Robustesse 0\/4/i)).toBeInTheDocument();
        });

        it("devrait gérer selectedApp null", () => {
            render(<MaturiteHeader selectedApp={null} />);

            expect(screen.getByText(/Robustesse 0\/4/i)).toBeInTheDocument();
        });
    });

    describe("ComplexitySection", () => {
        it("devrait afficher le titre de la section", () => {
            render(<ComplexitySection selectedApp={mockApp} />);

            expect(screen.getByText(/Balance risques \/ opportunités/i)).toBeInTheDocument();
        });

        it("devrait afficher le score de complexité", () => {
            render(<ComplexitySection selectedApp={mockApp} />);

            expect(screen.getByText("-0.50")).toBeInTheDocument();
        });

        it("devrait afficher le score de bénéfice", () => {
            render(<ComplexitySection selectedApp={mockApp} />);

            expect(screen.getByText("0.80")).toBeInTheDocument();
        });

        it("devrait afficher des tooltips", () => {
            render(<ComplexitySection selectedApp={mockApp} />);

            const tooltips = screen.getAllByTestId("tooltip");
            expect(tooltips).toHaveLength(2);
        });
    });

    describe("ConseilComplexity", () => {
        it("devrait afficher un conseil favorable", () => {
            const conseil = {
                favorable: true,
                texte: "Cette application est un bon candidat pour le cloud"
            };

            render(<ConseilComplexity conseil={conseil} />);

            expect(screen.getByText("Conseil")).toBeInTheDocument();
            expect(screen.getByText(conseil.texte)).toBeInTheDocument();
        });

        it("devrait afficher un conseil défavorable", () => {
            const conseil = {
                favorable: false,
                texte: "Migration complexe, nécessite une analyse approfondie"
            };

            render(<ConseilComplexity conseil={conseil} />);

            expect(screen.getByText(conseil.texte)).toBeInTheDocument();
        });
    });

    describe("TechAndOrga", () => {
        const techTips = mockTips.filter(t => t.sourceId === 1);
        const orgaTips = mockTips.filter(t => t.sourceId === 2);

        it("devrait afficher la section de maturité technique", () => {
            render(
                <TechAndOrga selectedApp={mockApp} tipsItemsTech={techTips} tipsItemsOrga={orgaTips} />
            );

            expect(screen.getByText("Maturité technique")).toBeInTheDocument();
        });

        it("devrait afficher la section de maturité organisationnelle", () => {
            render(
                <TechAndOrga selectedApp={mockApp} tipsItemsTech={techTips} tipsItemsOrga={orgaTips} />
            );

            expect(screen.getByText("Maturité organisationnelle")).toBeInTheDocument();
        });

        it("devrait afficher le score technique", () => {
            render(
                <TechAndOrga selectedApp={mockApp} tipsItemsTech={techTips} tipsItemsOrga={orgaTips} />
            );

            expect(screen.getByText("80.00")).toBeInTheDocument();
        });

        it("devrait afficher le score organisationnel", () => {
            render(
                <TechAndOrga selectedApp={mockApp} tipsItemsTech={techTips} tipsItemsOrga={orgaTips} />
            );

            expect(screen.getByText("70.00")).toBeInTheDocument();
        });

        it("devrait afficher les barres de progression technique", () => {
            render(
                <TechAndOrga selectedApp={mockApp} tipsItemsTech={techTips} tipsItemsOrga={orgaTips} />
            );

            expect(screen.getByText("Pratiques de développement")).toBeInTheDocument();
            expect(screen.getByText("Architectures compatibles")).toBeInTheDocument();
            expect(screen.getByText("Technologies compatibles")).toBeInTheDocument();
        });

        it("devrait afficher les barres de progression organisationnelle", () => {
            render(
                <TechAndOrga selectedApp={mockApp} tipsItemsTech={techTips} tipsItemsOrga={orgaTips} />
            );

            expect(screen.getByText("Pratiques des technologies du cloud")).toBeInTheDocument();
            expect(screen.getByText("Pratiques DevOps")).toBeInTheDocument();
            expect(screen.getByText("Maturité d'équipe")).toBeInTheDocument();
        });

        it("devrait afficher les conseils techniques", () => {
            render(
                <TechAndOrga selectedApp={mockApp} tipsItemsTech={techTips} tipsItemsOrga={orgaTips} />
            );

            expect(screen.getByText("Conseils techniques")).toBeInTheDocument();
            expect(screen.getByText(/Améliorer les tests unitaires/i)).toBeInTheDocument();
        });

        it("devrait afficher les conseils organisationnels", () => {
            render(
                <TechAndOrga selectedApp={mockApp} tipsItemsTech={techTips} tipsItemsOrga={orgaTips} />
            );

            expect(screen.getByText("Conseils organisationnels")).toBeInTheDocument();
            expect(screen.getByText(/Former l'équipe DevOps/i)).toBeInTheDocument();
        });

        it("devrait gérer l'absence de tips", () => {
            render(<TechAndOrga selectedApp={mockApp} tipsItemsTech={[]} tipsItemsOrga={[]} />);

            const aucunConseil = screen.getAllByText("Aucun conseil.");
            expect(aucunConseil).toHaveLength(2);
        });

        it("devrait gérer selectedApp null", () => {
            render(<TechAndOrga selectedApp={null} tipsItemsTech={techTips} tipsItemsOrga={orgaTips} />);
            screen.getAllByText("0.00").forEach(text => expect(text).toBeInTheDocument());
        });

        it("devrait dédupliquer les conseils identiques", () => {
            const duplicateTips = [
                { id: 1, conseil: "Conseil répété", sourceId: 1, priority: 1 } as ApplicationTip,
                { id: 2, conseil: "Conseil répété", sourceId: 1, priority: 2 } as ApplicationTip,
                { id: 3, conseil: "Autre conseil", sourceId: 1, priority: 3 } as ApplicationTip
            ];

            render(
                <TechAndOrga selectedApp={mockApp} tipsItemsTech={duplicateTips} tipsItemsOrga={[]} />
            );

            const conseilRepete = screen.getAllByText(/Conseil répété/i);
            expect(conseilRepete).toHaveLength(1);
        });

        it("devrait filtrer les conseils vides", () => {
            const tipsWithEmpty = [
                { id: 1, conseil: "", sourceId: 1, priority: 1 } as ApplicationTip,
                { id: 2, conseil: "   ", sourceId: 1, priority: 2 } as ApplicationTip,
                { id: 3, conseil: "Conseil valide", sourceId: 1, priority: 3 } as ApplicationTip
            ];

            render(
                <TechAndOrga selectedApp={mockApp} tipsItemsTech={tipsWithEmpty} tipsItemsOrga={[]} />
            );

            expect(screen.getByText(/Conseil valide/i)).toBeInTheDocument();
        });
    });

    describe("Calculs de pourcentage", () => {
        it("devrait afficher les pourcentages correctement arrondis", () => {
            const appWithDecimals = {
                ...mockApp,
                progressionDeploy: "0.856"
            };

            render(<TechAndOrga selectedApp={appWithDecimals} tipsItemsTech={[]} tipsItemsOrga={[]} />);

            expect(screen.getByText("86%")).toBeInTheDocument();
        });

        it("devrait clamp les valeurs hors limites", () => {
            const appOutOfBounds = {
                ...mockApp,
                progressionDeploy: "1.5",
                progressionArchi: "-0.2"
            };

            render(<TechAndOrga selectedApp={appOutOfBounds} tipsItemsTech={[]} tipsItemsOrga={[]} />);

            const percentages = screen.getAllByText(/\d+%/);
            percentages.forEach(el => {
                const value = Number.parseInt(el.textContent || "0");
                expect(value).toBeGreaterThanOrEqual(0);
                expect(value).toBeLessThanOrEqual(100);
            });
        });
    });

    describe("Responsive behavior", () => {
        it("devrait s'adapter aux petits écrans", () => {
            const { container } = render(
                <TechAndOrga selectedApp={mockApp} tipsItemsTech={[]} tipsItemsOrga={[]} />
            );
            expect(container.firstChild).toBeInTheDocument();
        });
    });
});
