import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoInseeLight from "../assets/logo_insee.png";
import LogoInseeDark from "../assets/logo_insee_dark.png";
import NavBarLayout from "../components/NavBarLayout";
import { Link } from "@tanstack/react-router";
import "styles/header.css";

interface HeaderProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export function Header({ darkMode, toggleDarkMode }: Readonly<HeaderProps>) {
    return (
        <AppBar
            role="header"
            className={`header-container ${darkMode ? "dark-mode" : "light-mode"}`}
            data-testid="header"
        >
            <Toolbar className="header-toolbar"  id="navigation">
                <Box className="left-section">
                    <Link to="/" className="logo-container">
                        <img
                            src={darkMode ? LogoInseeDark : LogoInseeLight}
                            alt="Logo INSEE"
                            className="logo-insee"
                            data-testid="header-logo"
                        />
                        <Typography component="h1" className="title-compas" data-testid="header-title">
                            COMPAS
                        </Typography>
                    </Link>
                    <NavBarLayout darkMode={darkMode} />
                </Box>
                <IconButton
                    onClick={toggleDarkMode}
                    color="inherit"
                    aria-label="toggle dark mode"
                    className="toggle-button"
                    data-testid="toggle-darkmode"
                >
                    {darkMode ? (
                        <Brightness7Icon className="toggle-icon" />
                    ) : (
                        <Brightness4Icon className="toggle-icon" />
                    )}
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}

export default Header;
