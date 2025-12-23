import { Box } from "@mui/material";
import MenuNavBarLayout from "./MenuNavBarLayout";
import { NAV_TEXTS } from "../constantes/constantes";

export default function NavBarLayout() {
    return (
        <Box sx={{ display: "flex", gap: 4, ml: 4, alignItems: "center" }}>
            <MenuNavBarLayout props={NAV_TEXTS} />
        </Box>
    );
}
