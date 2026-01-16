import { createFileRoute } from "@tanstack/react-router";
import MaturiteCloud from "components/dashboards/maturité/MaturiteCloud";

export const Route = createFileRoute("/dashboard/maturite")({
    component: RouteComponent
});

function RouteComponent() {
    return <MaturiteCloud />;
}
