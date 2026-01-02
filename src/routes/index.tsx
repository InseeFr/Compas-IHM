import { createFileRoute } from "@tanstack/react-router";
import HomePageLayout from "../pages/HomePageLayout";
import { WELCOME_MESSAGE } from "../constantes/constantes";

export const Route = createFileRoute("/")({
    component: IndexPage
});

function IndexPage() {
    return <HomePageLayout title={WELCOME_MESSAGE} />;
}
