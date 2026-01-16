import { createFileRoute } from "@tanstack/react-router";
import DashboardCharts from "components/dashboards/overview/DashboardCharts";

export const Route = createFileRoute("/dashboard/overview")({
    component: RouteComponent
});

function RouteComponent() {
    return <DashboardCharts />;
}
