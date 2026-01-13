import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoInseeLight from "../assets/logo_insee.png";
import LogoInseeDark from "../assets/logo_insee_dark.png";
import NavBarLayout from "../pages/NavBarLayout";
import { Link } from "@tanstack/react-router";

interface HeaderProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export function Header({ darkMode, toggleDarkMode }: Readonly<HeaderProps>) {
    return (
        <AppBar position="relative" color="inherit" data-testid="header">
            <Toolbar>
                <Box
                    component="img"
                    data-testid="header-logo"
                    sx={{ height: 64 }}
                    fetchPriority="high"
                    alt="Insee Logo."
                    src={darkMode ? LogoInseeDark : LogoInseeLight}
                />
                <Typography
                    data-testid="header-title"
                    variant="h6"
                    noWrap
                    component={Link}
                    to="/"
                    sx={{
                        mr: 2,
                        display: { xs: "none", md: "flex" },
                        fontFamily: "monospace",
                        fontWeight: 700,
                        letterSpacing: ".3rem",
                        color: "inherit",
                        textDecoration: "none"
                    }}
                >
                    COMPAS
                </Typography>

                <NavBarLayout />

                <IconButton
                    data-testid="toggle-darkmode"
                    sx={{
                        ml: "auto"
                    }}
                    onClick={toggleDarkMode}
                    color="inherit"
                >
                    {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}

export default Header;
