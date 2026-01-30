import { createFileRoute } from "@tanstack/react-router";
import MaturiteCloud from "pages/dashboards/maturité/MaturiteCloud";

export const Route = createFileRoute("/dashboard/maturite")({
    component: RouteComponent
});

function RouteComponent() {
    return <MaturiteCloud />;
}
