import { Box } from "@mui/material";
import MenuNavBarLayout from "./MenuNavBarLayout";
import { NAV_TEXTS } from "../constantes/constantes";

interface NavBarLayoutProps {
    darkMode: boolean;
}

export default function NavBarLayout({ darkMode }: Readonly<NavBarLayoutProps>) {
    return (
        <Box component="nav" sx={{ display: "flex", gap: 4, ml: 4, alignItems: "center" }}>
            <MenuNavBarLayout props={NAV_TEXTS} darkMode={darkMode} />
        </Box>
    );
}
