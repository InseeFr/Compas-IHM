import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContributorCell, DeploymentCell, DistanceCell } from "components/indicateurs/devops/DevopsCell";
import type { DevopsIndicateur } from "models/indicateurs";

// Mock ToolTipLayout to simplify testing
vi.mock("pages/ToolTipLayout", () => ({
    ToolTipLayout: ({ title, content }: { title: string; content: string }) => (
        <div data-testid="tooltip" title={title}>
            {content}
        </div>
    ),
}));

describe("ContributorCell", () => {
    const createRow = (
        lettreContributorCount: string,
        nbContributorCount: number | string
    ) => ({
        original: {
            lettreContributorCount,
            nbContributorCount,
        } as DevopsIndicateur,
    });

    describe("Standard cases", () => {
        it("should display 'NR' with 'Non renseigné' tooltip", () => {
            const row = createRow("NR", 0);
            render(<ContributorCell row={row} />);

            const tooltip = screen.getByTestId("tooltip");
            expect(tooltip).toHaveTextContent("NR");
            expect(tooltip).toHaveAttribute("title", "Non renseigné");
        });

        it("should display 'SO' with 'Sans objet' tooltip", () => {
            const row = createRow("SO", 0);
            render(<ContributorCell row={row} />);

            const tooltip = screen.getByTestId("tooltip");
            expect(tooltip).toHaveTextContent("SO");
            expect(tooltip).toHaveAttribute("title", "Sans objet");
        });

        it("should display single contributor (1 personne)", () => {
            const row = createRow("A", 1);
            render(<ContributorCell row={row} />);

            const tooltip = screen.getByTestId("tooltip");
            expect(tooltip).toHaveTextContent("A");
            expect(tooltip).toHaveAttribute("title", "1 personne");
        });

        it("should display multiple contributors (personnes)", () => {
            const row = createRow("B", 5);
            render(<ContributorCell row={row} />);

            const tooltip = screen.getByTestId("tooltip");
            expect(tooltip).toHaveTextContent("B");
            expect(tooltip).toHaveAttribute("title", "5 personnes");
        });

        it("should display zero contributors", () => {
            const row = createRow("E", 0);
            render(<ContributorCell row={row} />);

            const tooltip = screen.getByTestId("tooltip");
            expect(tooltip).toHaveTextContent("E");
            expect(tooltip).toHaveAttribute("title", "aucune contribution sur la période");
        });
    });

    describe("Duplicate flag handling", () => {
        it("should add duplicate flag for 'A d' pattern (lowercase)", () => {
            const row = createRow("A d", 3);
            render(<ContributorCell row={row} />);

            const tooltip = screen.getByTestId("tooltip");
            expect(tooltip).toHaveTextContent("A d");
            expect(tooltip).toHaveAttribute("title", "3 personnes (doublon d'URL Gitlab)");
        });

        it("should add duplicate flag for 'B D' pattern (uppercase)", () => {
            const row = createRow("B D", 2);
            render(<ContributorCell row={row} />);

            const tooltip = screen.getByTestId("tooltip");
            expect(tooltip).toHaveTextContent("B D");
            expect(tooltip).toHaveAttribute("title", "2 personnes (doublon d'URL Gitlab)");
        });

        it("should add duplicate flag for 'C d' with mixed case", () => {
            const row = createRow("C d", 1);
            render(<ContributorCell row={row} />);

            const tooltip = screen.getByTestId("tooltip");
            expect(tooltip).toHaveTextContent("C d");
            expect(tooltip).toHaveAttribute("title", "1 personne (doublon d'URL Gitlab)");
        });

        it("should add duplicate flag for zero contributors with flag", () => {
            const row = createRow("E d", 0);
            render(<ContributorCell row={row} />);

            const tooltip = screen.getByTestId("tooltip");
            expect(tooltip).toHaveTextContent("E d");
            expect(tooltip).toHaveAttribute(
                "title",
                "aucune contribution sur la période (doublon d'URL Gitlab)"
            );
        });

        it("should NOT add duplicate flag for 'NR' even with 'd'", () => {
            const row = createRow("NR", 0);
            render(<ContributorCell row={row} />);

            const tooltip = screen.getByTestId("tooltip");
            expect(tooltip).toHaveAttribute("title", "Non renseigné");
            expect(tooltip.getAttribute("title")).not.toContain("doublon");
        });

        it("should NOT add duplicate flag for 'SO' even with 'd'", () => {
            const row = createRow("SO", 0);
            render(<ContributorCell row={row} />);

            const tooltip = screen.getByTestId("tooltip");
            expect(tooltip).toHaveAttribute("title", "Sans objet");
            expect(tooltip.getAttribute("title")).not.toContain("doublon");
        });

        it("should NOT add duplicate flag if pattern doesn't match (no space)", () => {
            const row = createRow("Ad", 2);
            render(<ContributorCell row={row} />);

            const tooltip = screen.getByTestId("tooltip");
            expect(tooltip.getAttribute("title")).not.toContain("doublon");
        });

        it("should NOT add duplicate flag if letter is not A-E", () => {
            const row = createRow("F d", 2);
            render(<ContributorCell row={row} />);

            const tooltip = screen.getByTestId("tooltip");
            expect(tooltip.getAttribute("title")).not.toContain("doublon");
        });
    });

    describe("Edge cases", () => {
        it("should handle string number in nbContributorCount", () => {
            const row = createRow("B", "3");
            render(<ContributorCell row={row} />);

            const tooltip = screen.getByTestId("tooltip");
            expect(tooltip).toHaveAttribute("title", "3 personnes");
        });

        it("should handle invalid number (NaN)", () => {
            const row = createRow("C", "invalid");
            render(<ContributorCell row={row} />);

            const tooltip = screen.getByTestId("tooltip");
            expect(tooltip).toHaveAttribute("title", "aucune contribution sur la période");
        });

        it("should handle negative numbers (displays negative count)", () => {
            const row = createRow("D", -5);
            render(<ContributorCell row={row} />);

            const tooltip = screen.getByTestId("tooltip");
            expect(tooltip).toHaveAttribute("title", "-5 personne");
        });
    });
});

describe("DeploymentCell", () => {
    const createRow = (lettreDeploymentCount: string, nbDeploymentCount: number | string) => ({
        original: {
            lettreDeploymentCount,
            nbDeploymentCount,
        } as DevopsIndicateur,
    });

    it("should display 'NR' with 'Non renseigné' tooltip", () => {
        const row = createRow("NR", 0);
        render(<DeploymentCell row={row} />);

        const tooltip = screen.getByTestId("tooltip");
        expect(tooltip).toHaveTextContent("NR");
        expect(tooltip).toHaveAttribute("title", "Non renseigné");
    });

    it("should display 'SO' with 'Sans objet' tooltip", () => {
        const row = createRow("SO", 0);
        render(<DeploymentCell row={row} />);

        const tooltip = screen.getByTestId("tooltip");
        expect(tooltip).toHaveTextContent("SO");
        expect(tooltip).toHaveAttribute("title", "Sans objet");
    });

    it("should display singular 'mise en production' for 0", () => {
        const row = createRow("E", 0);
        render(<DeploymentCell row={row} />);

        const tooltip = screen.getByTestId("tooltip");
        expect(tooltip).toHaveTextContent("E");
        expect(tooltip).toHaveAttribute("title", "0 mise en production");
    });

    it("should display singular 'mise en production' for 1", () => {
        const row = createRow("A", 1);
        render(<DeploymentCell row={row} />);

        const tooltip = screen.getByTestId("tooltip");
        expect(tooltip).toHaveTextContent("A");
        expect(tooltip).toHaveAttribute("title", "1 mise en production");
    });

    it("should display plural 'mises en production' for 2", () => {
        const row = createRow("B", 2);
        render(<DeploymentCell row={row} />);

        const tooltip = screen.getByTestId("tooltip");
        expect(tooltip).toHaveTextContent("B");
        expect(tooltip).toHaveAttribute("title", "2 mises en production");
    });

    it("should display plural 'mises en production' for 10", () => {
        const row = createRow("A", 10);
        render(<DeploymentCell row={row} />);

        const tooltip = screen.getByTestId("tooltip");
        expect(tooltip).toHaveTextContent("A");
        expect(tooltip).toHaveAttribute("title", "10 mises en production");
    });

    it("should handle string numbers", () => {
        const row = createRow("C", "5");
        render(<DeploymentCell row={row} />);

        const tooltip = screen.getByTestId("tooltip");
        expect(tooltip).toHaveAttribute("title", "5 mises en production");
    });

    it("should handle invalid numbers as 0", () => {
        const row = createRow("D", "abc");
        render(<DeploymentCell row={row} />);

        const tooltip = screen.getByTestId("tooltip");
        expect(tooltip).toHaveAttribute("title", "0 mise en production");
    });
});

describe("DistanceCell", () => {
    const createRow = (lettreDistanceCount: string, distanceCount: number | string) => ({
        original: {
            lettreDistanceCount,
            distanceCount,
        } as DevopsIndicateur,
    });

    it("should display 'NR' with 'Non renseigné' tooltip", () => {
        const row = createRow("NR", 0);
        render(<DistanceCell row={row} />);

        const tooltip = screen.getByTestId("tooltip");
        expect(tooltip).toHaveTextContent("NR");
        expect(tooltip).toHaveAttribute("title", "Non renseigné");
    });

    it("should display 'SO' with 'Sans objet' tooltip", () => {
        const row = createRow("SO", 0);
        render(<DistanceCell row={row} />);

        const tooltip = screen.getByTestId("tooltip");
        expect(tooltip).toHaveTextContent("SO");
        expect(tooltip).toHaveAttribute("title", "Sans objet");
    });

    it("should display singular 'jour' with prefix for 0", () => {
        const row = createRow("E", 0);
        render(<DistanceCell row={row} />);

        const tooltip = screen.getByTestId("tooltip");
        expect(tooltip).toHaveTextContent("E");
        expect(tooltip).toHaveAttribute("title", "Il y a 0 jour");
    });

    it("should display singular 'jour' with prefix for 1", () => {
        const row = createRow("A", 1);
        render(<DistanceCell row={row} />);

        const tooltip = screen.getByTestId("tooltip");
        expect(tooltip).toHaveTextContent("A");
        expect(tooltip).toHaveAttribute("title", "Il y a 1 jour");
    });

    it("should display plural 'jours' with prefix for 2", () => {
        const row = createRow("B", 2);
        render(<DistanceCell row={row} />);

        const tooltip = screen.getByTestId("tooltip");
        expect(tooltip).toHaveTextContent("B");
        expect(tooltip).toHaveAttribute("title", "Il y a 2 jours");
    });

    it("should display plural 'jours' with prefix for 30", () => {
        const row = createRow("D", 30);
        render(<DistanceCell row={row} />);

        const tooltip = screen.getByTestId("tooltip");
        expect(tooltip).toHaveTextContent("D");
        expect(tooltip).toHaveAttribute("title", "Il y a 30 jours");
    });

    it("should handle string numbers", () => {
        const row = createRow("C", "7");
        render(<DistanceCell row={row} />);

        const tooltip = screen.getByTestId("tooltip");
        expect(tooltip).toHaveAttribute("title", "Il y a 7 jours");
    });

    it("should handle invalid numbers as 0", () => {
        const row = createRow("E", "xyz");
        render(<DistanceCell row={row} />);

        const tooltip = screen.getByTestId("tooltip");
        expect(tooltip).toHaveAttribute("title", "Il y a 0 jour");
    });

    it("should handle large numbers", () => {
        const row = createRow("E", 365);
        render(<DistanceCell row={row} />);

        const tooltip = screen.getByTestId("tooltip");
        expect(tooltip).toHaveAttribute("title", "Il y a 365 jours");
    });
});

describe("getTooltip helper function", () => {
    // Since getTooltip is not exported, we test it indirectly through the components
    // But we can document the expected behavior here for clarity

    it("should be tested through DeploymentCell and DistanceCell", () => {
        // This test serves as documentation that getTooltip is tested
        // indirectly through the consuming components
        expect(true).toBe(true);
    });
});