import { createFileRoute } from "@tanstack/react-router";
import { StrategieCloudForm } from "pages/saisies/strategiecloud/strategieCloudForm";

export const Route = createFileRoute("/saisie/strategiecloud")({
    component: RouteComponent
});

function RouteComponent() {
    return <StrategieCloudForm />;
}
