import { createFileRoute } from "@tanstack/react-router";
import QualiteDashboard from "pages/dashboards/specialized/QualiteDashboard";

export const Route = createFileRoute("/dashboard/qualite")({
    component: RouteComponent
});

function RouteComponent() {
    return <QualiteDashboard />;
}
