import { Box } from "@mui/material";
import MenuNavBarLayout from "./MenuNavBarLayout";
import { NAV_TEXTS } from "../constantes/constantes";

interface NarBarLayout {
    darkMode: boolean;
}

export default function NavBarLayout({ darkMode }: Readonly<NarBarLayout>) {
    return (
        <Box sx={{ display: "flex", gap: 4, ml: 4, alignItems: "center" }}>
            <MenuNavBarLayout props={NAV_TEXTS} darkMode={darkMode} />
        </Box>
    );
}
