/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import type { MRT_ColumnDef } from "material-react-table";
import TablePageLayout from "components/TablePageLayout";
import type { ReactElement } from "react";
import { createTheme, ThemeProvider } from "@mui/material";

vi.mock("@tanstack/react-router", async importOriginal => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        RouterProvider: ({ children }: any) => <>{children}</>,
        useLinkProps: () => ({}),
        Link: ({ children }: any) => <span>{children}</span>
    };
});

const theme = createTheme();
function renderWithProviders(ui: ReactElement) {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

interface TestRow {
    id: string;
    name: string;
}

const columns: MRT_ColumnDef<TestRow>[] = [
    {
        accessorKey: "name",
        header: "Nom"
    }
];

const data: TestRow[] = [{ id: "1", name: "Jean" }];

describe("TablePageLayout", () => {
    it("renders title", () => {
        renderWithProviders(
            <TablePageLayout
                titleTable="Ma Table"
                columns={columns}
                data={data}
                isLoading={false}
                paginationConfig={{ pagination: { pageIndex: 0, pageSize: 10 } }}
                renderTopCustom={() => null}
                filters={null}
                fetch={function (): Promise<unknown> {
                    throw new Error("Function not implemented.");
                }}
            />
        );

        expect(screen.getByText("Ma Table")).toBeInTheDocument();
    });

    it("renders search input", () => {
        renderWithProviders(
            <TablePageLayout
                titleTable="Ma Table"
                columns={columns}
                data={data}
                isLoading={false}
                paginationConfig={{ pagination: { pageIndex: 0, pageSize: 10 } }}
                renderTopCustom={() => null}
                filters={null}
                fetch={function (): Promise<unknown> {
                    throw new Error("Function not implemented.");
                }}
            />
        );

        const searchInput = screen.getByRole("searchbox", { name: /rechercher/i });
        expect(searchInput).toBeInTheDocument();
    });

    it("shows loading state", () => {
        renderWithProviders(
            <TablePageLayout
                titleTable="Ma Table"
                columns={columns}
                data={data}
                isLoading={true}
                paginationConfig={{ pagination: { pageIndex: 0, pageSize: 10 } }}
                renderTopCustom={() => null}
                filters={null}
                fetch={function (): Promise<unknown> {
                    throw new Error("Function not implemented.");
                }}
            />
        );

        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
});
