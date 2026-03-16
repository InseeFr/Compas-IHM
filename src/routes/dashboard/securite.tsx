import { createFileRoute } from "@tanstack/react-router";
import SecuriteDashboard from "pages/dashboards/specialized/SecuriteDashboard";

export const Route = createFileRoute("/dashboard/securite")({
    component: RouteComponent
});

function RouteComponent() {
    return <SecuriteDashboard />;
}
