import { createFileRoute } from "@tanstack/react-router";
import PageMdLayout from "components/accueilLayout/PageMdLayout";

export const Route = createFileRoute("/$pageName")({
    component: PageAccueilComponent
});

function PageAccueilComponent() {
    return <PageMdLayout />;
}
