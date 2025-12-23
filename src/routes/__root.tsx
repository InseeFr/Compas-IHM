import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import Header from "../components/Header";

export const Route = createRootRouteWithContext()({
    component: RootComponent,
    notFoundComponent: () => <>The route is not defined</>
});

function RootComponent() {
    return (
        <div>
            <Header />
            <main>
                <Outlet />
            </main>
        </div>
    );
}
