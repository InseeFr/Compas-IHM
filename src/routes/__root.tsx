import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import Header from "../components/Header";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useState } from "react";
import { darkTheme, lightTheme } from "../themes/create-themes";

export const Route = createRootRouteWithContext()({
    component: RootComponent,
    notFoundComponent: () => <>The route is not defined</>
});

function RootComponent() {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline /> 
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main>
        <Outlet />
      </main>
    </ThemeProvider>
  );
}
