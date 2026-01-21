import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { FilterProvider } from "store/filterContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

//Récupération des routers via tanstack
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
            <FilterProvider>
                <RouterProvider router={router} />
            </FilterProvider>
        </QueryClientProvider>
    </StrictMode>
);
