import { render, screen } from "@testing-library/react";
import { LinkCustom } from "components/accueilLayout/custom/LinkCustom";
import ReactMarkdown from "react-markdown";

describe("LinkCustom", () => {
    it("renders a link with correct href and children", () => {
        const markdown = "[Click here](https://example.com)";

        render(<ReactMarkdown components={LinkCustom}>{markdown}</ReactMarkdown>);

        const link = screen.getByRole("link", { name: "Click here" });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", "https://example.com");
    });

    it("opens links in a new tab", () => {
        const markdown = "[External link](https://example.com)";

        render(<ReactMarkdown components={LinkCustom}>{markdown}</ReactMarkdown>);

        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("target", "_blank");
    });

    it('has rel="noopener noreferrer" for security', () => {
        const markdown = "[Secure link](https://example.com)";

        render(<ReactMarkdown components={LinkCustom}>{markdown}</ReactMarkdown>);

        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders a link element with proper structure", () => {
        const markdown = "[Styled link](https://example.com)";

        render(<ReactMarkdown components={LinkCustom}>{markdown}</ReactMarkdown>);

        const link = screen.getByRole("link");
        expect(link).toBeInTheDocument();
        expect(link.tagName).toBe("A");
    });

    it("handles multiple links in markdown", () => {
        const markdown = "[First](https://first.com) and [Second](https://second.com)";

        render(<ReactMarkdown components={LinkCustom}>{markdown}</ReactMarkdown>);

        const links = screen.getAllByRole("link");
        expect(links).toHaveLength(2);
        expect(links[0]).toHaveAttribute("href", "https://first.com");
        expect(links[1]).toHaveAttribute("href", "https://second.com");
    });

    it("renders link with complex children", () => {
        const markdown = "[**Bold** and *italic* text](https://example.com)";

        render(<ReactMarkdown components={LinkCustom}>{markdown}</ReactMarkdown>);

        const link = screen.getByRole("link");
        expect(link).toBeInTheDocument();
        expect(link.querySelector("strong")).toHaveTextContent("Bold");
        expect(link.querySelector("em")).toHaveTextContent("italic");
    });

    it("handles empty href gracefully", () => {
        const markdown = "[No href]()";

        render(<ReactMarkdown components={LinkCustom}>{markdown}</ReactMarkdown>);

        const link = screen.getByText("No href");
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", "");
    });
});
