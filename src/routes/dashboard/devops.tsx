import { createFileRoute } from "@tanstack/react-router";
import DevopsDashboard from "pages/dashboards/specialized/DevopsDashboard";

export const Route = createFileRoute("/dashboard/devops")({
    component: RouteComponent
});

function RouteComponent() {
    return <DevopsDashboard />;
}
