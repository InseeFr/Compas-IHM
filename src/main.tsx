import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { FilterProvider } from "store/filterContext";

//Récupération des routers via tanstack
const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <FilterProvider>
            <RouterProvider router={router} />
        </FilterProvider>
    </StrictMode>
);
