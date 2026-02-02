import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import Header from "../pages/Header";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useState } from "react";
import { darkTheme, lightTheme } from "../themes/create-themes";
import Footer from "pages/Footer";
import AccesRapide from "../pages/AccesRapide";

export const Route = createRootRouteWithContext()({
    component: RootComponent,
    notFoundComponent: () => <>The route is not defined</>
});

function RootComponent() {
    const [darkMode, setDarkMode] = useState(false);
    const toggleDarkMode = () => setDarkMode(prev => !prev);

    return (
        <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
            <CssBaseline />
            <AccesRapide darkMode={darkMode} />
            <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <main id="contenu">
                <Outlet />
            </main>
            <Footer darkmode={darkMode} accessibility={"Non-conforme"} />
        </ThemeProvider>
    );
}