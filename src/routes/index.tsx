import { createFileRoute } from "@tanstack/react-router";
import HomePageLayout from "../pages/Home";

export const Route = createFileRoute("/")({
    component: IndexPage
});

function IndexPage() {
    return <HomePageLayout />;
}
