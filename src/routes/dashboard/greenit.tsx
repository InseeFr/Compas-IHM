import { createFileRoute } from "@tanstack/react-router";
import GreenITDashboard from "pages/dashboards/specialized/GreenITDashboard";

export const Route = createFileRoute("/dashboard/greenit")({
    component: RouteComponent
});

function RouteComponent() {
    return <GreenITDashboard />;
}
