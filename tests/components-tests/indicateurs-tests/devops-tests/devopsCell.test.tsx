import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContributorCell, DeploymentCell, DistanceCell } from "pages/indicateurs/devops/DevopsCell";
import type { DevopsIndicateur } from "models/indicateurs";

// Mock pour ToolTipLayout
vi.mock("components/ToolTipLayout", () => ({
    ToolTipLayout: ({ title, content }: { title: string; content: React.ReactNode }) => (
        <div data-testid="tooltip">
            <div data-testid="tooltip-title">{title}</div>
            <div data-testid="tooltip-content">{content}</div>
        </div>
    ),
}));

// Mock pour TREND_CONFIG
vi.mock("constantes/trend.constants", () => ({
    TREND_CONFIG: {
        up: { icon: () => <span data-testid="trend-icon">↑</span>, color: "green" },
        down: { icon: () => <span data-testid="trend-icon">↓</span>, color: "red" },
        flat: { icon: () => <span data-testid="trend-icon">→</span>, color: "gray" },
    },
}));

// Fonction utilitaire pour créer une ligne de test
const createMockRow = (overrides: Partial<DevopsIndicateur> = {}): { original: DevopsIndicateur } => ({
    original: {
        // Propriétés requises avec des valeurs par défaut
        applicationName: "Test Application",
        sndi: "TEST123",
        domaine: "Test Domain",
        domaineFonc: "Test Functional Domain",
        lettreContributorCount: "A",
        lettreDeploymentCount: "A",
        lettreDistanceCount: "A",
        lettreGlobalDevops: "A",
        distanceCount: "0",
        nbDeploymentCount: "0",
        nbContributorCount: "0",
        // Propriétés optionnelles avec des valeurs par défaut
        pastNbContributorCount: "0",
        pastNbDeploymentCount: "0",
        pastDistanceCount: "0",
        diffNbContributorCount: 0,
        diffNbDeploymentCount: 0,
        diffDistanceCount: 0,
        grade: "A",
        isModule: false,
        parentApplication: "Parent App",
        // Écrasement des valeurs par défaut avec les overrides
        ...overrides,
    },
});

describe("DevopsCell Components", () => {
    describe("ContributorCell", () => {
        it("should display 'NR' with correct tooltip", () => {
            const row = createMockRow({ lettreContributorCount: "NR" });
            render(<ContributorCell row={row} />);

            expect(screen.getByTestId("tooltip-content")).toHaveTextContent("NR");
            expect(screen.getByTestId("tooltip-title")).toHaveTextContent("Non renseigné");
        });

        it("should display 'SO' with correct tooltip", () => {
            const row = createMockRow({ lettreContributorCount: "SO" });
            render(<ContributorCell row={row} />);

            expect(screen.getByTestId("tooltip-content")).toHaveTextContent("SO");
            expect(screen.getByTestId("tooltip-title")).toHaveTextContent("Sans objet");
        });

        it("should display single contributor correctly", () => {
            const row = createMockRow({
                lettreContributorCount: "A",
                nbContributorCount: "1",
                pastNbContributorCount: "0",
            });
            render(<ContributorCell row={row} />);

            expect(screen.getByTestId("tooltip-content")).toHaveTextContent("A");
            expect(screen.getByTestId("tooltip-title")).toHaveTextContent("1 personne (0)");
        });

        it("should display multiple contributors correctly", () => {
            const row = createMockRow({
                lettreContributorCount: "B",
                nbContributorCount: "5",
                pastNbContributorCount: "3",
            });
            render(<ContributorCell row={row} />);

            expect(screen.getByTestId("tooltip-content")).toHaveTextContent("B");
            expect(screen.getByTestId("tooltip-title")).toHaveTextContent("5 personnes (3)");
        });

        it("should handle zero contributors", () => {
            const row = createMockRow({
                lettreContributorCount: "C",
                nbContributorCount: "0",
                pastNbContributorCount: "2",
            });
            render(<ContributorCell row={row} />);

            expect(screen.getByTestId("tooltip-title")).toHaveTextContent("aucune contribution sur la période (2)");
        });

        it("should show duplicate flag when pattern matches", () => {
            const row = createMockRow({
                lettreContributorCount: "A d",
                nbContributorCount: "3",
                pastNbContributorCount: "1",
            });
            render(<ContributorCell row={row} />);

            expect(screen.getByTestId("tooltip-title")).toHaveTextContent("3 personnes (1) (doublon d'URL Gitlab)");
        });

        it("should show up trend icon when diff is positive", () => {
            const row = createMockRow({
                lettreContributorCount: "A",
                diffNbContributorCount: 5,
            });
            render(<ContributorCell row={row} />);

            const icon = screen.getByTestId("trend-icon");
            expect(icon).toHaveTextContent("↑");
        });

        it("should show down trend icon when diff is negative", () => {
            const row = createMockRow({
                lettreContributorCount: "A",
                diffNbContributorCount: -3,
            });
            render(<ContributorCell row={row} />);

            const icon = screen.getByTestId("trend-icon");
            expect(icon).toHaveTextContent("↓");
        });

        it("should show flat trend icon when diff is zero", () => {
            const row = createMockRow({
                lettreContributorCount: "A",
                diffNbContributorCount: 0,
            });
            render(<ContributorCell row={row} />);

            const icon = screen.getByTestId("trend-icon");
            expect(icon).toHaveTextContent("→");
        });

        it("should not show trend icon for NR/SO", () => {
            const row = createMockRow({
                lettreContributorCount: "NR",
                diffNbContributorCount: 5,
            });
            render(<ContributorCell row={row} />);

            expect(screen.queryByTestId("trend-icon")).not.toBeInTheDocument();
        });
    });

describe("DeploymentCell", () => {
        it("should display 'NR' correctly", () => {
            const row = createMockRow({ lettreDeploymentCount: "NR" });
        render(<DeploymentCell row={row} />);

            expect(screen.getByTestId("tooltip-content")).toHaveTextContent("NR");
            expect(screen.getByTestId("tooltip-title")).toHaveTextContent("Non renseigné");
    });

        it("should display singular deployment correctly", () => {
            const row = createMockRow({
                lettreDeploymentCount: "A",
                nbDeploymentCount: "1",
                pastNbDeploymentCount: "0",
            });
        render(<DeploymentCell row={row} />);

            expect(screen.getByTestId("tooltip-title")).toHaveTextContent("1 mise en production (0)");
    });

        it("should display plural deployments correctly", () => {
            const row = createMockRow({
                lettreDeploymentCount: "B",
                nbDeploymentCount: "3",
                pastNbDeploymentCount: "1",
            });
        render(<DeploymentCell row={row} />);

            expect(screen.getByTestId("tooltip-title")).toHaveTextContent("3 mises en production (1)");
    });

        it("should show up trend for positive diff", () => {
            const row = createMockRow({
                lettreDeploymentCount: "A",
                diffNbDeploymentCount: 2,
            });
        render(<DeploymentCell row={row} />);

            expect(screen.getByTestId("trend-icon")).toHaveTextContent("↑");
    });
    });

describe("DistanceCell", () => {
        it("should display 'NR' correctly", () => {
            const row = createMockRow({ lettreDistanceCount: "NR" });
        render(<DistanceCell row={row} />);

            expect(screen.getByTestId("tooltip-content")).toHaveTextContent("NR");
            expect(screen.getByTestId("tooltip-title")).toHaveTextContent("Non renseigné");
    });

        it("should display singular day correctly", () => {
            const row = createMockRow({
                lettreDistanceCount: "A",
                distanceCount: "1",
                pastDistanceCount: "0",
            });
        render(<DistanceCell row={row} />);

            expect(screen.getByTestId("tooltip-title")).toHaveTextContent("Il y a 1 jour (0)");
    });

        it("should display plural days correctly", () => {
            const row = createMockRow({
                lettreDistanceCount: "B",
                distanceCount: "5",
                pastDistanceCount: "3",
            });
            render(<DistanceCell row={row} />);

            expect(screen.getByTestId("tooltip-title")).toHaveTextContent("Il y a 5 jours (3)");
            });
        it("should show down trend for positive diff (distance logic)", () => {
            const row = createMockRow({
                lettreDistanceCount: "A",
                diffDistanceCount: 2,
            });
        render(<DistanceCell row={row} />);
            expect(screen.getByTestId("trend-icon")).toHaveTextContent("↓");
    });

        it("should show up trend for negative diff (distance logic)", () => {
            const row = createMockRow({
                lettreDistanceCount: "A",
                diffDistanceCount: -2,
            });
        render(<DistanceCell row={row} />);
            expect(screen.getByTestId("trend-icon")).toHaveTextContent("↑");
    });
    });
});
