import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

import { FilterProvider } from "store/filterContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MarkdownProvider } from "store/MarkdownIndicatorsContext";
import { TendanceProvider } from "store/tendance-context";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 3,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000,
            gcTime: 5 * 60 * 1000
        }
    }
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <MarkdownProvider>
                    <FilterProvider>
                        <TendanceProvider>
                            <RouterProvider router={router} />
                        </TendanceProvider>
                    </FilterProvider>
                </MarkdownProvider>
            </LocalizationProvider>
        </QueryClientProvider>
    </StrictMode>
);