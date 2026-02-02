import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TableWrapper from "components/accueilLayout/custom/TableWrapper/TableWrapper";

describe("TableWrapper", () => {
    it("affiche correctement les enfants", () => {
        render(
            <TableWrapper>
                <span data-testid="child">Table Wrapper</span>
            </TableWrapper>
        );

        const child = screen.getByTestId("child");
        expect(child).toBeInTheDocument();
        expect(child).toHaveTextContent("Table Wrapper");
    });

    it("applique la classe noScroll lorsque noScroll est vrai", () => {
        const { container } = render(<TableWrapper noScroll />);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass("fr-table--no-scroll");
    });

    it("applique la classe noCaption lorsque noCaption est vrai", () => {
        const { container } = render(<TableWrapper noCaption />);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass("fr-table--no-caption");
    });

    it("applique les deux classes lorsque noScroll et noCaption sont vrais", () => {
        const { container } = render(<TableWrapper noScroll noCaption />);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass("fr-table--no-scroll");
        expect(wrapper).toHaveClass("fr-table--no-caption");
    });

    it("n’applique aucune classe lorsque les props sont fausses", () => {
        const { container } = render(<TableWrapper />);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).not.toHaveClass("fr-table--no-scroll");
        expect(wrapper).not.toHaveClass("fr-table--no-caption");
    });
});
