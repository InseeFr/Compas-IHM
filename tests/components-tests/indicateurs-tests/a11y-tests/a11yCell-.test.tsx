/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import {
    AuditCell,
    CellWithTooltip,
    DeclarationCell,
    IssueA11yCell
} from "pages/indicateurs/a11y/A11yCell";
import type { A11yIndicateur } from "models/indicateurs";
import { describe, it, expect, vi } from "vitest";

vi.mock("components/ToolTipLayout", () => ({
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

        expect(title.textContent).toBe("Problème Sonar : 5");
        expect(content.textContent).toBe("A");
    });

    it("affiche NR si nbIssueAccessibilite est NR", () => {
        const row: any = {
            original: { nbIssueAccessibilite: "NR", lettreIssueAccessibilite: "B" }
        };
        render(<IssueA11yCell row={row} />);
        expect(screen.getByTestId("tooltip-title").textContent).toBe("Problème Sonar : NR");
        expect(screen.getByTestId("tooltip-content").textContent).toBe("B");
    });

    it("affiche NR si nbIssueAccessibilite est undefined", () => {
        const row: any = {
            original: { nbIssueAccessibilite: undefined, lettreIssueAccessibilite: undefined }
        };
        render(<IssueA11yCell row={row} />);
        expect(screen.getByTestId("tooltip-title").textContent).toBe("Problème Sonar : NR");
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

describe("DeclarationCell", () => {
    it('affiche "Déclarée" et la date lorsque la déclaration existe', () => {
        const row = {
            original: {
                declaration: {
                    hasDeclaration: true,
                    dateDeclaration: "2024-01-10"
                }
            } as A11yIndicateur
        };

        render(<DeclarationCell row={row} />);

        expect(screen.getByText("Déclarée")).toBeInTheDocument();
        expect(screen.getByText("2024-01-10")).toBeInTheDocument();
    });
});

describe("AuditCell", () => {
    it("affiche le type d'audit, le score et la date", () => {
        const row = {
            original: {
                audit: {
                    auditType: "RGAA",
                    score: 85,
                    dateAudit: "2023-12-01"
                }
            } as unknown as A11yIndicateur
        };

        render(<AuditCell row={row} />);

        expect(screen.getByText("Type d'audit: RGAA")).toBeInTheDocument();
        expect(screen.getByText("Score: 85")).toBeInTheDocument();
        expect(screen.getByText("Date d'audit: 2023-12-01")).toBeInTheDocument();
    });
});
