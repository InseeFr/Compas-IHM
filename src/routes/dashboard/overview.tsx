import { createFileRoute } from "@tanstack/react-router";
import DashboardCharts from "pages/dashboards/overview/DashboardCharts";

export const Route = createFileRoute("/dashboard/overview")({
    component: RouteComponent
});

function RouteComponent() {
    return <DashboardCharts />;
}
