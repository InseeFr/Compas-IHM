import { createFileRoute } from "@tanstack/react-router";
import MeteoDashboard from "pages/dashboards/specialized/MeteoDashboard";

export const Route = createFileRoute("/dashboard/meteo")({
    component: RouteComponent
});

function RouteComponent() {
    return <MeteoDashboard />;
}
