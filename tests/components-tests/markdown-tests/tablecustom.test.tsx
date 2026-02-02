import { render, screen } from "@testing-library/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CustomTable } from "components/accueilLayout/custom/TableCustom";

// Mock the TableWrapper component
vi.mock("components/accueilLayout/custom/TableWrapper/TableWrapper", () => ({
    default: ({ children, noScroll }: { children: React.ReactNode; noScroll?: boolean }) => (
        <div data-testid="table-wrapper" data-noscroll={noScroll}>
            {children}
        </div>
    )
}));

describe("CustomTable", () => {
    it("renders a table from markdown", () => {
        const markdown = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
    `;

        render(
            <ReactMarkdown components={CustomTable} remarkPlugins={[remarkGfm]}>
                {markdown}
            </ReactMarkdown>
        );

        const table = screen.getByRole("table");
        expect(table).toBeInTheDocument();
    });

    it("wraps table in TableWrapper component", () => {
        const markdown = `
| Name | Age |
|------|-----|
| John | 30  |
    `;

        render(
            <ReactMarkdown components={CustomTable} remarkPlugins={[remarkGfm]}>
                {markdown}
            </ReactMarkdown>
        );

        const wrapper = screen.getByTestId("table-wrapper");
        expect(wrapper).toBeInTheDocument();
    });

    it("passes noScroll prop to TableWrapper", () => {
        const markdown = `
| Column A | Column B |
|----------|----------|
| Data 1   | Data 2   |
    `;

        render(
            <ReactMarkdown components={CustomTable} remarkPlugins={[remarkGfm]}>
                {markdown}
            </ReactMarkdown>
        );

        const wrapper = screen.getByTestId("table-wrapper");
        expect(wrapper).toHaveAttribute("data-noscroll", "true");
    });

    it("adds a screen reader only caption", () => {
        const markdown = `
| Header |
|--------|
| Value  |
    `;

        render(
            <ReactMarkdown components={CustomTable} remarkPlugins={[remarkGfm]}>
                {markdown}
            </ReactMarkdown>
        );

        const caption = screen.getByText("Tableau");
        expect(caption.tagName).toBe("CAPTION");
        expect(caption).toHaveClass("fr-sr-only");
    });

    it('renders table headers with scope="col"', () => {
        const markdown = `
| First Name | Last Name |
|------------|-----------|
| Alice      | Smith     |
    `;

        render(
            <ReactMarkdown components={CustomTable} remarkPlugins={[remarkGfm]}>
                {markdown}
            </ReactMarkdown>
        );

        const headers = screen.getAllByRole("columnheader");
        expect(headers).toHaveLength(2);

        headers.forEach(header => {
            expect(header).toHaveAttribute("scope", "col");
        });
    });

    it("renders table content correctly", () => {
        const markdown = `
| Product | Price |
|---------|-------|
| Apple   | $1.50 |
| Banana  | $0.75 |
    `;

        render(
            <ReactMarkdown components={CustomTable} remarkPlugins={[remarkGfm]}>
                {markdown}
            </ReactMarkdown>
        );

        expect(screen.getByText("Product")).toBeInTheDocument();
        expect(screen.getByText("Price")).toBeInTheDocument();
        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("$1.50")).toBeInTheDocument();
        expect(screen.getByText("Banana")).toBeInTheDocument();
        expect(screen.getByText("$0.75")).toBeInTheDocument();
    });

    it("handles complex tables with multiple rows", () => {
        const markdown = `
| ID | Name    | Status |
|----|---------|--------|
| 1  | Alice   | Active |
| 2  | Bob     | Active |
| 3  | Charlie | Inactive |
    `;

        render(
            <ReactMarkdown components={CustomTable} remarkPlugins={[remarkGfm]}>
                {markdown}
            </ReactMarkdown>
        );

        const rows = screen.getAllByRole("row");
        // 1 header row + 3 data rows = 4 total
        expect(rows.length).toBeGreaterThanOrEqual(4);
    });

    it("preserves table structure with tbody", () => {
        const markdown = `
| Col1 | Col2 |
|------|------|
| A    | B    |
    `;

        const { container } = render(
            <ReactMarkdown components={CustomTable} remarkPlugins={[remarkGfm]}>
                {markdown}
            </ReactMarkdown>
        );

        const tbody = container.querySelector("tbody");
        expect(tbody).toBeInTheDocument();
    });

    it("renders empty table gracefully", () => {
        const markdown = `
| Header |
|--------|
    `;

        render(
            <ReactMarkdown components={CustomTable} remarkPlugins={[remarkGfm]}>
                {markdown}
            </ReactMarkdown>
        );

        const table = screen.getByRole("table");
        expect(table).toBeInTheDocument();
        expect(screen.getByText("Header")).toBeInTheDocument();
    });
});
