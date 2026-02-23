import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCompasDataDate } from "hooks/useCompasDataDate";
import * as clientGen from "todos-api/client.gen";
import type { ReactElement, ReactNode } from "react";

vi.mock("todos-api/client.gen");

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false }
        }
    });
    // eslint-disable-next-line react/display-name
    return ({ children }: { children: ReactNode }): ReactElement => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe("useCompasDataDate", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should successfully fetch the update date", async () => {
        const mockDate = "2026-02-01";
        vi.mocked(clientGen.getNombreVirtualMachine).mockResolvedValue({
            dateMaj: mockDate,
            applicationId: 201
        });

        const { result } = renderHook(() => useCompasDataDate(), {
            wrapper: createWrapper()
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toBe(mockDate);
        expect(clientGen.getNombreVirtualMachine).toHaveBeenCalledWith(201);
    });

    it("should handle fetch errors", async () => {
        vi.mocked(clientGen.getNombreVirtualMachine).mockRejectedValue(new Error("API Error"));

        const { result } = renderHook(() => useCompasDataDate(), {
            wrapper: createWrapper()
        });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.data).toBeUndefined();
        expect(result.current.error).toBeDefined();
    });

    it("should display loading state", () => {
        vi.mocked(clientGen.getNombreVirtualMachine).mockImplementation(() => new Promise(() => {}));

        const { result } = renderHook(() => useCompasDataDate(), {
            wrapper: createWrapper()
        });

        expect(result.current.isLoading).toBe(true);
        expect(result.current.data).toBeUndefined();
    });
});
