import { Box } from "@mui/material";
import MenuNavBarLayout from "./MenuNavBarLayout";
import { NAV_TEXTS } from "../constantes/constantes";

interface NavBarLayoutProps {
    darkMode: boolean;
    id?: string;
}

export default function NavBarLayout({ darkMode, id }: Readonly<NavBarLayoutProps>) {
    return (
        <Box 
            id={id}
            component="nav"
            sx={{ display: "flex", gap: 4, ml: 4, alignItems: "center" }}
        >
            <MenuNavBarLayout props={NAV_TEXTS} darkMode={darkMode} />
        </Box>
    );
}