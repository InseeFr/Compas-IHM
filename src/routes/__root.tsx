import { createRootRouteWithContext, Outlet, useLocation } from "@tanstack/react-router";
import Header from "../pages/Header";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { darkTheme, lightTheme } from "../themes/create-themes";
import Footer from "pages/Footer";
import AccesRapide from "../components/AccesRapide";

export const Route = createRootRouteWithContext()({
    component: RootComponent,
    notFoundComponent: () => <>The route is not defined</>
});

function RootComponent() {
    const [darkMode, setDarkMode] = useState(false);
    const toggleDarkMode = () => setDarkMode(prev => !prev);
    const location = useLocation();
    const skipToRef = useRef<HTMLDivElement>(null);

    // Mettre le focus sur le début de la page (ie les liens d'accès rapide)
    useEffect(() => {
        window.scrollTo(0, 0);
        if (skipToRef.current) {
            skipToRef.current.focus();
        }
    }, [location.pathname]);

    return (
        <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
            <CssBaseline />
            <div
                ref={skipToRef}
                tabIndex={-1}
                style={{
                    position: "absolute",
                    left: "-9999px",
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                    outline: "none"
                }}
                aria-label="Début du contenu"
            />
            <AccesRapide darkMode={darkMode} />
            <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <main id="contenu">
                <Outlet />
            </main>
            <Footer darkmode={darkMode} accessibility={"Non-conforme"} />
        </ThemeProvider>
    );
}