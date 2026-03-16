import { createFileRoute } from "@tanstack/react-router";
import AccessibiliteDashboard from "pages/dashboards/specialized/AccessibiliteDashboard";

export const Route = createFileRoute("/dashboard/accessibilite")({
    component: RouteComponent
});

function RouteComponent() {
    return <AccessibiliteDashboard />;
}
