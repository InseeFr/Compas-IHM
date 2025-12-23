import { Box } from "@mui/material";
import MenuNavBarLayout from "./MenuLayout";
import { NAV_TEXTS } from "../constantes/constantes";

export default function NavBarLayout() {
    return (
        <Box>
            <MenuNavBarLayout props={NAV_TEXTS} />
        </Box>
    );
}
