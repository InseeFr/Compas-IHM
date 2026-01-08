/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { CellWithTooltip, IssueA11yCell } from "components/indicateurs/a11y/A11yCell";
import { describe, it, expect, vi } from "vitest";

vi.mock("pages/ToolTipLayout", () => ({
    ToolTipLayout: ({ title, content }: any) => (
        <div data-testid="tooltip">
            <div data-testid="tooltip-title">{title}</div>
            <div data-testid="tooltip-content">{content}</div>
        </div>
    )
}));

describe("IssueA11yCell", () => {
    it("affiche le nombre d'issues arrondi correctement", () => {
        const row: any = {
            original: { nbIssueAccessibilite: "4.7", lettreIssueAccessibilite: "A" }
        };
        render(<IssueA11yCell row={row} />);
        const title = screen.getByTestId("tooltip-title");
        const content = screen.getByTestId("tooltip-content");

        expect(title.textContent).toBe("Issue Sonar : 5"); // arrondi
        expect(content.textContent).toBe("A");
    });

    it("affiche NR si nbIssueAccessibilite est NR", () => {
        const row: any = {
            original: { nbIssueAccessibilite: "NR", lettreIssueAccessibilite: "B" }
        };
        render(<IssueA11yCell row={row} />);
        expect(screen.getByTestId("tooltip-title").textContent).toBe("Issue Sonar : NR");
        expect(screen.getByTestId("tooltip-content").textContent).toBe("B");
    });

    it("affiche NR si nbIssueAccessibilite est undefined", () => {
        const row: any = {
            original: { nbIssueAccessibilite: undefined, lettreIssueAccessibilite: undefined }
        };
        render(<IssueA11yCell row={row} />);
        expect(screen.getByTestId("tooltip-title").textContent).toBe("Issue Sonar : NR");
        expect(screen.getByTestId("tooltip-content").textContent).toBe("NR");
    });
});

describe("CellWithTooltip", () => {
    it("affiche correctement la valeur passée", () => {
        render(<CellWithTooltip value="Test" />);
        expect(screen.getByTestId("tooltip-title").textContent).toBe("Test");
        expect(screen.getByTestId("tooltip-content").textContent).toBe("Test");
    });

    it("affiche le fallback si value est undefined", () => {
        render(<CellWithTooltip value={undefined} />);
        expect(screen.getByTestId("tooltip-title").textContent).toBe("Aucune valeur");
        expect(screen.getByTestId("tooltip-content").textContent).toBe("Aucune valeur");
    });
});
