import { createFileRoute } from "@tanstack/react-router";
import { StrategieCloudTable } from "pages/indicateurs/strategiecloud/strategieCloudTable";

export const Route = createFileRoute("/indicateur/strategieCloudTable")({
    component: RouteComponent
});

function RouteComponent() {
    return <StrategieCloudTable />;
}
