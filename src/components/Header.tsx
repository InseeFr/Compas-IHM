import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import LogoInseeLight from "../assets/logo_insee.png";
import NavBarLayout from "../pages/NavBarLayout";

export function Header() {
    return (
        <AppBar position="relative" color="inherit">
            <Toolbar>
                <Box
                    component="img"
                    sx={{
                        height: 64
                    }}
                    alt="Insee Logo."
                    src={LogoInseeLight}
                />
                <Typography
                    variant="h6"
                    noWrap
                    component="a"
                    href="/"
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
            </Toolbar>
        </AppBar>
    );
}
export default Header;
